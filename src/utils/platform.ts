/**
 * Platform detection for displaying platform-specific keyboard shortcuts.
 *
 * The actual key binding is always registered through the `Mod+` modifier in
 * `useCommands`, which maps to `Cmd` on macOS and `Ctrl` elsewhere. This helper
 * only governs what label we render in the UI so users see the key they
 * actually need to press on their machine.
 */
export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";
  return /Mac|iPhone|iPad/.test(platform) || /Mac OS X/.test(userAgent);
}
