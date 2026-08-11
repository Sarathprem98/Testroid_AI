import { runPrompts } from "../prompts";
import { scaffoldProject } from "../scaffold";

export async function initCommand() {
  console.log("🚀 Testroid init starting...\n");

  const answers = await runPrompts();
  const targetDir = process.cwd();

  await scaffoldProject(targetDir, answers);

  console.log("\nNext steps:");
  console.log("  npm install");
  console.log("  npx playwright install --with-deps");
}
