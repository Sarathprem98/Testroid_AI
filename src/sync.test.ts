import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { syncIntoExistingProject } from "./sync";

const ANSWERS = {
  projectName: "my-app",
  baseUrl: "https://example.com",
  suiteType: "smoke",
  environment: "QA"
};

describe("syncIntoExistingProject", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "testroid-sync-"));
    // syncIntoExistingProject reads package.json unconditionally — every test needs one
    // present before calling it, same as the real "playwright-only" detection path does.
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "my-app",
      scripts: {
        test: "my-custom-test-runner --whatever",
        build: "tsc"
      },
      dependencies: {
        "some-existing-dep": "1.2.3"
      },
      devDependencies: {}
    });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it("preserves existing scripts and adds the template's other scripts without conflict", async () => {
    await syncIntoExistingProject(tempDir, ANSWERS);

    const merged = await fs.readJson(path.join(tempDir, "package.json"));

    // Existing scripts are never overridden, even when the template defines a "test" script.
    expect(merged.scripts.test).toBe("my-custom-test-runner --whatever");
    expect(merged.scripts.build).toBe("tsc");
    // Template-only scripts get added.
    expect(merged.scripts["test:headed"]).toBe("playwright test --headed");
    expect(merged.scripts["report:allure"]).toBeDefined();
  });

  it("preserves existing dependency versions and adds the template's other dependencies without conflict", async () => {
    await syncIntoExistingProject(tempDir, ANSWERS);

    const merged = await fs.readJson(path.join(tempDir, "package.json"));

    // Existing dependency version is never overridden by the template's own.
    expect(merged.dependencies["some-existing-dep"]).toBe("1.2.3");
    // Template-only dependencies get added.
    expect(merged.devDependencies["@playwright/test"]).toBeDefined();
    expect(merged.devDependencies["typescript"]).toBeDefined();
  });

  it("does not touch a dependency the target already declares, even if the template also ships it", async () => {
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "my-app",
      scripts: {},
      dependencies: {},
      // Template also lists @faker-js/faker — target's pinned version should win.
      devDependencies: { "@faker-js/faker": "9.0.0" }
    });

    await syncIntoExistingProject(tempDir, ANSWERS);

    const merged = await fs.readJson(path.join(tempDir, "package.json"));
    expect(merged.devDependencies["@faker-js/faker"]).toBe("9.0.0");
  });

  it("creates .env with all four keys when none exists", async () => {
    await syncIntoExistingProject(tempDir, ANSWERS);

    const env = await fs.readFile(path.join(tempDir, ".env"), "utf8");
    expect(env).toContain("PROJECT_NAME=my-app");
    expect(env).toContain("BASE_URL=https://example.com");
    expect(env).toContain("SUITE_TYPE=smoke");
    expect(env).toContain("ENVIRONMENT=QA");
  });

  it("preserves existing .env values and only appends genuinely missing keys", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "PROJECT_NAME=already-here\nBASE_URL=https://already-here.example.com"
    );

    await syncIntoExistingProject(tempDir, ANSWERS);

    const env = await fs.readFile(path.join(tempDir, ".env"), "utf8");
    // Existing keys are untouched, not overwritten with the run's answers.
    expect(env).toContain("PROJECT_NAME=already-here");
    expect(env).toContain("BASE_URL=https://already-here.example.com");
    expect(env).not.toContain("PROJECT_NAME=my-app");
    // Missing keys get appended.
    expect(env).toContain("SUITE_TYPE=smoke");
    expect(env).toContain("ENVIRONMENT=QA");
  });

  it("leaves .env completely untouched when it already has every key", async () => {
    const original = "PROJECT_NAME=x\nBASE_URL=y\nSUITE_TYPE=z\nENVIRONMENT=w";
    await fs.writeFile(path.join(tempDir, ".env"), original);

    await syncIntoExistingProject(tempDir, ANSWERS);

    const env = await fs.readFile(path.join(tempDir, ".env"), "utf8");
    expect(env).toBe(original);
  });
});
