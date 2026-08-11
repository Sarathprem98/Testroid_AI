import prompts from "prompts";

export async function runPrompts() {
  const answers = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name?",
      initial: "my-testroid-project"
    },
    {
      type: "text",
      name: "baseUrl",
      message: "Base URL of the website to test?",
      validate: (value: string) =>
        value.startsWith("http") ? true : "Enter a valid URL (starting with http/https)"
    },
    {
      type: "select",
      name: "environment",
      message: "Environment?",
      choices: [
        { title: "QA", value: "qa" },
        { title: "Staging", value: "staging" },
        { title: "Production", value: "production" }
      ]
    }
  ]);

  return answers;
}