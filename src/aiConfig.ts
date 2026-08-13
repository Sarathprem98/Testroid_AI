import fs from "fs-extra";
import path from "path";

export type AiAssistantChoice = "claude-code" | "copilot" | "cursor" | "other" | "skip";

// Cursor's Project Rules format (.mdc files under .cursor/rules/, YAML frontmatter with
// description/globs/alwaysApply) per https://docs.cursor.com/context/rules as of this writing.
// Cursor has changed this format before — re-verify against their current docs if rules
// written by this block stop being picked up.
const CURSOR_RULE_FRONTMATTER = `---
description: Testroid framework conventions and AI agent pipeline guidance
globs:
alwaysApply: true
---

`;

async function writeIfAbsent(filePath: string, label: string, content: string): Promise<void> {
  if (await fs.pathExists(filePath)) {
    console.log(`⏭️  ${label} already exists — not touched.`);
    return;
  }
  await fs.writeFile(filePath, content);
  console.log(`✅ ${label} generated`);
}

/**
 * Writes Testroid's generated AI-assistant guidance (`src/claudeMd.ts`'s tool-agnostic
 * `generateAssistantGuide` output) to whichever location the chosen tool expects. Never
 * overwrites an existing file — same non-destructive principle as the rest of `testroid init`.
 */
export async function writeAiAssistantConfig(
  targetDir: string,
  tool: AiAssistantChoice,
  content: string
): Promise<void> {
  switch (tool) {
    case "claude-code":
      await writeIfAbsent(path.join(targetDir, "CLAUDE.md"), "CLAUDE.md", content);
      return;

    case "copilot": {
      const githubDir = path.join(targetDir, ".github");
      await fs.ensureDir(githubDir);
      await writeIfAbsent(
        path.join(githubDir, "copilot-instructions.md"),
        ".github/copilot-instructions.md",
        content
      );
      return;
    }

    case "cursor": {
      const rulesDir = path.join(targetDir, ".cursor", "rules");
      await fs.ensureDir(rulesDir);
      await writeIfAbsent(
        path.join(rulesDir, "testroid.mdc"),
        ".cursor/rules/testroid.mdc",
        CURSOR_RULE_FRONTMATTER + content
      );
      return;
    }

    case "other":
      await writeIfAbsent(path.join(targetDir, "AGENTS.md"), "AGENTS.md", content);
      return;

    case "skip":
      console.log(
        "⏭️  Skipped AI assistant config file — add one later: CLAUDE.md, " +
        ".github/copilot-instructions.md, .cursor/rules/testroid.mdc, or AGENTS.md."
      );
      return;
  }
}
