import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
} from "@solana/spl-token";
import { SafepumpCore } from "../target/types/safepump_core";
import { assert } from "chai";

const SNIPE_WINDOW_SLOTS = 10;
const LAMPORTS = new BN(anchor.web3.LAMPORTS_PER_SOL);
const VIRTUAL_SOL_RESERVES = new BN(30).mul(LAMPORTS);
const VIRTUAL_TOKEN_RESERVES = new BN("1073000000000000");
const TOKEN_SUPPLY = new BN("800000000000000");

describe("safepump-core", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SafepumpCore as Program<SafepumpCore>;
  const creator = (provider.wallet as anchor.Wallet).payer;

  async function confirm(signature: string) {
    const blockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction(
      {
        signature,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
      },
      "confirmed",
    );
  }

  async function fund(keypair: Keypair, sol = 0.75) {
    const lamports = Math.floor(sol * anchor.web3.LAMPORTS_PER_SOL);

    try {
      const signature = await provider.connection.requestAirdrop(
        keypair.publicKey,
        lamports,
      );
      await confirm(signature);
      return;
    } catch (error) {
      const transaction = new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: creator.publicKey,
          toPubkey: keypair.publicKey,
          lamports,
        }),
      );
      await provider.sendAndConfirm(transaction);
    }
  }

  async function advanceSlots(count: number) {
    const targetSlot = (await provider.connection.getSlot("confirmed")) + count;

    while ((await provider.connection.getSlot("confirmed")) < targetSlot) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  function curveAddresses(mint: PublicKey) {
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding_curve"), mint.toBuffer()],
      program.programId,
    );
    const [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint.toBuffer()],
      program.programId,
    );

    return { bondingCurve, tokenVault };
  }

  function buyerAddresses(mint: PublicKey, buyer: PublicKey) {
    const [vestingVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting"), buyer.toBuffer(), mint.toBuffer()],
      program.programId,
    );
    const [vestingTokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_tokens"), buyer.toBuffer(), mint.toBuffer()],
      program.programId,
    );
    const buyerAta = getAssociatedTokenAddressSync(mint, buyer);

    return { buyerAta, vestingVault, vestingTokenVault };
  }

  async function createCurve(graduationSolTarget = new BN(0)) {
    const mint = Keypair.generate();
    const { bondingCurve, tokenVault } = curveAddresses(mint.publicKey);

    await program.methods
      .initializeCurve(
        VIRTUAL_SOL_RESERVES,
        VIRTUAL_TOKEN_RESERVES,
        TOKEN_SUPPLY,
        graduationSolTarget,
      )
      .accounts({
        creator: creator.publicKey,
        mint: mint.publicKey,
        bondingCurve,
        tokenVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    return { mint, bondingCurve, tokenVault };
  }

  async function buy(
    mint: PublicKey,
    bondingCurve: PublicKey,
    tokenVault: PublicKey,
    buyer: Keypair,
    solAmount: BN,
  ) {
    const { buyerAta, vestingVault, vestingTokenVault } = buyerAddresses(
      mint,
      buyer.publicKey,
    );

    await program.methods
      .buy(solAmount, new BN(0))
      .accounts({
        buyer: buyer.publicKey,
        mint,
        bondingCurve,
        tokenVault,
        buyerTokenAccount: buyerAta,
        vestingVault,
        vestingTokenVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    return { buyerAta, vestingVault, vestingTokenVault };
  }

  it("initializes the bonding curve and snipes are time-locked", async () => {
    const buyer = Keypair.generate();
    await fund(buyer);
    const curve = await createCurve();

    const accounts = await buy(
      curve.mint.publicKey,
      curve.bondingCurve,
      curve.tokenVault,
      buyer,
      new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL),
    );

    const vault = await program.account.vestingVault.fetch(
      accounts.vestingVault,
    );
    assert.ok(vault.amount.gt(new BN(0)), "snipe should be locked");

    const vaultTokenAcct = await getAccount(
      provider.connection,
      accounts.vestingTokenVault,
    );
    assert.equal(
      vaultTokenAcct.amount.toString(),
      vault.amount.toString(),
      "vesting token vault balance must match recorded amount",
    );
  });

  it("allows normal buyers to sell back into the curve before graduation", async () => {
    const buyer = Keypair.generate();
    await fund(buyer);
    const curve = await createCurve();

    await advanceSlots(SNIPE_WINDOW_SLOTS + 1);
    const accounts = await buy(
      curve.mint.publicKey,
      curve.bondingCurve,
      curve.tokenVault,
      buyer,
      new BN(0.5 * anchor.web3.LAMPORTS_PER_SOL),
    );

    const tokenAccountBefore = await getAccount(
      provider.connection,
      accounts.buyerAta,
    );
    assert.ok(tokenAccountBefore.amount > 0n, "buyer should receive tokens");

    const curveBefore = await program.account.bondingCurve.fetch(
      curve.bondingCurve,
    );
    const sellAmount = new BN((tokenAccountBefore.amount / 2n).toString());

    await program.methods
      .sell(sellAmount, new BN(1))
      .accounts({
        seller: buyer.publicKey,
        mint: curve.mint.publicKey,
        bondingCurve: curve.bondingCurve,
        tokenVault: curve.tokenVault,
        sellerTokenAccount: accounts.buyerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    const tokenAccountAfter = await getAccount(
      provider.connection,
      accounts.buyerAta,
    );
    const curveAfter = await program.account.bondingCurve.fetch(
      curve.bondingCurve,
    );

    assert.equal(
      tokenAccountAfter.amount.toString(),
      (tokenAccountBefore.amount - BigInt(sellAmount.toString())).toString(),
    );
    assert.ok(
      curveAfter.realSolReserves.lt(curveBefore.realSolReserves),
      "curve SOL reserves should decrease after sell",
    );
  });

  it("marks a curve complete when the graduation target is reached", async () => {
    const buyer = Keypair.generate();
    await fund(buyer);
    const graduationTarget = new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
    const curve = await createCurve(graduationTarget);

    await advanceSlots(SNIPE_WINDOW_SLOTS + 1);
    await buy(
      curve.mint.publicKey,
      curve.bondingCurve,
      curve.tokenVault,
      buyer,
      graduationTarget,
    );

    const curveAccount = await program.account.bondingCurve.fetch(
      curve.bondingCurve,
    );
    assert.equal(curveAccount.complete, true);
  });
});
