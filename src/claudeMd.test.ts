import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { scanExistingProject } from "./claudeMd";

describe("scanExistingProject", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "testroid-scan-"));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it("detects language, test runners, other libraries, package manager, folders, config files, CI, and README summary", async () => {
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "acme-suite",
      scripts: { test: "playwright test", lint: "eslint ." },
      dependencies: {
        "@playwright/test": "^1.40.0"
      },
      devDependencies: {
        typescript: "^5.0.0",
        eslint: "^9.0.0",
        "@faker-js/faker": "^9.0.0"
      }
    });
    await fs.writeFile(path.join(tempDir, "package-lock.json"), "{}");
    await fs.writeFile(path.join(tempDir, "tsconfig.json"), "{}");
    await fs.writeFile(
      path.join(tempDir, "README.md"),
      "# Acme Suite\n\nA short description of the project.\n\nMore details below."
    );
    await fs.ensureDir(path.join(tempDir, "tests"));
    await fs.ensureDir(path.join(tempDir, "pages"));
    await fs.ensureDir(path.join(tempDir, ".github", "workflows"));

    const profile = await scanExistingProject(tempDir);

    expect(profile.name).toBe("acme-suite");
    expect(profile.language).toBe("TypeScript");
    expect(profile.testRunners).toEqual(["Playwright"]);
    expect(profile.otherLibraries.sort()).toEqual(["ESLint", "Faker"].sort());
    expect(profile.packageManager).toBe("npm");
    expect(profile.existingFolders.sort()).toEqual(["pages", "tests"].sort());
    expect(profile.configFiles).toContain("tsconfig.json");
    expect(profile.hasCI).toBe(true);
    expect(profile.readmeSummary).toBe("Acme Suite — A short description of the project.");
    expect(profile.scripts).toEqual({ test: "playwright test", lint: "eslint ." });
  });

  it("falls back to sensible defaults for a minimal project with no package.json", async () => {
    // An empty (but existing) directory, named after its own basename.
    const profile = await scanExistingProject(tempDir);

    expect(profile.name).toBe(path.basename(tempDir));
    expect(profile.language).toBe("JavaScript");
    expect(profile.testRunners).toEqual([]);
    expect(profile.otherLibraries).toEqual([]);
    expect(profile.packageManager).toBe("unknown");
    expect(profile.existingFolders).toEqual([]);
    expect(profile.configFiles).toEqual([]);
    expect(profile.hasCI).toBe(false);
    expect(profile.readmeSummary).toBeUndefined();
    expect(profile.scripts).toEqual({});
  });

  it("detects yarn over npm when both lockfiles could theoretically match, honoring pnpm > yarn > npm priority", async () => {
    await fs.writeFile(path.join(tempDir, "yarn.lock"), "");
    await fs.writeFile(path.join(tempDir, "package-lock.json"), "{}");

    const profile = await scanExistingProject(tempDir);
    expect(profile.packageManager).toBe("yarn");
  });

  it("detects TypeScript from a dependency even without a tsconfig.json on disk", async () => {
    await fs.writeJson(path.join(tempDir, "package.json"), {
      dependencies: {},
      devDependencies: { typescript: "^5.0.0" }
    });

    const profile = await scanExistingProject(tempDir);
    expect(profile.language).toBe("TypeScript");
  });
});
