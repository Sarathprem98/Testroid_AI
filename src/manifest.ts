import fs from "fs-extra";
import path from "path";

export const MANIFEST_FILENAME = ".testroid-manifest.json";

export interface PackageJsonAdditions {
  dependencies: string[];
  devDependencies: string[];
  scripts: string[];
}

export interface TestroidManifest {
  /** Testroid CLI version (root package.json's own version) that produced this manifest. */
  testroidVersion: string;
  /** ISO 8601 timestamp of when this run completed. */
  createdAt: string;
  /** "scaffold" for a fresh (or fresh-subfolder) scaffold, "sync" for a merge into an
   * already-existing Playwright project. */
  mode: "scaffold" | "sync";
  /**
   * Every file and top-level folder newly created by this run, relative to the project
   * root — nothing here existed before Testroid touched it, so undo can delete each path
   * outright.
   */
  added: string[];
  packageJson: {
    /**
     * True only when an existing package.json was merged in place (sync mode). False when
     * package.json itself was freshly created — that case is already covered by `added`
     * above, so undo just deletes the whole file and there's nothing to track key-by-key.
     */
    merged: boolean;
    /** Keys actually added by Testroid across the whole run (template merge, MCP install,
     * reporting install/script) — never a key that already existed, even if same name. */
    added: PackageJsonAdditions;
  };
  /** Null if Playwright MCP wasn't installed this run. */
  mcp: {
    /** True = .mcp.json was newly created this run (already covered by `added`). */
    configCreated: boolean;
    /** True = the "playwright" server entry was merged into a pre-existing .mcp.json —
     * undo must remove just that entry, not the whole file. */
    configEntryAdded: boolean;
  } | null;
  /** Null if reporting wasn't configured this run (shouldn't happen in practice — kept
   * optional for forward compatibility with older manifests). */
  reporting: {
    choice: "allure" | "ortoni";
    /** True = reporter entries were inserted into a playwright.config.ts that already
     * existed before this run (not one Testroid just created) — undo must remove just
     * those entries, not the whole file. */
    configEntriesAdded: boolean;
  } | null;
}

export function manifestPath(installDir: string): string {
  return path.join(installDir, MANIFEST_FILENAME);
}

export async function writeManifest(installDir: string, manifest: TestroidManifest): Promise<void> {
  await fs.writeJson(manifestPath(installDir), manifest, { spaces: 2 });
}

/** Returns undefined if no manifest exists here, or if it exists but can't be parsed. */
export async function readManifest(installDir: string): Promise<TestroidManifest | undefined> {
  const filePath = manifestPath(installDir);
  if (!(await fs.pathExists(filePath))) return undefined;
  return fs.readJson(filePath).catch(() => undefined);
}

/** Best-effort read of the running Testroid CLI's own version, for manifest bookkeeping.
 * Falls back to "0.0.0" if it can't be resolved (shouldn't happen in the published CLI). */
export function resolveTestroidVersion(): string {
  try {
    return (require("../package.json") as { version?: string }).version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
