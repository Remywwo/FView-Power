import { useI18n } from "@/hooks/useI18n";
import { useSettings } from "@/hooks/useSettings";
import { useExtensionContext } from "@/hooks/usePlugin";
import type { ConcreteHostAPI } from "@/plugins/host";
import { buildSummarizePrompt } from "../prompts/summarize";
import { getPdfContext, getPdfCurrentPage, getPageText, getChapterText, getOutlineSummary } from "../pdfContext";

interface Props {
  onSend: (userInput: string, opts?: { system?: string; input?: string }) => void;
  loading: boolean;
}

export function PresetCommands({ onSend, loading }: Props) {
  const { t } = useI18n();
  const { host } = useExtensionContext();
  const concrete = host as ConcreteHostAPI;
  const { settings } = useSettings();

  const targetLang = settings.aiTargetLang === "auto"
    ? (concrete.i18n.lang() === "zh" ? "zh" : "en")
    : settings.aiTargetLang;

  const disabled = loading;

  const commands = [
    {
      label: t("ai.summarizePage"),
      action: () => {
        const file = concrete.file.get();
        if (!file) { concrete.notify(concrete.i18n.t("ai.noFile"), "warn"); return; }
        if (file.kind === "pdf") {
          const page = getPdfCurrentPage();
          const text = getPageText(page);
          if (!text) { concrete.notify(concrete.i18n.t("ai.noFile"), "warn"); return; }
          const req = buildSummarizePrompt("pdfPage", { input: text, targetLang });
          onSend(req.user, { system: req.system });
        } else {
          const sel = concrete.selection.get();
          const selText = sel.markdown || "";
          const input = selText || file.content;
          const req = buildSummarizePrompt(selText ? "selection" : "document", { input, targetLang });
          onSend(req.user, { system: req.system });
        }
      },
    },
    {
      label: t("ai.summarizeChapter"),
      action: () => {
        const file = concrete.file.get();
        if (!file) { concrete.notify(concrete.i18n.t("ai.noFile"), "warn"); return; }
        if (file.kind === "pdf") {
          const outline = getOutlineSummary();
          const page = getPdfCurrentPage();
          const pageText = getPageText(page);
          // Try to find the chapter that contains the current page via outline context.
          // For now, inject the full outline + current page and let the AI identify the chapter.
          const ctx = getPdfContext(page);
          if (!ctx) { concrete.notify(concrete.i18n.t("ai.noFile"), "warn"); return; }
          const system = `You are reading a PDF. Identify the chapter that contains page ${page} and summarize that chapter specifically.\n\n${ctx}`;
          const user = `Summarize the chapter that contains page ${page}.`;
          onSend(user, { system });
        } else {
          const req = buildSummarizePrompt("document", { input: file.content, targetLang });
          onSend(req.user, { system: req.system });
        }
      },
    },
    {
      label: t("ai.summarizeDoc"),
      action: () => {
        const file = concrete.file.get();
        if (!file) { concrete.notify(concrete.i18n.t("ai.noFile"), "warn"); return; }
        if (file.kind === "pdf") {
          const ctx = getPdfContext(getPdfCurrentPage());
          if (!ctx) { concrete.notify(concrete.i18n.t("ai.noFile"), "warn"); return; }
          const system = `You are reading a PDF document. Here is the full outline:\n\n${getOutlineSummary()}\n\nSummarize the ENTIRE document based on the outline structure.`;
          const user = "Summarize this entire document.";
          onSend(user, { system });
        } else {
          const req = buildSummarizePrompt("document", { input: file.content, targetLang });
          onSend(req.user, { system: req.system });
        }
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {commands.map((cmd) => (
        <button
          key={cmd.label}
          onClick={cmd.action}
          disabled={disabled}
          style={{
            fontSize: 11,
            padding: "4px 12px",
            borderRadius: 14,
            border: "1px solid var(--md-border)",
            background: disabled ? "var(--md-code-bg)" : "var(--md-bg)",
            color: disabled ? "var(--md-muted)" : "var(--md-fg)",
            cursor: disabled ? "default" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {cmd.label}
        </button>
      ))}
    </div>
  );
}
