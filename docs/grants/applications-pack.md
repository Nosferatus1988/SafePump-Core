# SafePump-Core — Funding & Help Applications Pack

Submit each application below. Total time required: ~3-4 hours.
Realistic expected return: 1-2 acceptances out of 7 in 30-60 days.

---

## Index

1. [Solana Foundation Grant](#1-solana-foundation-grant) — $10-50k (see `solana-foundation-application.md`) ✅ READY
2. [Jito Foundation MEV Grant](#2-jito-foundation-mev-grant) — $5-30k
3. [Helius Builder Program](#3-helius-builder-program) — credits + ~$5k
4. [Superteam Balkans (Romania)](#4-superteam-balkans) — bounties + mentors
5. [Colosseum Hackathon](#5-colosseum-hackathon) — $5k-50k prize possible
6. [Encode Club Solana Track](#6-encode-club-solana-track) — free mentorship + grants
7. [GitHub OSS Contributors](#7-github-oss-contributors-good-first-issues) — free dev help

After each — what to do NEXT (where to paste, what attachments, etc).

---

## 1. Solana Foundation Grant

✅ **Already prepared** in `docs/grants/solana-foundation-application.md`

**URL**: https://share.hsforms.com/1GE1hYdApQGaDiCgaiWMXHA5lohw
**Ask**: $35,000 across 3 milestones
**Status**: Open submissions, rolling
**Decision time**: 3-4 weeks

---

## 2. Jito Foundation MEV Grant

**Why this is the BEST fit for SafePump**: Jito is THE MEV organization on Solana. SafePump-Core is an application-layer MEV protection primitive. Direct alignment.

**Where to find it**:
- Main site: https://www.jito.network
- Foundation: https://www.jitofoundation.org
- Twitter for outreach: `@jito_sol`, `@buffalu__`
- Apply via the contact form on jitofoundation.org or via direct outreach

**What to submit** — paste below into their contact / proposal form:

```
Subject: SafePump-Core — Application-layer MEV protection primitive for Solana launches

Hi Jito team,

I'm building SafePump-Core, a public-good Anchor program that addresses
MEV extraction at the application layer where Jito's current solutions
don't reach: bonding-curve token launches.

Problem
-------
Solana token launches (pump.fun, Raydium LaunchLab, similar) are
routinely captured in the first 1-10 slots by snipers who absorb
30-60% of early supply and dump on retail. Block-builder-level MEV
mitigation doesn't address this — the snipe is economically rational
within fair ordering. The loss happens to the user, not to the
network.

Solution
--------
A drop-in bonding-curve primitive that detects snipes (buys within
SNIPE_WINDOW_SLOTS of mint) and routes the purchased tokens into a
per-buyer vesting vault locked for 48 hours. Repeated snipes by the
same wallet reset the timer (compound penalty).

The mechanism is permissionless, deterministic, doesn't require
whitelist/KYC, and is composable with Jito's bundle infrastructure.

Status
------
- Devnet program live: FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q
- Open source MIT: github.com/Nosferatus1988/SafePump-Core
- Site: safepump-core.com
- Tests passing on devnet

Funding ask
-----------
$20,000 (or SOL equivalent) for:
- Mainnet hardening + protocol fee module ($8k)
- Security audit ($10k)
- Public integration documentation so other launchpads can adopt the
  primitive ($2k)

Outcome
-------
Open-source primitive any Solana launchpad can fork. Reference
implementation that complements (does not compete with) Jito's
block-level MEV protection by addressing the application-economic
layer.

Happy to share a 3-minute Loom walkthrough on request.

— Nosferatus
mariusel_src1988@yahoo.com
GitHub: Nosferatus1988
```

**Backup plan if no formal grant form**: tweet `@jito_sol` with a link to the repo + 1-line ask. Their team is approachable on Twitter. Be specific, technical, no hype.

---

## 3. Helius Builder Program

**Why apply**: Helius offers free RPC credits + sometimes small grants for Solana builders. RPC credits alone are worth $50-500/month and you'll need them for indexer + frontend.

**Where**:
- Site: https://www.helius.dev
- Builder program: https://www.helius.dev/builders (or look for "Helius for Builders" in their docs)
- Email: developers@helius.dev (or whatever current contact)
- Twitter: `@heliuslabs`, `@0xMert_`

**What to submit** (email or form):

```
Subject: SafePump-Core — Application for Helius Builder Program

Hi Helius team,

I'm a solo developer building SafePump-Core, an open-source bonding-curve
launchpad primitive with first-slot anti-MEV vesting, deployed on devnet
and preparing for mainnet.

Repo: https://github.com/Nosferatus1988/SafePump-Core
Site: https://www.safepump-core.com
Devnet program: FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q

What I'm requesting:
- Helius RPC credits for devnet/mainnet testing
- Helius webhook quota for the event indexer (Milestone 3 of the project)
- Access to the builder community / Discord channel

What I'm planning to build with Helius:
- Event indexer (CurveInitialized / BuyExecuted / SellExecuted / SnipeLocked)
  ingesting Helius webhooks into Postgres
- Real-time bonding curve state via Helius getProgramAccounts
- Mainnet program calls via Helius staked RPC for landing rate

I'm happy to attribute Helius prominently in the docs/UI and contribute
back any open-source webhook adapter / indexer schema I build.

— Nosferatus
mariusel_src1988@yahoo.com
```

---

## 4. Superteam Balkans

**What it is**: Solana developer community covering Eastern Europe / Balkans (incl. Romania). They run bounties (pay in USDC/SOL), have mentors, and connect to Solana Labs directly.

**How to join**:
1. Go to https://earn.superteam.fun (Superteam Earn — the bounty board)
2. Sign up with Twitter or GitHub
3. Complete profile — list your skills (Rust, Anchor, TypeScript, etc.)
4. Join Superteam Balkans Discord (link on the site or via Twitter `@SuperteamBalkans` if it exists)
5. Browse open bounties — apply to 2-3 that match your skills (you can earn $100-2000/bounty while building reputation)
6. Once you have reputation, post YOUR OWN project for community help

**Pitch for help on Superteam**:

```
Hey Superteam — I'm building SafePump-Core, an open-source anti-MEV
bonding curve launchpad primitive on Solana. Devnet live, mainnet
pending audit. Looking for:

- Anchor reviewer (1-2 hours, optional swap fee feedback) — willing to
  pay in token allocation post-launch
- Next.js / wallet-adapter dev for frontend MVP — same deal or small
  USDC payout when funded

Repo: github.com/Nosferatus1988/SafePump-Core
DM if interested.
```

---

## 5. Colosseum Hackathon

**What it is**: The main Solana hackathon. Runs ~3 times/year. Prizes $250k+ total. **Multiple tracks each season — DeFi/Infrastructure are always present.**

**Where**:
- Site: https://www.colosseum.com (NOT .org)
- Past hackathons: Renaissance, Radar, Eternal, Renaissance 2
- Registration usually opens 4-6 weeks before kickoff

**How to use it**:
1. Register the moment a new hackathon opens
2. **Submit SafePump-Core as your project** — it's already partially built which IS allowed (they call it "active project / existing repo")
3. Use the hackathon period to:
   - Add fee module
   - Add metadata
   - Build the frontend MVP
   - Write integration docs
4. Submit at the end with demo video

**Pitch for hackathon submission** (use this in their form):

```
Project: SafePump-Core
Track: DeFi Infrastructure / MEV
Pitch (1 paragraph):
SafePump-Core is the first application-layer anti-MEV primitive for
Solana token launches. Where existing MEV solutions operate at the
validator/scheduler level, SafePump intervenes in the bonding-curve
economic model itself: snipes within the first 10 slots are detected
on-chain and routed into a 48-hour vesting vault per buyer, with a
compound penalty for repeated sniping. The result is the first launch
primitive on Solana where the economic incentive to snipe is
neutralized at the application level, without whitelist or KYC. Open
source MIT, devnet live, audit-ready.

Demo: [link to Loom]
Repo: github.com/Nosferatus1988/SafePump-Core
```

**Even if you don't win**, finalist status alone is enough credibility signal for grants + investors.

---

## 6. Encode Club Solana Track

**What it is**: Free Solana developer bootcamps with mentors, demo days, and connections to Solana Labs / VCs. Cohorts run 4-8 weeks.

**Where**:
- https://www.encode.club
- Solana-specific track usually 2-3 times/year
- Free, application-based

**How to use it**:
- Sign up for the next Solana cohort
- During the cohort, polish SafePump-Core
- Final demo day: present in front of mentors + VCs
- Many cohort participants get small grants ($1-5k) for top projects

**Application pitch (short, paste in form)**:

```
I'm Nosferatus, building SafePump-Core — an anti-MEV bonding-curve
launchpad primitive on Solana (Anchor/Rust), already on devnet.
I want to use the cohort to:
- Refactor the program into modular form (state, instructions, errors)
- Add Metaplex metadata integration
- Build a Next.js frontend with wallet-adapter
- Get feedback from mentors on the protocol fee module design

Solo dev, 4-8 hours/week available, no prior cohort experience.
Repo: github.com/Nosferatus1988/SafePump-Core
```

---

## 7. GitHub OSS Contributors (Good First Issues)

**What it is**: Free way to attract contributors who'll write code for you in exchange for credit + portfolio.

**How to do it** (steps in the repo, not external app):

Open these GitHub issues on `Nosferatus1988/SafePump-Core` with the label `good-first-issue`:

```markdown
Title: [good-first-issue] Add cargo-audit + clippy to CI
Body:
We don't have CI running yet. Open a PR that adds:
- GitHub Actions workflow at .github/workflows/rust.yml
- Steps: cargo fmt --check, cargo clippy -D warnings, cargo audit
- Cache cargo deps
Estimated time: 30-60 min. Beginner-friendly.
```

```markdown
Title: [good-first-issue] Split lib.rs into modules
Body:
The program is currently a single lib.rs (617 lines). Refactor into:
- src/state/mod.rs (BondingCurve, VestingVault account structs)
- src/instructions/{initialize_curve.rs, buy.rs, sell.rs, claim_vested.rs}
- src/errors.rs
- src/lib.rs (declare_id! + use statements only)
Keep behavior identical. Tests must still pass.
```

```markdown
Title: [good-first-issue] Add property-based tests for quote_buy / quote_sell
Body:
The constant-product math in `quote_buy` and `quote_sell` (lib.rs:546-573)
should be invariant under round-trip:
- buy(s) then sell(t) should leave the curve close to its start state
- the invariant k = vSol * vTokens should be preserved within rounding
Use proptest or fast-check. Add tests to tests/ directory.
```

```markdown
Title: [good-first-issue] Document the snipe-vesting mechanism in docs/
Body:
Write docs/MECHANICS.md explaining:
- How SNIPE_WINDOW_SLOTS is detected
- Why the compound penalty (reset timer) is anti-griefing
- Edge cases (multiple snipes, partial unlock, exit via sell pre-snipe)
Include diagrams (ASCII or mermaid).
```

```markdown
Title: [good-first-issue] Build a minimal CLI in TypeScript to call all instructions
Body:
Create cli/ directory with a TypeScript CLI using @coral-xyz/anchor:
- init-curve
- buy
- sell
- claim-vested
Read program ID from Anchor.toml, accept all params via flags.
```

Then tweet:
> "Just opened 5 good-first-issues on @SafePump_Core (Anchor/Rust, Solana anti-MEV primitive). Open source, MIT, devnet live. https://github.com/Nosferatus1988/SafePump-Core/issues"

And cross-post on r/solana, Solana Discord #builders, Anchor Discord #help.

**Expected outcome**: 1-3 PRs in 2-4 weeks if the repo is visible.

---

## Bonus channels (5-min effort each)

### Solana Stack Exchange
https://solana.stackexchange.com — when you hit a wall, ask there. The community is responsive (often within hours).

### Anchor Discord
https://discord.gg/anchor (or via Coral repo) — official Anchor framework support. Direct devs reachable.

### Solana DevRel Twitter
Follow & engage: `@solana_devs`, `@helius_dev`, `@jito_labs`, `@buffalu__`, `@0xMert_`, `@aeyakovenko`, `@toly_xbt`. Reply with technical value, don't shill.

### r/solana
Cross-post your milestones (mainnet launch, audit, hackathon entry). Don't shill, share progress.

---

## Suggested execution order (10 days)

| Day | Task | Output |
|---|---|---|
| 1 | Submit Solana Foundation Grant (paste from `solana-foundation-application.md`) | Application ID |
| 2 | Submit Jito grant outreach (email + tweet) | Email sent, tweet posted |
| 2 | Submit Helius Builder Program | Application sent |
| 3 | Open 5 GitHub good-first-issues + tweet | Issues live |
| 3-4 | Sign up Superteam Earn, apply to 1-2 bounties | Profile + applications |
| 5 | Apply Encode Club next Solana cohort | Application sent |
| 6-10 | Record demo Loom (re-use for grants + hackathon) | Loom URL |
| 10+ | Wait for replies, polish code, refactor `lib.rs`, write tests | Code progress |

---

## Tracking

Keep a simple list in `docs/grants/STATUS.md` with one line per application:

```
2026-06-14  SF Grant         submitted   waiting (3w decision)
2026-06-15  Jito             email sent  waiting
2026-06-15  Helius Builders  applied     waiting
2026-06-16  Superteam Earn   joined      bounty applied (Anchor review)
2026-06-17  Encode Club      applied     cohort starts ?
```

Reply rate realistic: 30-50% will respond, 10-20% will turn into a yes / partial yes / next-round.
