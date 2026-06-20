import aiAssistant from "@/plugins/extensions/ai-assistant";
import type { ExtensionManifest } from "@/plugins/types";

/**
 * Built-in extensions activated at app startup.
 */
export const builtInExtensions: ExtensionManifest[] = [aiAssistant];
