import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import prompts from "prompts";
import { readManifest, manifestPath, MANIFEST_FILENAME, type TestroidManifest } from "../manifest";
import { removeMcpServerEntry } from "../mcp";
import { removeReporterEntries } from "../reporting";

/** True if `relativePath` stays inside `installDir` once resolved — a manifest is trusted
 * project state, but this guards against ever deleting outside the project on a malformed
 * or hand-edited manifest. */
function isSafeRelativePath(installDir: string, relativePath: string): boolean {
  const resolved = path.resolve(installDir, relativePath);
  const root = path.resolve(installDir) + path.sep;
  return resolved.startsWith(root);
}

/** Removes now-empty directories walking up from `filePath`'s parent, stopping at
 * `installDir` (never removes installDir itself) or the first non-empty directory found.
 * Purely cosmetic tidy-up for e.g. a `.cursor/rules/testroid.mdc` deletion leaving an empty
 * `.cursor/rules/` and `.cursor/` behind — never touches a directory with content left in it. */
async function removeEmptyParents(installDir: string, filePath: string): Promise<void> {
  let dir = path.dirname(filePath);
  const root = path.resolve(installDir);

  while (path.resolve(dir) !== root && path.resolve(dir).startsWith(root)) {
    const entries = await fs.readdir(dir).catch(() => null);
    if (!entries || entries.length > 0) return;
    await fs.remove(dir);
    dir = path.dirname(dir);
  }
}

function printSummary(manifest: TestroidManifest): void {
  console.log(chalk.bold.cyan("📋 This will remove:\n"));

  if (manifest.added.length > 0) {
    console.log(chalk.dim("Files/folders:"));
    for (const entry of manifest.added) {
      console.log(`  ${chalk.dim("•")} ${entry}`);
    }
    console.log("");
  }

  const { dependencies, devDependencies, scripts } = manifest.packageJson.added;
  const anyPackageJsonKeys = dependencies.length > 0 || devDependencies.length > 0 || scripts.length > 0;
  if (manifest.packageJson.merged && anyPackageJsonKeys) {
    console.log(chalk.dim("package.json keys (added by Testroid, existing keys left untouched):"));
    for (const dep of dependencies) console.log(`  ${chalk.dim("•")} dependencies.${dep}`);
    for (const dep of devDependencies) console.log(`  ${chalk.dim("•")} devDependencies.${dep}`);
    for (const script of scripts) console.log(`  ${chalk.dim("•")} scripts.${script}`);
    console.log("");
  }

  if (manifest.mcp?.configEntryAdded && !manifest.mcp.configCreated) {
    console.log(chalk.dim("MCP config:"));
    console.log(`  ${chalk.dim("•")} the "playwright" server entry in .mcp.json (rest of the file left untouched)`);
    console.log("");
  }

  if (manifest.reporting?.configEntriesAdded && !manifest.added.includes("playwright.config.ts")) {
    console.log(chalk.dim("Reporting config:"));
    console.log(
      `  ${chalk.dim("•")} the ${manifest.reporting.choice === "allure" ? "Allure" : "Ortoni"} reporter entries in playwright.config.ts's reporter array (rest of the file left untouched)`
    );
    console.log("");
  }

  console.log(chalk.dim(`Finally, ${MANIFEST_FILENAME} itself will be deleted.\n`));
}

async function performUndo(installDir: string, manifest: TestroidManifest): Promise<void> {
  for (const relativePath of manifest.added) {
    if (!isSafeRelativePath(installDir, relativePath)) {
      console.log(chalk.yellow(`⚠️  Skipped suspicious manifest path outside the project: ${relativePath}`));
      continue;
    }
    const fullPath = path.join(installDir, relativePath);
    await fs.remove(fullPath);
    await removeEmptyParents(installDir, fullPath);
    console.log(`${chalk.red("✖")} Removed ${relativePath}`);
  }

  if (manifest.packageJson.merged) {
    const pkgPath = path.join(installDir, "package.json");
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath).catch(() => undefined);
      if (pkg) {
        const { dependencies, devDependencies, scripts } = manifest.packageJson.added;
        for (const dep of dependencies) delete pkg.dependencies?.[dep];
        for (const dep of devDependencies) delete pkg.devDependencies?.[dep];
        for (const script of scripts) delete pkg.scripts?.[script];
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        if (dependencies.length + devDependencies.length + scripts.length > 0) {
          console.log(`${chalk.red("✖")} Removed ${dependencies.length + devDependencies.length + scripts.length} package.json key(s) Testroid added`);
        }
      }
    }
  }

  // Both of the following are no-ops if their target file is already gone (e.g. a freshly
  // created .mcp.json/playwright.config.ts already deleted above via `added`) — they only
  // do real work for the "entry merged into a pre-existing file" case.
  if (manifest.mcp?.configEntryAdded) {
    await removeMcpServerEntry(installDir);
  }
  if (manifest.reporting?.configEntriesAdded) {
    await removeReporterEntries(installDir, manifest.reporting.choice);
  }

  await fs.remove(manifestPath(installDir));
  console.log(`${chalk.red("✖")} Removed ${MANIFEST_FILENAME}`);
}

export async function undoCommand(): Promise<void> {
  const installDir = process.cwd();
  const manifest = await readManifest(installDir);

  if (!manifest) {
    console.log(
      chalk.yellow(
        "⚠️  No Testroid installation record found here — either this project wasn't " +
        "scaffolded by Testroid, or the manifest was already removed."
      )
    );
    return;
  }

  printSummary(manifest);

  const { confirmed } = await prompts({
    type: "confirm",
    name: "confirmed",
    message: "Remove all of the above? This cannot be undone.",
    initial: false
  });

  if (!confirmed) {
    console.log(chalk.dim("Cancelled — nothing was removed."));
    return;
  }

  console.log("");
  await performUndo(installDir, manifest);
  console.log(chalk.green("\n✅ Testroid has been removed from this project."));
}
