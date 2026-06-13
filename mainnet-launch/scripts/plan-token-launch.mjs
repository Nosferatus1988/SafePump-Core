#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const launchDir = path.resolve(__dirname, "..");
const defaultConfigPath = path.join(launchDir, "token.config.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function shell(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function asNumber(value, field) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${field} must be a positive number`);
  }

  return parsed;
}

function findPlaceholders(value, prefix = "") {
  const found = [];

  if (typeof value === "string") {
    if (
      value.includes("REPLACE_") ||
      value.includes("WALLET_THAT_") ||
      value.includes("example.com")
    ) {
      found.push(prefix || "config");
    }
    return found;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      found.push(...findPlaceholders(entry, `${prefix}[${index}]`));
    });
    return found;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => {
      found.push(...findPlaceholders(entry, prefix ? `${prefix}.${key}` : key));
    });
  }

  return found;
}

function formatAmount(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

function printHeader(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const configIndex = args.indexOf("--config");
  const configPath =
    configIndex >= 0 ? path.resolve(args[configIndex + 1]) : defaultConfigPath;
  const config = readJson(configPath);

  const token = config.token;
  const authorities = config.authorities;
  const supply = asNumber(token.totalSupply, "token.totalSupply");
  const decimals = asNumber(token.decimals, "token.decimals");
  const allocationTotal = config.allocation.reduce(
    (sum, item) => sum + Number(item.percent),
    0,
  );
  const placeholders = findPlaceholders(config);

  if (allocationTotal !== 100) {
    throw new Error(`allocation percent total must be 100, got ${allocationTotal}`);
  }

  if (strict && placeholders.length > 0) {
    throw new Error(`replace placeholders before mainnet: ${placeholders.join(", ")}`);
  }

  printHeader("SolPump mainnet token plan");
  console.log(`Cluster: ${config.cluster}`);
  console.log(`Token program: ${config.tokenProgram}`);
  console.log(`Name: ${token.name}`);
  console.log(`Symbol: ${token.symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total supply: ${formatAmount(supply)}`);
  console.log(`Metadata URI: ${token.metadataUri}`);

  printHeader("Authority plan");
  console.log(`Fee payer: ${authorities.feePayer}`);
  console.log(`Ledger keypair URL: ${authorities.ledgerKeypairUrl}`);
  console.log(`Mint authority: ${authorities.mintAuthority}`);
  console.log(`Freeze authority: ${authorities.freezeAuthority ?? "disabled"}`);
  console.log(`Treasury owner: ${authorities.treasuryOwner}`);
  console.log(`Sale funds receiver: ${authorities.saleFundsReceiver}`);
  console.log(
    `Revoke mint authority after mint: ${
      authorities.revokeMintAuthorityAfterMint ? "yes" : "no"
    }`,
  );

  printHeader("Allocation");
  config.allocation.forEach((item) => {
    const amount = (supply * Number(item.percent)) / 100;
    console.log(`${item.percent}% ${item.label}: ${formatAmount(amount)} ${token.symbol}`);
    console.log(`   ${item.vesting}`);
  });

  printHeader("Preflight checks");
  console.log(`export LEDGER_KEYPAIR_URL=${shell(authorities.ledgerKeypairUrl)}`);
  console.log(`export EXPECTED_LEDGER_ADDRESS=${authorities.feePayer}`);
  console.log("solana address -k $LEDGER_KEYPAIR_URL --url mainnet-beta");
  console.log("solana balance $EXPECTED_LEDGER_ADDRESS --url mainnet-beta");
  console.log("solana epoch-info --url mainnet-beta");

  printHeader("Transaction commands");
  console.log(`export LEDGER_KEYPAIR_URL=${shell(authorities.ledgerKeypairUrl)}`);
  console.log(`export MINT_AUTHORITY=${authorities.mintAuthority}`);

  if (config.tokenProgram === "token-2022-metadata") {
    console.log(
      [
        "spl-token create-token",
        "--program-2022",
        "--enable-metadata",
        "--decimals",
        token.decimals,
        "--mint-authority",
        "$MINT_AUTHORITY",
        "--fee-payer",
        "$LEDGER_KEYPAIR_URL",
        "--url",
        config.cluster,
      ].join(" "),
    );
    console.log("export MINT=<TOKEN_MINT_FROM_CREATE_TOKEN>");
    console.log(
      [
        "spl-token initialize-metadata",
        "$MINT",
        shell(token.name),
        shell(token.symbol),
        shell(token.metadataUri),
        "--program-2022",
        "--mint-authority",
        "$LEDGER_KEYPAIR_URL",
        "--update-authority",
        "$MINT_AUTHORITY",
        "--fee-payer",
        "$LEDGER_KEYPAIR_URL",
        "--url",
        config.cluster,
      ].join(" "),
    );
  } else {
    console.log(
      [
        "spl-token create-token",
        "--decimals",
        token.decimals,
        "--mint-authority",
        "$MINT_AUTHORITY",
        "--fee-payer",
        "$LEDGER_KEYPAIR_URL",
        "--url",
        config.cluster,
      ].join(" "),
    );
    console.log("export MINT=<TOKEN_MINT_FROM_CREATE_TOKEN>");
    console.log(
      "# Create Metaplex metadata for the classic SPL mint after the metadata URI is public.",
    );
  }

  console.log(`export TREASURY_OWNER=${authorities.treasuryOwner}`);
  console.log(
    [
      "export TREASURY_TOKEN_ACCOUNT=$(spl-token address",
      "--token $MINT",
      "--owner $TREASURY_OWNER",
      "--url",
      config.cluster,
      ")",
    ].join(" "),
  );
  console.log(
    [
      "spl-token create-account",
      "--owner $TREASURY_OWNER",
      "--fee-payer",
      "$LEDGER_KEYPAIR_URL",
      "--url",
      config.cluster,
      "$MINT",
    ].join(" "),
  );
  console.log(
    [
      "spl-token mint",
      "--url",
      config.cluster,
      "--fee-payer",
      "$LEDGER_KEYPAIR_URL",
      "--mint-authority",
      "$LEDGER_KEYPAIR_URL",
      "$MINT",
      shell(token.totalSupply),
      "--",
      "$TREASURY_TOKEN_ACCOUNT",
    ].join(" "),
  );

  if (authorities.revokeMintAuthorityAfterMint) {
    console.log(
      [
        "spl-token authorize",
        "$MINT",
        "mint",
        "--disable",
        "--authority",
        "$LEDGER_KEYPAIR_URL",
        "--fee-payer",
        "$LEDGER_KEYPAIR_URL",
        "--url",
        config.cluster,
      ].join(" "),
    );
  }

  if (authorities.freezeAuthority === null) {
    console.log("# Freeze authority is not enabled in this plan.");
  }

  if (placeholders.length > 0) {
    printHeader("Open items");
    placeholders.forEach((entry) => console.log(`Replace ${entry}`));
  }

  printHeader("Safety");
  console.log("This script does not sign or send transactions.");
  console.log("Run with --strict before mainnet execution.");
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
