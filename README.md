# SafePump-Core

Anti-MEV bonding-curve launchpad on Solana, written in Anchor/Rust.

## Idea

Token launches on Solana get sniped in the first slot by MEV bots that buy a
huge chunk of the supply, wait for organic buyers to pump the price, and dump.
SafePump punishes that pattern by routing any buy that lands inside a tight
post-launch window into a time-locked vault.

- **Snipe window:** first `SNIPE_WINDOW_SLOTS = 10` slots after `initialize_curve`
  (~4 seconds at 400ms target slot time).
- **Penalty:** tokens bought inside that window go to a `VestingVault` PDA
  instead of the buyer's wallet, locked for `VESTING_DURATION_SECONDS = 48 * 3600`.
- **Repeat sniping compounds:** every snipe by the same wallet resets the
  unlock clock to `now + 48h`.

Honest buyers a few seconds later get tokens directly to their ATA.

## Bonding curve

Virtual constant-product, pump.fun style:

```
tokens_out = vtok - (vsol * vtok) / (vsol + sol_in)
```

`virtual_sol_reserves` and `virtual_token_reserves` are passed at init and set
the starting price; `real_*` track actual liquidity.

## Program layout

| Account                | Seeds                                              | Purpose                                  |
|------------------------|----------------------------------------------------|------------------------------------------|
| `BondingCurve`         | `["bonding_curve", mint]`                          | Curve state + `mint_slot` for snipe check |
| `token_vault`          | `["token_vault", mint]`                            | Token reserve owned by `BondingCurve`     |
| `VestingVault`         | `["vesting", buyer, mint]`                         | Per-buyer locked-token bookkeeping        |
| `vesting_token_vault`  | `["vesting_tokens", buyer, mint]`                  | Token account holding the locked tokens   |

SOL liquidity is held inside the `BondingCurve` PDA's lamports.

## Instructions

- `initialize_curve(virtual_sol_reserves, virtual_token_reserves, token_supply)` —
  creates mint, curve, token vault; mints `token_supply` into the vault.
- `buy(sol_amount, min_tokens_out)` — quotes against the curve, sends SOL to the
  curve PDA, routes tokens to buyer ATA or to vesting vault if sniped.
- `claim_vested()` — beneficiary withdraws after `unlock_timestamp`.

## Design notes & known limitations

- Slot time on Solana is targeted at 400ms but not guaranteed; the 10-slot
  window is a heuristic, not a precise 4-second SLA.
- `init_if_needed` is enabled in `programs/safepump-core/Cargo.toml`. Make sure
  callers can't grief by re-initializing — protected here by PDA seeds + the
  beneficiary-default check.
- No `sell` instruction yet. Add the inverse curve math + reverse SOL transfer
  via lamport manipulation when needed.
- No graduation logic yet (move liquidity to Raydium once `complete = true`).
- `declare_id!` uses a placeholder. Run `anchor keys sync` after the first build
  to inject the real program ID into source + `Anchor.toml`.

## Build / test

```
# Install Solana CLI: https://docs.solanalabs.com/cli/install
# Install Anchor: cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.30.1 && avm use 0.30.1

yarn install
anchor build
anchor test
```
