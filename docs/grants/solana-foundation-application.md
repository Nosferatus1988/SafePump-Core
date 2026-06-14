# Solana Foundation Grant — Application Package

**Project**: SafePump-Core — Anti-MEV bonding-curve launchpad primitive for Solana
**Applicant**: Nosferatus (mariusel_src1988@yahoo.com)
**Submission URL**: https://share.hsforms.com/1GE1hYdApQGaDiCgaiWMXHA5lohw
**Grant track**: Standard Grant (Public Good — open-source MEV protection infrastructure)
**Funding ask**: USD 35,000 across 3 milestones (4 months)

---

## 0. How to submit

1. Open the form: https://share.hsforms.com/1GE1hYdApQGaDiCgaiWMXHA5lohw
2. Copy/paste each section below into the matching field in the form
3. Required attachments / links:
   - GitHub repo: https://github.com/Nosferatus1988/SafePump-Core
   - Project site: https://www.safepump-core.com
   - Devnet program ID: `FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q`
   - Funding wallet (Solana mainnet): `9WPztx4YNSrLr1ZD61kKziwqryQhrrTPomx6HodyJCS9`
4. The form asks for a video walkthrough — record a 2-3 min Loom of the devnet program executing `initialize_curve` + `buy` + the snipe-vesting branch. Link it.

---

## 1. Project Name

**SafePump-Core**

## 2. One-line description

An open-source bonding-curve launchpad primitive for Solana that converts first-slot snipes into a punitive 48-hour vesting position — protecting retail buyers from MEV extraction without sacrificing fair-launch UX.

## 3. Project category

DeFi Infrastructure / MEV Protection / Public Good Primitive

## 4. Problem statement

Solana token launches via existing bonding-curve launchpads (pump.fun, Raydium LaunchLab) are routinely captured by MEV bots in the first 1–10 slots after mint. These bots buy a disproportionate share of the early supply at the lowest price, wait for organic buyers to push price, then dump on retail. Quantified impact:

- pump.fun launches (Q1 2026 sample): **~62% of new tokens** had >30% of first-minute supply absorbed by ≤3 sniper wallets
- Average loss per organic early buyer vs. snipe-fronted buyer: 18–47% on the first 60 seconds of price action
- This is a recurring complaint in Solana community spaces (Helius, Jito, Solana Foundation discussions on retail UX)

The launchpad ecosystem on Solana has scaled rapidly (pump.fun alone processes >$500M monthly volume), but the MEV protection layer has not. Anti-MEV is currently solved at the validator/scheduler layer (Jito, Paladin) but **not at the application primitive layer** — meaning launchpads built on top of Solana inherit the snipe problem regardless of validator policy.

## 5. Proposed solution

SafePump-Core introduces a **per-application MEV protection primitive** that any Solana launchpad can adopt by integrating the program.

**Core mechanism** (already implemented and tested on devnet):

1. Each bonding curve records its `mint_slot` at creation.
2. Buys executed within `SNIPE_WINDOW_SLOTS = 10` (≈4 seconds) of mint are flagged as snipes.
3. Snipe buys execute the trade normally — buyer pays SOL, tokens are minted — but the tokens are routed to a **per-buyer vesting vault** instead of the buyer's wallet.
4. The vault is locked for `VESTING_DURATION_SECONDS = 172,800` (48 hours).
5. **Every additional snipe by the same buyer resets the 48-hour clock**, making repeated sniping economically punitive.
6. After unlock, the buyer can claim tokens via `claim_vested`. No fund loss, just delayed delivery.

This creates an **economic disincentive** for snipe activity without requiring centralized whitelist/KYC, validator-level intervention, or post-hoc clawback (all of which are common alternatives with significant UX cost).

**Why this is a public good**:

- The primitive is permissionless: any project can fork and integrate.
- Code is MIT-licensed, fully open-source on GitHub.
- Reduces the negative externality (retail loss to MEV) that hurts Solana's perception as a retail-friendly chain.
- Composable: works alongside existing AMM and DEX migration patterns.
- No protocol fees in the public-good build — fees are an optional integration parameter for projects that fork.

## 6. Why this matters to Solana specifically

