import fs from "fs-extra";
import path from "path";
import deepmerge from "deepmerge";

export type SyncResult = {
  added: string[];
  skipped: string[];
  /** package.json keys this run actually added — never a key that already existed, even
   * when the template also ships one of the same name (existing values always win). */
  packageJsonAdded: {
    dependencies: string[];
    devDependencies: string[];
    scripts: string[];
  };
};

/** Keys present in `merged` but absent from `original` — i.e. genuinely new this run. */
function newKeys(original: Record<string, unknown> | undefined, merged: Record<string, unknown>): string[] {
  const existingKeys = new Set(Object.keys(original ?? {}));
  return Object.keys(merged).filter((key) => !existingKeys.has(key));
}

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

  // Spreading targetPkg first and only overriding dependencies/devDependencies/scripts below
  // means "name" (and every other field — version, description, ...) always passes through
  // from the existing project untouched. That's deliberate, not incidental: changing an
  // existing project's package.json "name" could break CI, publishing, or workspace
  // references that depend on it, so sync must never set it — unlike scaffold.ts, which
  // writes the user's answer into a fresh package.json with nothing to protect.
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

  const packageJsonAdded = {
    dependencies: newKeys(targetPkg.dependencies, mergedPkg.dependencies),
    devDependencies: newKeys(targetPkg.devDependencies, mergedPkg.devDependencies),
    scripts: newKeys(targetPkg.scripts, mergedPkg.scripts),
  };

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
    added.push(".env");
  }

  console.log(`\n📦 Sync complete: ${added.length} added, ${skipped.length} skipped (already existed)`);

  return { added, skipped, packageJsonAdded };
}
