import fs from "fs-extra";
import path from "path";

export interface ScaffoldResult {
  /** Top-level template entries (plus ".env") newly created in targetDir by this run —
   * i.e. never a path that already existed there before. Scoped to the same top-level
   * granularity as syncIntoExistingProject's `added` list, for a consistent undo manifest. */
  added: string[];
}

export async function scaffoldProject(targetDir: string, answers: Record<string, any>): Promise<ScaffoldResult> {
  const templateDir = path.join(__dirname, "..", "templates", "default");

  // Never copied, even if present on disk in templates/default/ — a maintainer's own local
  // `npm install`/build byproducts there, never meant to land in a scaffolded project.
  // Matches syncIntoExistingProject's own skipTopLevel set for the same entries.
  const neverCopy = new Set(["CLAUDE.md", "node_modules", "package-lock.json"]);

  // Snapshot which top-level template entries don't already exist in targetDir *before*
  // copying — scaffoldProject targets are expected to be empty/fresh, but re-running into a
  // partially-populated folder (e.g. a prior interrupted run) should still only report what
  // this run actually added, not entries that were already there.
  const templateEntries = (await fs.readdir(templateDir)).filter((entry) => !neverCopy.has(entry));
  const added: string[] = [];
  for (const entry of templateEntries) {
    if (!(await fs.pathExists(path.join(targetDir, entry)))) {
      added.push(entry);
    }
  }

  await fs.copy(templateDir, targetDir, {
    overwrite: false,
    errorOnExist: false,
    filter: (src) => {
      // CLAUDE.md is generated separately by the caller (via src/aiConfig.ts) instead of
      // copied verbatim — this reference copy would otherwise land at the wrong path/name
      // for whichever tool the user picked. node_modules/package-lock.json are excluded in
      // case a maintainer's own local install left them in templates/default/ — see neverCopy.
      if (neverCopy.has(path.relative(templateDir, src).split(path.sep)[0])) return false;
      // .gitkeep files exist only to keep otherwise-empty template folders (e.g. tests/)
      // alive in git/npm — not meant to actually land in a scaffolded project.
      if (path.basename(src) === ".gitkeep") return false;
      return true;
    },
  });

  // The template ships with a fixed placeholder "name" — a fresh scaffold has no existing
  // package.json to protect (unlike sync.ts, which never touches an existing project's
  // "name" — see its own comment), so this is the one path where it's safe to set it from
  // the user's answer.
  const scaffoldedPkgPath = path.join(targetDir, "package.json");
  const scaffoldedPkg = await fs.readJson(scaffoldedPkgPath);
  scaffoldedPkg.name = answers.projectName;
  await fs.writeJson(scaffoldedPkgPath, scaffoldedPkg, { spaces: 2 });

  const envPath = path.join(targetDir, ".env");
  const envAlreadyExisted = await fs.pathExists(envPath);

  const envLines = [`PROJECT_NAME=${answers.projectName}`];
  // Omitted rather than written as `BASE_URL=` when unset: playwright.config.ts falls
  // back to a placeholder via `process.env.BASE_URL ?? '...'`, which only kicks in when
  // the key is absent — an empty string would satisfy `??` and silently point tests at "".
  if (answers.baseUrl) envLines.push(`BASE_URL=${answers.baseUrl}`);
  envLines.push(`SUITE_TYPE=${answers.suiteType}`, `ENVIRONMENT=${answers.environment}`);

  const envContent = envLines.join("\n");

  await fs.writeFile(envPath, envContent);
  if (!envAlreadyExisted) added.push(".env");

  console.log(`✅ Testroid scaffolded into ${targetDir}`);
  console.log(`✅ .env created with your site config`);

  return { added };
}
