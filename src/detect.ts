import fs from "fs-extra";
import path from "path";

export type ProjectState =
  | "empty"
  | "playwright-only"
  | "playwright-cucumber"
  | "unknown";

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