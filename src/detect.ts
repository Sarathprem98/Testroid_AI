import fs from "fs-extra";
import path from "path";

export type ProjectState =
  | "empty"
  | "playwright-only"
  | "playwright-cucumber"
  | "unknown";

/**
 * package.json's own "name" field for `targetDir`, falling back to the folder's basename if
 * there's no package.json or it has no "name". The one place this fallback logic lives —
 * both claudeMd.ts's scanExistingProject (the sync-mode assistant guide's project label) and
 * prompts.ts (the .env PROJECT_NAME / CLAUDE.md callout for a sync run, which skips asking
 * "Project name?" since it must never write back into an existing project's package.json)
 * use it, so the two never drift into disagreeing about a project's name.
 */
export async function detectProjectName(targetDir: string): Promise<string> {
  const pkgPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath).catch(() => undefined);
    if (typeof pkg?.name === "string" && pkg.name.trim()) return pkg.name;
  }
  return path.basename(targetDir);
}

export async function detectProjectState(targetDir: string): Promise<ProjectState> {
  const entries = await fs.readdir(targetDir).catch(() => []);

  // Ignore harmless clutter when checking "empty"
  const meaningful = entries.filter(
    (e) => !["node_modules", ".git", ".DS_Store"].includes(e)
  );

  if (meaningful.length === 0) {
    return "empty";
  }

  const pkgPath = path.join(targetDir, "package.json");
  const hasPkg = await fs.pathExists(pkgPath);

  if (!hasPkg) {
    return "unknown";
  }

  const pkg = await fs.readJson(pkgPath).catch(() => ({}));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const hasPlaywright = "@playwright/test" in deps;
  const hasCucumber =
    "@cucumber/cucumber" in deps || "playwright-bdd" in deps;

  if (hasPlaywright && hasCucumber) return "playwright-cucumber";
  if (hasPlaywright) return "playwright-only";

  return "unknown";
}