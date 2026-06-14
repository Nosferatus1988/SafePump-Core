# Contributing to SafePump-Core

Thanks for considering contributing. SafePump-Core is a public-good Solana primitive — every fix, test, doc improvement, or feature PR makes the ecosystem safer for retail users.

## Quick start

```bash
git clone https://github.com/Nosferatus1988/SafePump-Core
cd SafePump-Core
npm install
anchor build
anchor test
```

You need:
- Rust 1.78+ and `cargo`
- Solana CLI 4.0+ (`solana-install`)
- Anchor CLI 1.0+ (`avm install latest && avm use latest`)
- Node.js 20+ and npm

## How to contribute

### Looking for a starting point?

Browse [good-first-issues](https://github.com/Nosferatus1988/SafePump-Core/issues?q=is%3Aissue+is%3Aopen+label%3A%22good-first-issue%22). These are well-scoped, low-context tasks:

- Add CI (cargo fmt + clippy + audit)
- Refactor `lib.rs` into modules
- Property-based tests for the curve math
- Document the snipe-vesting mechanism
- TypeScript CLI for all instructions

### Workflow

1. **Comment on the issue** you want to take, so others don't duplicate work.
2. **Fork** the repo and create a branch named `feat/<short-description>` or `fix/<short-description>`.
3. **Write the change**. Keep PRs focused — one issue per PR.
4. **Add tests** for any new behavior. For program changes, add to the Anchor TypeScript test suite. For math, prefer property-based tests.
5. **Run locally before pushing**:
   ```bash
   cargo fmt --check
   cargo clippy -- -D warnings
   anchor test
   ```
6. **Open a PR** against `main`. Reference the issue number (`Closes #N`).
7. A maintainer will review within ~48 hours. Be patient and responsive.

### Conventions

- **Rust**: rustfmt defaults, clippy clean, no `unwrap()` in program code (use `?` and proper errors)
- **TypeScript**: prettier defaults
- **Commits**: short imperative subject ("Add fee module", not "Added fee module"); body explains *why*
- **Math**: always `u128` intermediate, `checked_*` ops, explicit `ErrorCode::MathOverflow`

## What kinds of contributions are welcome

- ✅ Bug fixes — always, no proposal needed
- ✅ Test coverage improvements
- ✅ Documentation
- ✅ Performance improvements (with benchmarks)
- ✅ New instructions that fit the protocol scope (open an issue first)
- ✅ Frontend or off-chain tooling (CLI, indexer, web UI)
- ⚠️ Breaking changes to existing instructions — discuss first via issue
- ❌ Adding unrelated tokens / branding / shilling

## Security-sensitive contributions

If you find a vulnerability, **do not open a public issue**. See [SECURITY.md](SECURITY.md) for the responsible disclosure process.

## Recognition

All merged contributors are listed in the README. If the project receives funding or runs a community airdrop in the future, contributors will be eligible based on PR depth and engagement (this is not a promise of monetary reward, just intent).

## Communication

- GitHub Issues — feature/bug discussion
- GitHub Discussions — design questions, architecture, RFCs
- Twitter `@SafePumpFi` (TBD) — announcements

## Code of Conduct

Be technical, direct, and respectful. Disagreement on technical decisions is fine and encouraged — personal attacks are not. Maintainers will moderate.
