# Security Policy

SafePump-Core handles user funds on Solana. Security issues are taken seriously.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, report via one of:

- **Email**: mariusel_src1988@yahoo.com — PGP key available on request
- **GitHub Security Advisory**: https://github.com/Nosferatus1988/SafePump-Core/security/advisories/new

Please include:

1. A clear description of the vulnerability
2. Steps to reproduce, ideally with a failing test or PoC
3. The impact: what an attacker can do (drain funds, lock funds, freeze a curve, etc.)
4. Suggested mitigation if you have one

## Response timeline

| Stage | Target |
|---|---|
| Acknowledgement | 48 hours |
| Triage & severity rating | 5 days |
| Fix in private branch | Critical: 7 days, High: 14 days, Medium: 30 days |
| Public disclosure | After fix is deployed + 14 day grace |

## Scope

In scope:
- `programs/safepump-core/` (Anchor program)
- Deployed devnet program (`FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q`)
- Mainnet program (TBA after audit)
- Off-chain components in this repo (CLI, indexer, frontend)

Out of scope:
- The landing site at `safepump-core.com` (informational only)
- Third-party launchpads forking this code (report to them)
- Issues already covered in the audit report (when published)

## Severity guidelines

| Severity | Example |
|---|---|
| Critical | Direct fund drain, mint authority hijack, unrestricted token mint |
| High | Front-running vesting unlock, bypass of anti-snipe routing, math error allowing free tokens |
| Medium | DoS on a curve (cannot be initialized or buy/sell), event spam, state inconsistency |
| Low | Documentation errors, IDL mismatches, gas inefficiency |

## Bug bounty

There is no formal bounty program funded yet. After grant funding or commercial launch, a bounty program will be established (target: Immunefi or in-house). In the meantime:

- Critical/High reports will be acknowledged publicly (with reporter consent) in the eventual audit report
- We will use any available funding to make ex-gratia payments to high-impact reporters

Thanks for keeping Solana users safe.
