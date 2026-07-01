import { useLexicalMarkdownEditor } from "./useLexicalMarkdownEditor";
import type { LexicalEditor } from "lexical";

export interface MarkdownEditorProps {
  content: string;
  onContentChange: (markdown: string) => void;
  editorRef?: React.MutableRefObject<LexicalEditor | null>;
  onEditorReady?: (editor: LexicalEditor) => void;
}

export function MarkdownEditor({ content, onContentChange, editorRef, onEditorReady }: MarkdownEditorProps) {
  const editor = useLexicalMarkdownEditor({
    content,
    onContentChange,
    editorRef,
    onEditorReady,
  });

  return (
    <div
      data-md-editor=""
      style={{ height: "100%", overflow: "hidden" }}
    >
      {editor}
    </div>
  );
}
