import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import type { AiAssistantChoice } from "./aiConfig";

const AI_ASSISTANT_CHOICES: Array<{ title: string; value: AiAssistantChoice }> = [
  { title: "Claude Code", value: "claude-code" },
  { title: "GitHub Copilot", value: "copilot" },
  { title: "Cursor", value: "cursor" },
  { title: "Other", value: "other" },
  { title: "Skip", value: "skip" },
];

const SUITE_TYPE_CHOICES = [
  { title: "Smoke", value: "smoke" },
  { title: "Regression", value: "regression" },
  { title: "Sanity", value: "sanity" },
  { title: "Full Suite", value: "full-suite" }
];

const ENVIRONMENT_CHOICES = [
  { title: "QA", value: "QA" },
  { title: "Staging", value: "Staging" },
  { title: "Production", value: "Production" }
];

const REPORT_CHOICES = [
  { title: "Allure Report", value: "allure" as const },
  { title: "Ortoni Report", value: "ortoni" as const }
];

export interface RunPromptsOptions {
  /** Skip the interactive `prompts()` call and return defaults instead. Used by `--yes`. */
  skipPrompts?: boolean;
  /**
   * Base URL to use when skipPrompts is true. Required in that case — see the comment
   * above the check below for why it can't be defaulted the way every other field is.
   */
  baseUrl?: string;
}

export interface PromptAnswers {
  projectName: string;
  baseUrl: string;
  suiteType: string;
  environment: string;
  installPlaywrightMcp: boolean;
  aiAssistant: AiAssistantChoice;
  reportChoice: "allure" | "ortoni";
}

/** Thrown by runPrompts when skipPrompts is true but no base URL is available. */
export class MissingBaseUrlError extends Error {
  constructor() {
    super("A base URL is required when using --yes. Pass one with --url <url>.");
    this.name = "MissingBaseUrlError";
  }
}

async function readExistingEnv(targetDir: string): Promise<Record<string, string>> {
  const envPath = path.join(targetDir, ".env");
  const exists = await fs.pathExists(envPath);
  if (!exists) return {};

  const content = await fs.readFile(envPath, "utf8");
  const values: Record<string, string> = {};
  content.split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      values[key.trim()] = rest.join("=").trim();
    }
  });
  return values;
}

/** True if the target already registers a "playwright" server in its .mcp.json. */
async function detectExistingPlaywrightMcp(targetDir: string): Promise<boolean> {
  const mcpConfigPath = path.join(targetDir, ".mcp.json");
  if (!(await fs.pathExists(mcpConfigPath))) return false;

  const config = await fs.readJson(mcpConfigPath).catch(() => ({}));
  return Boolean(config?.mcpServers?.playwright);
}

/**
 * Which of "allure" | "ortoni" is already wired into the target's playwright.config.ts
 * reporter array, if it unambiguously has exactly one of them. Undefined if there's no
 * existing config, neither is present, or both are (no single existing choice to reflect).
 */
async function detectConfiguredReporter(targetDir: string): Promise<"allure" | "ortoni" | undefined> {
  const configPath = path.join(targetDir, "playwright.config.ts");
  if (!(await fs.pathExists(configPath))) return undefined;

  const content = await fs.readFile(configPath, "utf8").catch(() => "");
  const hasAllure = content.includes("allure-playwright");
  const hasOrtoni = content.includes("ortoni-report");

  if (hasAllure && !hasOrtoni) return "allure";
  if (hasOrtoni && !hasAllure) return "ortoni";
  return undefined;
}

/**
 * Which AI assistant config file already exists in the target folder, if any — used to
 * pre-fill the "Which AI coding assistant do you use?" prompt so a re-run of `testroid init`
 * defaults to whatever's already there instead of always defaulting to Claude Code.
 */
async function detectExistingAiAssistant(targetDir: string): Promise<AiAssistantChoice | undefined> {
  if (await fs.pathExists(path.join(targetDir, "CLAUDE.md"))) return "claude-code";
  if (await fs.pathExists(path.join(targetDir, ".github", "copilot-instructions.md"))) return "copilot";
  if (await fs.pathExists(path.join(targetDir, ".cursorrules"))) return "cursor";
  if (await fs.pathExists(path.join(targetDir, ".cursor", "rules"))) return "cursor";
  return undefined;
}

