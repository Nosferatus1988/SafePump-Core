# Contributor Recruitment Pack

Repo is now contributor-ready (LICENSE, CONTRIBUTING.md, SECURITY.md, issue/PR templates, badges, topics, Discussions enabled). Time to **announce in the channels where Solana devs live**.

---

## ⚡ TL;DR action list (45 min)

1. Tweet from your personal/project account → [template below](#1-twitter)
2. Post in Solana Discord `#showcase` or `#looking-for-collab` → [template](#2-solana-discord)
3. Post in Anchor Discord `#help` (only if they have a showcase channel — otherwise skip) → [template](#3-anchor-discord)
4. Cross-post on r/solana → [template](#4-rsolana)
5. Cross-post on r/rust (focus on the Anchor angle) → [template](#5-rrust)
6. Open Hacker News "Show HN" → [template](#6-hacker-news)
7. Submit to awesome-solana list → [steps](#7-awesome-solana)
8. (Optional) Spawn a Discord server for the project → [steps](#8-project-discord)

Total expected: 1-5 contributors signaling interest within 7 days if you do all 8.

---

## 1. Twitter

Post this from `@SafePumpFi` (or whatever handle you create — `@SafePump` is taken):

```
🛠️ SafePump-Core is open source and looking for contributors.

It's an anti-MEV bonding curve primitive on @solana: first-slot snipes get routed into a 48h vesting vault with a compound penalty for repeat sniping.

Anchor/Rust. MIT licensed. Devnet live.

5 good-first-issues open: CI, refactor, prop tests, docs, CLI.

PRs welcome 👇
https://github.com/Nosferatus1988/SafePump-Core
```

Then a follow-up thread of 3-5 tweets explaining the mechanism in detail (you can rip the text from the README "Anti-MEV model" section).

Tag for visibility: `@solana` `@anchorlang` `@solana_devs` `@SuperteamBalkan` (if exists)

---

## 2. Solana Discord

Server: official Solana Tech Discord (https://discord.gg/solana) — find channel `#looking-for-collab`, `#showcase`, or `#builders` depending on what's open.

```
👋 Hey builders — opening SafePump-Core for contributors.

It's an anti-MEV bonding curve primitive in Anchor. The idea: tokens bought
within the first 10 slots of a launch get routed into a per-buyer vesting
vault locked for 48h, with the timer resetting every time the same wallet
snipes again (compound penalty).

Where I am:
- Devnet program live, 4 instructions tested
- Open source MIT, public from day 1

Where I need help:
- Anchor reviewer for the upcoming fee module
- TypeScript dev for the wallet-adapter trade UI
- Anyone who wants to take a good-first-issue (CI, refactor, prop tests, docs, CLI)

Solo dev, half-time on this. Looking for 2-4 contributors to make it real
before mainnet. Credit, possible token allocation post-launch.

Repo: https://github.com/Nosferatus1988/SafePump-Core
Issues: https://github.com/Nosferatus1988/SafePump-Core/issues

DM or thread reply if interested.
```

---

## 3. Anchor Discord

If they have a `#showcase`:

```
Sharing SafePump-Core — an Anchor/Rust bonding curve launchpad with an
anti-MEV vesting mechanism (first-slot snipes routed into a per-buyer
48h vault, compound penalty on repeat).

Devnet program: FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q
Repo: github.com/Nosferatus1988/SafePump-Core

5 good-first-issues open for new Anchor devs:
- CI setup (clippy + cargo-audit)
- Refactor lib.rs into modules
- Property-based tests for curve math
- Docs for the vesting mechanism
- TypeScript CLI

If you've been wanting to learn Anchor on a real codebase, this is a
good entry point. PRs welcome.
```

Otherwise just stick to `#help` for technical questions, don't spam.

---

## 4. r/solana

Reddit post (use the "Project" or "Show & Tell" flair):

**Title**:
```
[Open Source / Looking for Contributors] SafePump-Core — anti-MEV bonding curve primitive for Solana launches
```

**Body**:
```
Hey r/solana,

I'm building SafePump-Core, an open source Anchor program that addresses
a specific MEV problem: first-slot snipes on token launches.

How it works:
- When a bonding curve is initialized, the program records the mint slot.
- Any buy within the first 10 slots (~4 seconds) of mint is flagged as a
  snipe and routed into a per-buyer vesting vault, locked for 48 hours.
- Every additional snipe by the same wallet RESETS the 48h timer
  (compound penalty for repeated sniping).
- Normal buys after the snipe window go straight to the wallet.

This is a complement to validator-layer MEV protection (Jito), not a
replacement — it intervenes in the economic model where the loss actually
hits retail.

Status:
- Devnet program live: FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q
- Source open MIT: github.com/Nosferatus1988/SafePump-Core
- Site: safepump-core.com

Looking for:
- Anchor reviewers
- TypeScript / frontend devs for the trade UI
- Anyone interested in protocol design, tests, docs

5 good-first-issues are open if you want a scoped entry point.

Happy to answer technical questions in comments.
```

---

## 5. r/rust

Focus on the Rust / safety angle, not the crypto pump angle (the Rust sub
is skeptical of crypto generally).

**Title**:
```
[Open Source] Anchor program with constant-product math + anti-griefing
vesting — looking for Rust feedback
```

**Body**:
```
I've been building SafePump-Core, an Anchor (Solana smart contract
framework) program in Rust. It implements a constant-product bonding
curve (k = x * y) with one twist: any buyer who trades within the first
N slots of token creation has their tokens routed into a time-locked
vault, with the timer reset on every repeat snipe.

I'm specifically looking for Rust eyes on:
- u128 arithmetic with checked_* (math.rs)
- PDA seed design for the vesting vault (one per buyer/mint pair)
- Whether the round-trip invariant of quote_buy / quote_sell is provable
  via property-based testing

Code is MIT, ~600 LOC of Rust, single program file (refactor into
modules is one of the open issues).

Repo: github.com/Nosferatus1988/SafePump-Core

Constructive critique welcome. No tokens, no shilling — just a Rust
project that happens to run on Solana.
```

---

## 6. Hacker News

Show HN post (do this AFTER you have at least 1-2 stars on the repo,
because HN judges by repo quality):

**Title**:
```
Show HN: SafePump-Core — anti-MEV bonding curve primitive for Solana
```

**URL**: https://github.com/Nosferatus1988/SafePump-Core

**First comment** (post immediately after submission):
```
Author here. SafePump-Core is an Anchor program addressing first-slot
sniping on token launches: buys within the first 10 slots of mint are
routed into a 48-hour vesting vault, with a compound penalty that resets
the timer on every repeat snipe by the same wallet.

It's a complement to validator-level MEV mitigation (Jito), targeting
the application-economic layer instead of the block-building layer.

Devnet program live, source MIT, looking for contributors. Happy to
explain the mechanism in detail or take feedback on the design.
```

---

## 7. Awesome-Solana

Submit a PR to the [awesome-solana](https://github.com/paul-schaaf/awesome-solana) list (or whichever fork is most active in 2026).

Add a line under "DeFi / Launchpads" or "Open Source Programs":

```markdown
- [SafePump-Core](https://github.com/Nosferatus1988/SafePump-Core) — Anti-MEV bonding curve primitive (Anchor) with first-slot vesting and compound penalty for repeat snipes.
```

Process:
1. Fork the repo
2. Edit `README.md`
3. PR with description: "Adds SafePump-Core, an open-source MEV-protection launchpad primitive"

---

## 8. Project Discord (optional but recommended)

Devs prefer Discord over GitHub for live discussion. Create:

1. Go to discord.com → create new server "SafePump"
2. Channels:
   - `#announcements` (locked, you post)
   - `#general`
   - `#dev` (technical chat)
   - `#help` (debugging / setup)
   - `#audit-bounty` (when you launch one)
3. Create invite link (set to "Never expire")
4. Add link to:
   - README.md (replace "Discussions" link or add alongside)
   - CONTRIBUTING.md communication section
   - Twitter bio
   - safepump-core.com footer

Run it lean — answer every question for the first month, even if it's
silent. Eventually devs will hang out there.

---

## Templates for individual outreach (DMs)

When you find a specific Solana dev whose work you admire, send them this
(NOT generic — research them first, 1-line acknowledgement of their work):

```
Hey [name],

Read your work on [their project] — particularly liked how you handled
[specific thing].

I'm building SafePump-Core, an Anchor primitive that protects token
launches from first-slot MEV. Devnet live, open source, MIT. Solo dev
right now.

Wondering if you'd be open to:
(a) a 15-min call to give me Anchor architecture feedback, or
(b) taking a look at the curve math (k = x*y with virtual reserves) and
    telling me what you'd break

No ask for time beyond that. If interesting:
https://github.com/Nosferatus1988/SafePump-Core

Either way, thanks for what you've built.
```

Target list (people who work on Solana primitives):
- Anchor contributors (find via the @coral-xyz/anchor repo Insights)
- Helius engineers (they tweet a lot, easy to find)
- Jito contributors (their Discord, GitHub orgs)
- Solana Labs DevRel (Jacob Creech, Nick Frostbutter, etc.)
- Smaller Solana defi protocols you respect

Send 5-10 of these. Conversion: maybe 1-2 reply. That's enough.

---

## What NOT to do

- ❌ Mass-DM "I'm building a launchpad, want to join?" with no context
- ❌ Post in `#general` of every Discord — you'll get banned
- ❌ Promise "100x tokens" or financial returns to contributors
- ❌ Use AI-generated outreach without manual review — devs spot it instantly
- ❌ Spam r/cryptocurrency, r/cryptomoonshots etc. — wrong audience, will hurt brand
- ❌ Hire "marketing agencies" that promise GitHub stars — fake stars get caught

---

## Tracking contributors

Add new contributors to README as they merge their first PR. Use the
[all-contributors](https://allcontributors.org) bot to automate this. Or
keep a simple manual list:

```markdown
## Contributors

- [@Nosferatus1988](https://github.com/Nosferatus1988) — author
<!-- new contributors added here -->
```

Recognition is free and matters more than money for OSS devs.
