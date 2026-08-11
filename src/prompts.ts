import prompts from "prompts";
import fs from "fs-extra";
import path from "path";

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

export async function runPrompts(targetDir: string) {
  const existing = await readExistingEnv(targetDir);

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
      choices: [
        { title: "Smoke", value: "smoke" },
        { title: "Regression", value: "regression" },
        { title: "Sanity", value: "sanity" },
        { title: "Full Suite", value: "full-suite" }
      ],
      initial: existing.SUITE_TYPE
        ? ["smoke", "regression", "sanity", "full-suite"].indexOf(existing.SUITE_TYPE)
        : 0
    },
    {
  type: "select",
  name: "environment",
  message: "Environment?",
  choices: [
    { title: "QA", value: "QA" },
    { title: "Staging", value: "Staging" },
    { title: "Production", value: "Production" }
  ],
  initial: existing.ENVIRONMENT
    ? ["QA", "Staging", "Production"].indexOf(existing.ENVIRONMENT)
    : 0
    }
  ]);

  return answers;
}