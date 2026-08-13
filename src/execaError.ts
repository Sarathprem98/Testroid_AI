/**
 * Extracts captured stderr from a failed execa call for display after a spinner's
 * fail() — needed because spinner steps run without `stdio: 'inherit'` (that would
 * corrupt the spinner's animation), so execa's own output capture is the only place
 * the underlying command's error output survives for debugging.
 */
export function getExecaErrorDetail(err: unknown): string {
  if (err && typeof err === "object" && "stderr" in err) {
    return String((err as { stderr?: unknown }).stderr ?? "").trim();
  }
  return "";
}
