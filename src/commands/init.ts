import { runPrompts } from "../prompts";
import { scaffoldProject } from "../scaffold";
import { detectProjectState } from "../detect";
import { syncIntoExistingProject } from "../sync";

export async function initCommand() {
  console.log("🚀 Testroid init starting...\n");

  const targetDir = process.cwd();
  const state = await detectProjectState(targetDir);

  console.log(`🔍 Detected project state: ${state}\n`);

  const answers = await runPrompts();

  switch (state) {
    case "empty":
      await scaffoldProject(targetDir, answers);
      break;

    case "playwright-only":
  console.log("🔄 Existing Playwright project detected — syncing Testroid into it (no overwrites).\n");
  await syncIntoExistingProject(targetDir, answers);
  break;

case "playwright-cucumber":
  console.log(
    "⚠️ Cucumber+Playwright detected. Automatic sync for this combination isn't built yet — " +
    "adding Testroid into a separate 'testroid/' subfolder to stay safe."
  );
  await scaffoldProject(`${targetDir}/testroid`, answers);
  break;

    case "unknown":
    default:
      console.log(
        "⚠️ Couldn't confidently detect your project type. " +
        "Adding Testroid into a separate 'testroid/' subfolder to avoid overwriting anything."
      );
      await scaffoldProject(`${targetDir}/testroid`, answers);
      break;
  }

  console.log("\nNext steps:");
  console.log("  npm install");
  console.log("  npx playwright install --with-deps");
}