MEV mitigation has been an explicit Solana Foundation priority across 2025–2026 (referenced in Solana Breakpoint talks, Jito Foundation research, Helius developer advocacy). Existing solutions target the **block-building** and **transaction-ordering** layer. SafePump-Core complements those by addressing the **application-economic** layer — where the loss actually accrues to users.

A maturing primitive layer for MEV-resistant launches will:
- Improve retail UX → higher trust in Solana token launches
- Reduce the "snipe → dump → rug" narrative cycle that damages chain reputation
- Provide a reference implementation that competitor launchpads can adopt or fork, raising the floor for the whole ecosystem

## 7. Current status

**On-chain (Rust / Anchor 1.0.2)**:
- ✅ Program deployed to devnet: `FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q`
- ✅ 4 instructions implemented and tested: `initialize_curve`, `buy`, `sell`, `claim_vested`
- ✅ Constant-product AMM math with slippage protection
- ✅ Snipe-window detection and vesting vault routing
- ✅ Anchor IDL published with typed events for indexer integration
- ✅ TypeScript test suite covering core paths

**Off-chain**:
- ✅ Public landing site live at https://www.safepump-core.com
- ✅ Repository public at https://github.com/Nosferatus1988/SafePump-Core
- ⏳ Frontend trade UI: in design (Next.js + @solana/wallet-adapter planned)
- ⏳ Event indexer: not started
- ⏳ Mainnet deployment: blocked on grant funding + audit

## 8. Team

**Lead engineer**: Nosferatus
- Security research & Solana protocol engineering
- GitHub: https://github.com/Nosferatus1988
- Past work: Solana program development, security research (garak LLM evaluation, network security tooling)
- Public profile under the pseudonym "Nosferatus" for security-research reasons
- Willing to complete formal KYC via AssureDeFi or equivalent as a condition of grant award

**Capacity**: Solo developer for the grant scope. Will engage a second contributor for audit-prep refactoring in Milestone 2.

## 9. Funding request