export async function runPrompts(targetDir: string, options: RunPromptsOptions = {}): Promise<PromptAnswers> {
  const { skipPrompts = false, baseUrl } = options;

  const existing = await readExistingEnv(targetDir);
  const hasExistingPlaywrightMcp = await detectExistingPlaywrightMcp(targetDir);
  const configuredReporter = await detectConfiguredReporter(targetDir);
  const detectedAiAssistant = await detectExistingAiAssistant(targetDir);

  if (skipPrompts) {
    // Every other field below has a safe, generic fallback (a placeholder project name,
    // "smoke"/"QA" as sane starting choices, etc). A base URL doesn't: it's the one piece
    // of per-project data that's arbitrary and load-bearing — silently defaulting it (e.g.
    // to "http://localhost") would let `--yes` succeed while quietly pointing every
    // generated test at the wrong target. So it's the one field with no built-in default:
    // callers must supply it via --url, or already have BASE_URL in an existing .env.
    const resolvedBaseUrl = baseUrl ?? existing.BASE_URL;
    if (!resolvedBaseUrl) {
      throw new MissingBaseUrlError();
    }

    const suiteType = existing.SUITE_TYPE && SUITE_TYPE_CHOICES.some((c) => c.value === existing.SUITE_TYPE)
      ? existing.SUITE_TYPE
      : SUITE_TYPE_CHOICES[0].value;

    const environment = existing.ENVIRONMENT && ENVIRONMENT_CHOICES.some((c) => c.value === existing.ENVIRONMENT)
      ? existing.ENVIRONMENT
      : ENVIRONMENT_CHOICES[0].value;

    return {
      projectName: existing.PROJECT_NAME ?? "my-testroid-project",
      baseUrl: resolvedBaseUrl,
      suiteType,
      environment,
      // Matches the interactive prompt's own default (`initial: true`), which is always
      // "Yes" regardless of whether an MCP config already exists — see the message text
      // above, which only changes the wording, never the default answer.
      installPlaywrightMcp: true,
      aiAssistant: detectedAiAssistant ?? AI_ASSISTANT_CHOICES[0].value,
      // Deliberately NOT using `configuredReporter` here. Unlike the AI-assistant default
      // above (which mirrors whatever's already on disk), the non-interactive reporter
      // default always takes the first item in the choice list ("allure") — predictable
      // and independent of repo state, which matters more than reflecting existing config
      // when running unattended in CI/scripts.
      reportChoice: REPORT_CHOICES[0].value
    };
  }

  const answers = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name?",
      initial: existing.PROJECT_NAME ?? "my-testroid-project"
    },
    {
      type: "text",
      name: "baseUrl",
      message: "Base URL of the website to test?",
      initial: existing.BASE_URL ?? "",
      validate: (value: string) =>
        value.startsWith("http") ? true : "Enter a valid URL (starting with http/https)"
    },
    {
      type: "select",
      name: "suiteType",
      message: "Test suite type?",
      choices: SUITE_TYPE_CHOICES,
      initial: existing.SUITE_TYPE
        ? SUITE_TYPE_CHOICES.findIndex((choice) => choice.value === existing.SUITE_TYPE)
        : 0
    },
    {
      type: "select",
      name: "environment",
      message: "Environment?",
      choices: ENVIRONMENT_CHOICES,
      initial: existing.ENVIRONMENT
        ? ENVIRONMENT_CHOICES.findIndex((choice) => choice.value === existing.ENVIRONMENT)
        : 0
    },
    {
      type: "confirm",
      name: "installPlaywrightMcp",
      message: hasExistingPlaywrightMcp
        ? "Playwright MCP server is already configured here — keep it enabled?"
        : "Install Playwright MCP server for AI-assisted browser automation?",
      initial: true
    },
    {
      type: "select",
      name: "aiAssistant",
      message: "Which AI coding assistant do you use?",
      choices: AI_ASSISTANT_CHOICES,
      initial: detectedAiAssistant
        ? AI_ASSISTANT_CHOICES.findIndex((choice) => choice.value === detectedAiAssistant)
        : 0
    },
    {
      type: "select",
      name: "reportChoice",
      message: "Which test report would you like?",
      choices: REPORT_CHOICES,
      initial: configuredReporter === "ortoni" ? 1 : 0
    }
  ]);

  return answers as PromptAnswers;
}
