import { Mintlist, TokenMetadata } from "@orca-so/token-sdk";
import { readFileSync, writeFileSync } from "mz/fs";
import { resolve } from "path";

export class MintlistFileUtil {
  public static readMintlistSync(filePath: string): Mintlist {
    try {
      return JSON.parse(readFileSync(resolve(filePath), "utf-8")) as Mintlist;
    } catch (e) {
      throw new Error(`Failed to parse mintlist at ${filePath}`);
    }
  }

  public static readOverridesSync(filePath: string): MetadataOverrides {
    try {
      return JSON.parse(readFileSync(resolve(filePath), "utf-8")) as MetadataOverrides;
    } catch (e) {
      throw new Error(`Failed to parse overrides at ${filePath}`);
    }
  }

  public static validMintlistName(name: string): boolean {
    return /^[a-z\d-]+(?=[a-z]).+\.mintlist\.json$/i.test(name);
  }

  public static validTokenlistName(name: string): boolean {
    return /^[a-z\d-]+(?=[a-z]).+\.tokenlist\.json$/i.test(name);
  }

  public static writeJsonSync(filePath: string, obj: any) {
    try {
      const fullPath = resolve(filePath);
      const json = JSON.stringify(obj, null, 2);
      writeFileSync(fullPath, json);
    } catch (e) {
      throw new Error(`Failed to write tokenlist at ${filePath}`);
    }
  }
}

type MetadataOverrides = Record<string, Partial<TokenMetadata>>;
