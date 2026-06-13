# SolPump Mainnet Launch Kit

This directory stages the mainnet token launch for SolPump.

It does not execute mainnet transactions. The script prints the plan and CLI
commands so the final transaction set can be reviewed before signing.

## Draft Token

- Name: `SolPump`
- Symbol: `SOLPUMP`
- Decimals: `9`
- Draft supply: `1,000,000,000`
- Token program: classic SPL Token
- Metadata file: [metadata/solpump-token.json](metadata/solpump-token.json)
- Config file: [token.config.json](token.config.json)

## Plan

```bash
npm run token:plan
```

Strict mode fails if launch placeholders remain:

```bash
npm run token:plan -- --strict
```

## Mainnet Gates

Do not execute the generated commands until these are complete:

- Final token symbol and supply confirmed.
- Token image and metadata JSON hosted on a public, permanent URI.
- Treasury owner replaced with a multisig or dedicated treasury wallet.
- Mint and freeze authority decisions signed off.
- SafePump mainnet program audit scope completed.
- Liquidity plan approved.
- Transaction simulation reviewed.
- Mainnet spend explicitly approved by the owner.

## Metadata

The default plan uses classic SPL Token for broad compatibility. Classic SPL
metadata is normally created through the Metaplex Token Metadata program after
the mint exists and the metadata URI is public.

The alternative `token-2022-metadata` path can initialize metadata with
`spl-token initialize-metadata`, but Token-2022 support should be confirmed with
the intended wallets, DEXes, and liquidity venues before launch.

## Authority Policy

Recommended production posture:

- Mint the full fixed supply once.
- Revoke mint authority after minting.
- Avoid enabling freeze authority unless there is a documented compliance need.
- Move treasury and upgrade authority to multisig.
- Publish all authority addresses before investor outreach.

## Legal Note

Do not market the token with price promises, guaranteed returns, or misleading
claims. Investor-facing documents need jurisdiction-specific legal review before
public sale, exchange listing, or paid promotion.
