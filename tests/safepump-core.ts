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

describe("safepump-core", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SafepumpCore as Program<SafepumpCore>;

  const creator = (provider.wallet as anchor.Wallet).payer;
  const mintKp = Keypair.generate();
  const buyer = Keypair.generate();

  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve"), mintKp.publicKey.toBuffer()],
    program.programId
  );
  const [tokenVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_vault"), mintKp.publicKey.toBuffer()],
    program.programId
  );
  const [vestingVault] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("vesting"),
      buyer.publicKey.toBuffer(),
      mintKp.publicKey.toBuffer(),
    ],
    program.programId
  );
  const [vestingTokenVault] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("vesting_tokens"),
      buyer.publicKey.toBuffer(),
      mintKp.publicKey.toBuffer(),
    ],
    program.programId
  );
  const buyerAta = getAssociatedTokenAddressSync(
    mintKp.publicKey,
    buyer.publicKey
  );

  it("initializes the bonding curve and snipes are time-locked", async () => {
    // Fund buyer
    const airdropSig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    await program.methods
      .initializeCurve(
        new BN(30 * anchor.web3.LAMPORTS_PER_SOL),
        new BN(1_073_000_000_000_000),
        new BN(800_000_000_000_000)
      )
      .accounts({
        creator: creator.publicKey,
        mint: mintKp.publicKey,
        bondingCurve,
        tokenVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKp])
      .rpc();

    // Buy immediately — should land inside the snipe window
    await program.methods
      .buy(new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL), new BN(0))
      .accounts({
        buyer: buyer.publicKey,
        mint: mintKp.publicKey,
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

    const vault = await program.account.vestingVault.fetch(vestingVault);
    assert.ok(vault.amount.gt(new BN(0)), "snipe should land tokens in vesting vault");
    const vaultTokenAcct = await getAccount(provider.connection, vestingTokenVault);
    assert.equal(
      vaultTokenAcct.amount.toString(),
      vault.amount.toString(),
      "vesting token vault balance must match recorded amount"
    );
  });
});
