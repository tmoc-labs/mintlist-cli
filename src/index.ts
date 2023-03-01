#!/usr/bin/env node

import { Command } from "commander";
import { genTokenlist } from "./cmd/gen-tokenlist";
import { genIndex } from "./cmd/gen-index";
import { addMint } from "./cmd/add-mint";
import { removeMint } from "./cmd/remove-mint";

const program = new Command();

program.name("mintlist-util").description("CLI for managing mintlists").version("0.1.0");

program
  .command("add-mint")
  .description("Add a mint to a mintlist")
  .argument("<mintlist>", "Path to mintlist file")
  .argument("<mint...>", "Mint(s) to add to mintlist")
  .action(addMint);

program
  .command("remove-mint")
  .alias("rm-mint")
  .description("Remove a mint from a mintlist")
  .argument("<mintlist>", "Path to mintlist file")
  .argument("<mint...>", "Mint(s) to remove from mintlist")
  .action(removeMint);

program
  .command("gen-tokenlist")
  .description("Generate tokenlists from mintlists")
  .argument("<mintlist...>", "Path to mintlist file(s)")
  .requiredOption("--outDir <string>", "Output directory for generated tokenlists")
  .option("--overrides <string>", "Path to overrides file", "./src/overrides.json")
  .option("--rpcUrl <string>", "Solana RPC URL", "https://api.mainnet-beta.solana.com")
  .action(genTokenlist);

program
  .command("gen-index")
  .description("Generate file that exports all tokenlists and mintlists")
  .requiredOption(
    "--inDir <string>",
    "Input directory to search for mintlists and tokenlists",
    "./src"
  )
  .requiredOption("--outDir <string>", "Output directory for generated index.ts", "./src")
  .action(genIndex);

async function main() {
  await program.parseAsync();
}

main()
  .then(() => {})
  .catch((e) => console.error(e));
