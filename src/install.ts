import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import os from "os";

export async function runInstallSteps(targetDir: string) {
  await runNpmInstall(targetDir);
  await runPlaywrightInstall(targetDir);
}

async function runNpmInstall(targetDir: string) {
  const nodeModulesPath = path.join(targetDir, "node_modules");
  const pkgLockPath = path.join(targetDir, "package-lock.json");

  const nodeModulesExists = await fs.pathExists(nodeModulesPath);

  if (nodeModulesExists) {
    console.log("⏭️  node_modules already present — skipping npm install");
    console.log("   (run 'npm install' manually if you added new dependencies)");
    return;
  }

  console.log("📦 Installing npm dependencies...");
  try {
    await execa("npm", ["install"], { cwd: targetDir, stdio: "inherit" });
    console.log("✅ npm install complete");
  } catch (err) {
    console.error("❌ npm install failed — please run it manually.");
    throw err;
  }

  void pkgLockPath; // reserved for future lock-diff checks
}

async function runPlaywrightInstall(targetDir: string) {
  // Check if Playwright browsers are already cached
  const isInstalled = await checkPlaywrightBrowsersInstalled();

  if (isInstalled) {
    console.log("⏭️  Playwright browsers already installed — skipping");
    return;
  }

  console.log("🎭 Installing Playwright browsers (this may take a minute)...");
  try {
    await execa("npx", ["playwright", "install", "--with-deps"], {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log("✅ Playwright browsers installed");
  } catch (err) {
    console.error("❌ Playwright browser install failed — please run it manually:");
    console.error("   npx playwright install --with-deps");
    throw err;
  }
}

async function checkPlaywrightBrowsersInstalled(): Promise<boolean> {
  const cacheDir =
    process.platform === "win32"
      ? path.join(os.homedir(), "AppData", "Local", "ms-playwright")
      : process.platform === "darwin"
      ? path.join(os.homedir(), "Library", "Caches", "ms-playwright")
      : path.join(os.homedir(), ".cache", "ms-playwright");

  const exists = await fs.pathExists(cacheDir);
  if (!exists) return false;

  const entries = await fs.readdir(cacheDir).catch(() => []);
  // Look for at least one of the core browser folders
  const hasBrowsers = entries.some(
    (e) => e.startsWith("chromium") || e.startsWith("firefox") || e.startsWith("webkit")
  );

  return hasBrowsers;
}
