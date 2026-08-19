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

/** Returns true if the file was actually written (didn't already exist), false if it was
 * left untouched. */
async function writeIfAbsent(filePath: string, label: string, content: string): Promise<boolean> {
  if (await fs.pathExists(filePath)) {
    console.log(`⏭️  ${label} already exists — not touched.`);
    return false;
  }
  await fs.writeFile(filePath, content);
  console.log(`✅ ${label} generated`);
  return true;
}

/**
 * Writes Testroid's generated AI-assistant guidance (`src/claudeMd.ts`'s tool-agnostic
 * `generateAssistantGuide` output) to whichever location the chosen tool expects. Never
 * overwrites an existing file — same non-destructive principle as the rest of `testroid init`.
 *
 * Returns the path (relative to targetDir) that was actually written, or undefined if
 * nothing was written (already existed, or `tool` is "skip") — used to record exactly what
 * to remove in the undo manifest.
 */
export async function writeAiAssistantConfig(
  targetDir: string,
  tool: AiAssistantChoice,
  content: string
): Promise<string | undefined> {
  switch (tool) {
    case "claude-code":
      return (await writeIfAbsent(path.join(targetDir, "CLAUDE.md"), "CLAUDE.md", content))
        ? "CLAUDE.md"
        : undefined;

    case "copilot": {
      const relativePath = path.join(".github", "copilot-instructions.md");
      await fs.ensureDir(path.join(targetDir, ".github"));
      const wrote = await writeIfAbsent(path.join(targetDir, relativePath), relativePath, content);
      return wrote ? relativePath : undefined;
    }

    case "cursor": {
      const relativePath = path.join(".cursor", "rules", "testroid.mdc");
      await fs.ensureDir(path.join(targetDir, ".cursor", "rules"));
      const wrote = await writeIfAbsent(
        path.join(targetDir, relativePath),
        relativePath,
        CURSOR_RULE_FRONTMATTER + content
      );
      return wrote ? relativePath : undefined;
    }

    case "other":
      return (await writeIfAbsent(path.join(targetDir, "AGENTS.md"), "AGENTS.md", content))
        ? "AGENTS.md"
        : undefined;

    case "skip":
      console.log(
        "⏭️  Skipped AI assistant config file — add one later: CLAUDE.md, " +
        ".github/copilot-instructions.md, .cursor/rules/testroid.mdc, or AGENTS.md."
      );
      return undefined;
  }
}
