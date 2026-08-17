import fs from "fs-extra";
import path from "path";
import deepmerge from "deepmerge";
import { applyMobileChromeChoice } from "./playwrightConfig";

export type SyncResult = {
  added: string[];
  skipped: string[];
};

export async function syncIntoExistingProject(
  targetDir: string,
  answers: Record<string, any>
): Promise<SyncResult> {
  const templateDir = path.join(__dirname, "..", "templates", "default");

  // 1. Merge package.json
  const targetPkgPath = path.join(targetDir, "package.json");
  const templatePkgPath = path.join(templateDir, "package.json");

  const targetPkg = await fs.readJson(targetPkgPath);
  const templatePkg = await fs.readJson(templatePkgPath);

  const mergedPkg = {
    ...targetPkg,
    dependencies: {
      ...templatePkg.dependencies,
      ...targetPkg.dependencies, // existing versions win on conflict
    },
    devDependencies: {
      ...templatePkg.devDependencies,
      ...targetPkg.devDependencies,
    },
    scripts: {
      ...templatePkg.scripts,
      ...targetPkg.scripts, // never override an existing script
    },
  };

  await fs.writeJson(targetPkgPath, mergedPkg, { spaces: 2 });
  console.log("✅ Merged package.json (existing scripts/deps preserved)");

  // 2. Copy framework files that don't already exist
  const skipTopLevel = new Set([
    "package.json",
    "package-lock.json",
    "playwright.config.ts",
    "node_modules",
    // The AI assistant guide is handled separately (generated from a scan of the pre-sync
    // project state, then written to whichever path the chosen tool expects via
    // src/aiConfig.ts) — this reference copy is never a valid destination as-is.
    "CLAUDE.md",
  ]);

  const entries = await fs.readdir(templateDir);
  const added: string[] = [];
  const skipped: string[] = [];

  for (const entry of entries) {
    if (skipTopLevel.has(entry)) continue;

    const srcPath = path.join(templateDir, entry);
    const destPath = path.join(targetDir, entry);

    if (await fs.pathExists(destPath)) {
      console.log(`⏭️  Skipped (already exists): ${entry}`);
      skipped.push(entry);
    } else {
      // .gitkeep files exist only to keep otherwise-empty template folders (e.g. tests/)
      // alive in git/npm — not meant to actually land in a synced project.
      await fs.copy(srcPath, destPath, { filter: (src) => path.basename(src) !== ".gitkeep" });
      console.log(`➕ Added: ${entry}`);
      added.push(entry);
    }
  }

  // 3. Handle playwright.config.ts specially — never overwrite
  const targetConfigPath = path.join(targetDir, "playwright.config.ts");
  if (await fs.pathExists(targetConfigPath)) {
    console.log(
      "⚠️  playwright.config.ts already exists — not touched. " +
      "You'll need to manually wire in Testroid's fixtures/projects. " +
      "See templates/default/playwright.config.ts as a reference."
    );
    skipped.push("playwright.config.ts");
  } else {
    await fs.copy(
      path.join(templateDir, "playwright.config.ts"),
      targetConfigPath
    );
    // Only ever applied to the config we just copied in above — an existing
    // playwright.config.ts (the branch above) is never touched, mobile-chrome choice or not.
    await applyMobileChromeChoice(targetConfigPath, Boolean(answers.includeMobileChrome));
    if (!answers.includeMobileChrome) {
      console.log("ℹ️  mobile-chrome (Pixel 5 emulation) project not included — re-run 'testroid init' or edit playwright.config.ts to add it later.");
    }
    console.log("✅ Added playwright.config.ts");
    added.push("playwright.config.ts");
  }

  // 4. Merge or create .env
  const envPath = path.join(targetDir, ".env");
  const newEnvLines = [`PROJECT_NAME=${answers.projectName}`];
  // Omitted rather than written as `BASE_URL=` when unset — see scaffold.ts's matching
  // comment: playwright.config.ts's `process.env.BASE_URL ?? '...'` fallback only kicks in
  // when the key is absent, not when it's an empty string.
  if (answers.baseUrl) newEnvLines.push(`BASE_URL=${answers.baseUrl}`);
  newEnvLines.push(`SUITE_TYPE=${answers.suiteType}`, `ENVIRONMENT=${answers.environment}`);

  if (await fs.pathExists(envPath)) {
    const existing = await fs.readFile(envPath, "utf8");
    const existingKeys = new Set(
      existing.split("\n").map((line) => line.split("=")[0])
    );
    const linesToAdd = newEnvLines.filter(
      (line) => !existingKeys.has(line.split("=")[0])
    );
    if (linesToAdd.length > 0) {
      await fs.appendFile(envPath, "\n" + linesToAdd.join("\n"));
      console.log(`✅ Added ${linesToAdd.length} new key(s) to existing .env`);
    } else {
      console.log("⏭️  .env already has all required keys — untouched");
    }
  } else {
    await fs.writeFile(envPath, newEnvLines.join("\n"));
    console.log("✅ Created .env");
  }

  console.log(`\n📦 Sync complete: ${added.length} added, ${skipped.length} skipped (already existed)`);

  return { added, skipped };
}
