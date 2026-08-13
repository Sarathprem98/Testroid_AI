import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import chalk from "chalk";
import ora from "ora";
import { getExecaErrorDetail } from "./execaError";

const MCP_PACKAGE = "@playwright/mcp";
// Exact pin (no ^ or @latest) — this is fetched by `npx` at CLI runtime on every
// user's machine, so an unpinned version is the highest-risk drift point in the
// project. Pinned to avoid breaking changes — review periodically.
const MCP_PACKAGE_VERSION = "0.0.79";
const MCP_SERVER_NAME = "playwright";

// Matches the standard config published in @playwright/mcp's own README for MCP
// clients in general (Claude Code, VS Code, Cursor, Windsurf, etc. all use this
// same command/args shape) — `npx` resolves the locally installed devDependency
// when present, falling back to fetching the pinned version otherwise.
const MCP_SERVER_CONFIG = {
  command: "npx",
  args: [`${MCP_PACKAGE}@${MCP_PACKAGE_VERSION}`],
};

export const MCP_INSTALL_MANUAL_COMMAND = `npm install -D ${MCP_PACKAGE}@${MCP_PACKAGE_VERSION}`;

async function isPlaywrightMcpInstalled(targetDir: string): Promise<boolean> {
  const pkgPath = path.join(targetDir, "package.json");
  if (!(await fs.pathExists(pkgPath))) return false;

  const pkg = await fs.readJson(pkgPath).catch(() => ({}));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return MCP_PACKAGE in deps;
}

async function installMcpPackage(targetDir: string): Promise<void> {
  const versionedSpecifier = `${MCP_PACKAGE}@${MCP_PACKAGE_VERSION}`;
  const spinner = ora(`Installing ${versionedSpecifier}...`).start();
  try {
    // stdin: 'ignore' + --no-audit/--no-fund: without stdio: 'inherit' (dropped so the
    // child's raw output can't tear through the spinner), execa's own default stdin is an
    // open pipe that's never written to or closed — anything in npm's process tree that
    // tries to read a line from it (npm's own one-time prompts, a lifecycle script, ...)
    // blocks forever instead of erroring, invisibly, until Ctrl+C. This guarantees EOF
    // instead, and skips npm's own known post-install steps proactively.
    await execa("npm", ["install", "-D", versionedSpecifier, "--no-audit", "--no-fund"], {
      cwd: targetDir,
      stdin: "ignore"
    });
    spinner.succeed(chalk.green(`${versionedSpecifier} installed`));
  } catch (err) {
    spinner.fail(chalk.red(`${MCP_PACKAGE} install failed — please run it manually:`));
    console.error(chalk.dim(`   npm install -D ${versionedSpecifier}`));
    const detail = getExecaErrorDetail(err);
    if (detail) console.error(chalk.dim(detail));
    throw err;
  }
}

async function writeMcpConfig(targetDir: string): Promise<void> {
  const configPath = path.join(targetDir, ".mcp.json");
  const exists = await fs.pathExists(configPath);
  const existing = exists ? await fs.readJson(configPath).catch(() => ({})) : {};

  if (existing?.mcpServers?.[MCP_SERVER_NAME]) {
    console.log(chalk.dim("⏭️  .mcp.json already registers the playwright MCP server — not touched"));
    return;
  }

  const merged = {
    ...existing,
    mcpServers: {
      ...existing.mcpServers,
      [MCP_SERVER_NAME]: MCP_SERVER_CONFIG,
    },
  };

  await fs.writeJson(configPath, merged, { spaces: 2 });
  console.log(
    chalk.green(
      exists
        ? "✅ Added the playwright server to existing .mcp.json"
        : "✅ Created .mcp.json with the playwright MCP server"
    )
  );
}

export async function installPlaywrightMcp(targetDir: string): Promise<void> {
  const alreadyInstalled = await isPlaywrightMcpInstalled(targetDir);

  if (alreadyInstalled) {
    console.log(chalk.dim(`⏭️  ${MCP_PACKAGE} already installed — skipping`));
  } else {
    await installMcpPackage(targetDir);
  }

  await writeMcpConfig(targetDir);
}
