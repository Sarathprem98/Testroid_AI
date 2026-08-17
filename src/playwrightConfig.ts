import fs from "fs-extra";

// Not currently wired into `testroid init` — mobile-chrome inclusion used to be an install-time
// prompt (scaffold.ts/sync.ts called applyMobileChromeChoice after copying playwright.config.ts
// in), but that's now a per-scenario call the AI assistant makes at pipeline-run time instead
// (see WORKING_WITH_TEST_INPUT_SECTION in src/claudeMd.ts) — mobile-chrome is always present in
// the generated config again. Kept here as a building block in case a future flow (e.g. an
// agent stripping/restoring the project programmatically) needs it.

/**
 * Strips the `{ name: 'mobile-chrome', ... }` project entry out of a playwright.config.ts
 * source string's `projects: [...]` array, via brace-depth counting (mirrors
 * src/reporting.ts's own reporter-array editing) rather than a fixed string match, so it
 * survives incidental reformatting of the template. No-ops (returns the source unchanged) if
 * the entry isn't found — e.g. already removed, or the template's shape changed — rather
 * than guessing.
 */
export function removeMobileChromeProject(source: string): string {
  const marker = source.indexOf("name: 'mobile-chrome'");
  if (marker === -1) return source;

  const start = source.lastIndexOf("{", marker);
  if (start === -1) return source;

  let depth = 0;
  let end = -1;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return source;

  let sliceEnd = end + 1;
  if (source[sliceEnd] === ",") sliceEnd++;
  if (source[sliceEnd] === "\n") sliceEnd++;

  // Also drop the object's own leading indentation, so removal doesn't leave a blank
  // indented line behind.
  let sliceStart = start;
  while (sliceStart > 0 && (source[sliceStart - 1] === " " || source[sliceStart - 1] === "\t")) {
    sliceStart--;
  }

  return source.slice(0, sliceStart) + source.slice(sliceEnd);
}

/**
 * Applies a mobile-chrome opt-in choice to a playwright.config.ts just written at
 * `configPath` — a no-op when `includeMobileChrome` is true (the template already includes
 * the project) so callers can call this unconditionally after copying the file in. Intended
 * only for a freshly-copied Testroid config, never one an existing project already owned.
 */
export async function applyMobileChromeChoice(configPath: string, includeMobileChrome: boolean): Promise<void> {
  if (includeMobileChrome) return;
  if (!(await fs.pathExists(configPath))) return;

  const source = await fs.readFile(configPath, "utf8");
  const updated = removeMobileChromeProject(source);
  if (updated !== source) {
    await fs.writeFile(configPath, updated);
  }
}