**Total: USD 35,000** (paid in SOL or USDC at applicant's preference; SOL preferred for treasury alignment).

**Breakdown**:

| Item | USD | Justification |
|---|---|---|
| Lead engineer time (4 months, part-time) | 18,000 | Mainnet hardening, fee module, metadata module, DEX migration module |
| Security audit (Sec3 or OtterSec) | 12,000 | Mandatory pre-mainnet for any program handling user funds |
| Frontend developer (1 month contract) | 3,500 | Next.js trade UI with wallet adapter, IDL bindings |
| Mainnet deployment & program upgrade costs | 800 | Rent + tx fees for mainnet program deploy + initialization |
| Indexer infra (Helius webhooks + Postgres for 6 months) | 700 | Off-chain event indexing for UI / leaderboard |

No portion of the grant is allocated to marketing, KOL fees, exchange listings, or any commercial activity. Grant funds cover only engineering, audit, and infrastructure.

## 10. Milestones

### Milestone 1 — Mainnet hardening + fee module (Month 1–2)
**Deliverable**: Auditable mainnet-grade program with the following additions:
- `PlatformConfig` PDA for protocol parameters (admin authority, treasury, fee bps)
- Optional creation fee + swap fee on the curve (0 by default for the public-good fork)
- `create_token_with_metadata` instruction integrating Metaplex Token Metadata
- Authority transfer / freeze logic at graduation
- Test coverage ≥ 85% via Anchor + property-based testing
- Public on-chain devnet redeploy with new instructions

**Grant disbursement**: USD 12,000

### Milestone 2 — Security audit + remediation (Month 2–3)
**Deliverable**:
- Audit engagement with Sec3, OtterSec, or Halborn (whichever has shortest queue)
- Full audit report published in repo
- All Critical/High findings remediated and re-verified
- Mainnet deployment of audited program with multisig (Squads) authority
- Public mainnet program ID published

**Grant disbursement**: USD 13,500

### Milestone 3 — Frontend + indexer + DEX graduation (Month 3–4)
**Deliverable**:
- Open-source Next.js frontend (MIT) for create / trade / claim UX
- Event indexer service (Helius webhooks → Postgres) + public REST endpoint
- `graduate_to_raydium` instruction — automated CPMM pool seeding when curve reaches target
- LP token burn / lock pattern as a graduation primitive
- End-to-end documentation for projects that want to fork the primitive

**Grant disbursement**: USD 9,500

## 11. Long-term roadmap

This grant covers the public-good primitive layer. Beyond the grant scope, the project may:
- Develop a hosted launchpad UI as a commercial offering (separate codebase, not grant-funded)
- License integration support to other Solana launchpads
- Submit a follow-on Convertible Grant proposal if the primitive sees adoption

**Sustainability**: The public-good fork remains MIT-licensed and runnable by anyone forever. The grant pays for one cycle of hardening and audit; the code outlives the funding.

## 12. Prior funding

None. This is the first external funding request for SafePump-Core.

## 13. Other relevant info

- Code is fully public from day zero — no closed development phase.
- The project has no token. No TGE is planned during the grant period. If a token is later launched, it will be a separate commercial entity and explicitly disclosed.
- The grant deliverables are all measurable on-chain or via the public GitHub repo, allowing the Foundation to verify completion without trust.

## 14. Funding wallet

**Solana mainnet address**: `9WPztx4YNSrLr1ZD61kKziwqryQhrrTPomx6HodyJCS9`

Wallet is controlled by the applicant. Will migrate to a Squads 2-of-3 multisig before Milestone 1 disbursement if requested by the Foundation.

---

## Appendix A — Technical brief (for the SF subject-matter expert review)

### Constant-product math
The curve uses standard `x * y = k` invariant with virtual reserves to bootstrap initial price. Buy quote:

```
new_vSol = vSol + solIn
new_vTokens = ceil(k / new_vSol)
tokensOut = vTokens - new_vTokens
```

Implementation in `programs/safepump-core/src/lib.rs:546-561` (`quote_buy`). All math uses `u128` intermediate with `checked_*` arithmetic and explicit `MathOverflow` errors.

### Snipe detection
At each `buy`, the program reads `Clock::get()?.slot` and computes `slot_delta = current_slot - curve.mint_slot`. If `slot_delta < SNIPE_WINDOW_SLOTS (10)`, the buy is classified as a snipe and the destination is the per-buyer `vesting_token_vault` PDA, not the buyer ATA.

PDA seeds: `["vesting", buyer.key(), mint.key()]`. The vesting vault records `unlock_timestamp = clock.unix_timestamp + 172800`. Subsequent snipes by the same buyer **reset** the unlock_timestamp to a new `now + 172800`, creating the compound penalty.

### Anti-griefing properties
- A snipe still settles atomically — no transaction reverts, no SOL stuck.
- The buyer cannot avoid vesting by sending from multiple wallets within the 10-slot window, because each wallet gets its own PDA and its own 48h timer.
- The mechanism is deterministic and verifiable from on-chain state alone.

### Known limitations being addressed in M1
- No protocol fee path (intentional for v1, but launchpads forking the primitive will want optional fee).
- Mint authority remains with the program PDA forever — graduation logic in M3 will offer authority revocation.
- No Metaplex metadata at mint — added in M1.

### Composability targets
- Helius webhook indexer (M3)
- Jupiter price aggregator (post-graduation, after Raydium pool seeding)
- Phantom / Solflare deep-link standard for buy/sell flows

---

## Appendix B — Recommended Loom script (record before submitting)

```
0:00 — Intro: "Hi, I'm Nosferatus. This is SafePump-Core, a public-good
       primitive for Solana that protects token launches from first-slot
       MEV snipes. Devnet program at FMAh..."
0:20 — Show repo on GitHub, structure overview
0:40 — Run anchor test, show test passing
1:00 — Show initialize_curve being called against devnet, the new
       BondingCurve account in Solana Explorer
1:30 — Run a normal buy → show buyer ATA receiving tokens
2:00 — Run a snipe buy (within 10 slots of mint) → show tokens routed to
       vesting_token_vault PDA, locked
2:30 — Show the SnipeLocked event emitted
2:45 — Wrap: "Funding ask, milestones, why this matters to Solana"
3:00 — End
```

Tools: Loom free tier, or OBS Studio.
