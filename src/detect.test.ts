import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { detectProjectState } from "./detect";

describe("detectProjectState", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "testroid-detect-"));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it("returns \"empty\" for a directory with no files", async () => {
    await expect(detectProjectState(tempDir)).resolves.toBe("empty");
  });

  it("returns \"empty\" when the only entries are harmless clutter (node_modules, .git)", async () => {
    await fs.ensureDir(path.join(tempDir, "node_modules"));
    await fs.ensureDir(path.join(tempDir, ".git"));

    await expect(detectProjectState(tempDir)).resolves.toBe("empty");
  });

  it("returns \"unknown\" when there are files but no package.json", async () => {
    await fs.writeFile(path.join(tempDir, "notes.txt"), "hello");

    await expect(detectProjectState(tempDir)).resolves.toBe("unknown");
  });

  it("returns \"unknown\" when package.json exists but has no Playwright dependency", async () => {
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "some-app",
      dependencies: { express: "^4.0.0" }
    });

    await expect(detectProjectState(tempDir)).resolves.toBe("unknown");
  });

  it("returns \"playwright-only\" when @playwright/test is a dependency", async () => {
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "some-app",
      devDependencies: { "@playwright/test": "^1.40.0" }
    });

    await expect(detectProjectState(tempDir)).resolves.toBe("playwright-only");
  });

  it("returns \"playwright-cucumber\" when both @playwright/test and @cucumber/cucumber are present", async () => {
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "some-app",
      devDependencies: {
        "@playwright/test": "^1.40.0",
        "@cucumber/cucumber": "^10.0.0"
      }
    });

    await expect(detectProjectState(tempDir)).resolves.toBe("playwright-cucumber");
  });

  it("returns \"playwright-cucumber\" for the playwright-bdd flavor too", async () => {
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "some-app",
      dependencies: { "@playwright/test": "^1.40.0" },
      devDependencies: { "playwright-bdd": "^7.0.0" }
    });

    await expect(detectProjectState(tempDir)).resolves.toBe("playwright-cucumber");
  });

  it("returns \"empty\" for a nonexistent directory rather than throwing (readdir failure is swallowed)", async () => {
    const missingDir = path.join(tempDir, "does-not-exist");

    await expect(detectProjectState(missingDir)).resolves.toBe("empty");
  });
});
