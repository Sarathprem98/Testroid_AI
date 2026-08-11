import { runPrompts } from "../prompts";
import { scaffoldProject } from "../scaffold";
import { detectProjectState } from "../detect";
import { syncIntoExistingProject } from "../sync";
import { runInstallSteps } from "../install";

export async function initCommand() {
  console.log("🚀 Testroid init starting...\n");

  const targetDir = process.cwd();
  const state = await detectProjectState(targetDir);

  console.log(`🔍 Detected project state: ${state}\n`);

  const answers = await runPrompts(targetDir);

  let installDir = targetDir;

  switch (state) {
    case "empty":
      await scaffoldProject(targetDir, answers);
      installDir = targetDir;
      break;

    case "playwright-only":
      console.log("🔄 Existing Playwright project detected — syncing Testroid into it (no overwrites).\n");
      await syncIntoExistingProject(targetDir, answers);
      installDir = targetDir;
      break;

    case "playwright-cucumber":
      console.log(
        "⚠️ Cucumber+Playwright detected. Automatic sync for this combination isn't built yet — " +
        "adding Testroid into a separate 'testroid/' subfolder to stay safe."
      );
      await scaffoldProject(`${targetDir}/testroid`, answers);
      installDir = `${targetDir}/testroid`;
      break;

    case "unknown":
    default:
      console.log(
        "⚠️ Couldn't confidently detect your project type. " +
        "Adding Testroid into a separate 'testroid/' subfolder to avoid overwriting anything."
      );
      await scaffoldProject(`${targetDir}/testroid`, answers);
      installDir = `${targetDir}/testroid`;
      break;
  }

  console.log("");
  await runInstallSteps(installDir);

  console.log("\n✅ Testroid is ready to use!");
}