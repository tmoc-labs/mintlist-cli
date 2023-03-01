import {
  CoinGeckoProvider,
  FileSystemProvider,
  MetaplexProvider,
  Mintlist,
  SolanaFmProvider,
  TokenFetcher,
  Tokenlist,
} from "@orca-so/token-sdk";
import { Connection } from "@solana/web3.js";
import { existsSync, mkdirSync } from "mz/fs";
import { MintlistFileUtil } from "../util/mintlist-file-util";
import { resolve } from "path";

export async function genTokenlist(paths: string[], opts: any) {
  if (!isOpts(opts)) {
    throw new Error("Invalid options");
  }
  const fetcher = await createFetcher(opts);
  const outPath = resolve(opts.outDir);
  if (!existsSync(outPath)) {
    mkdirSync(outPath);
  }

  const params = paths
    .filter((path) => MintlistFileUtil.validMintlistName(getFileName(path)))
    .map((path) => ({
      path: resolve(path),
      tokenlistPath: `${outPath}/${toTokenlistFileName(getFileName(path))}`,
      mintlist: MintlistFileUtil.readMintlistSync(path),
    }));

  for (const param of params) {
    const tokenlist = await fetchTokenlist(fetcher, param.mintlist);
    MintlistFileUtil.writeJsonSync(param.tokenlistPath, tokenlist);
  }
}

async function createFetcher(opts: Opts): Promise<TokenFetcher> {
  const connection = createConnection(opts.rpcUrl);
  const fetcher = TokenFetcher.from(connection);
  if (opts.overrides) {
    fetcher.addProvider(new FileSystemProvider(MintlistFileUtil.readOverridesSync(opts.overrides)));
  }
  fetcher
    .addProvider(new MetaplexProvider(connection, { concurrency: 10, intervalMs: 1000 }))
    .addProvider(new SolanaFmProvider({ concurrency: 5, intervalMs: 1000 }))
    .addProvider(new CoinGeckoProvider({ concurrency: 1, intervalMs: 1000 }));
  return fetcher;
}

function createConnection(url: string): Connection {
  if (process.env.SOLANA_NETWORK) {
    console.log(`Using RPC SOLANA_NETWORK env var`);
  } else {
    console.log(`Using RPC ${url}`);
  }
  return new Connection(process.env.SOLANA_NETWORK || url);
}

function getFileName(path: string): string {
  const name = path.split("/").pop();
  if (!name) {
    throw new Error("Invalid path");
  }
  return name;
}

function toTokenlistFileName(mintlistName: string): string {
  return mintlistName.replace(".mintlist", ".tokenlist");
}

async function fetchTokenlist(fetcher: TokenFetcher, mintlist: Mintlist): Promise<Tokenlist> {
  console.log(`Fetching metadata for ${mintlist.name} - ${mintlist.mints.length} mints`);
  const tokens = await fetcher.findMany(mintlist.mints);
  return {
    name: mintlist.name,
    tokens: Object.values(tokens),
  };
}

interface Opts {
  outDir: string;
  overrides?: string;
  rpcUrl: string;
}

function isOpts(opts: any): opts is Opts {
  return opts !== null && typeof opts === "object" && "outDir" in opts && "rpcUrl" in opts;
}
