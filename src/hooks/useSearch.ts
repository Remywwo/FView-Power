import { useCallback, useState } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";
import type { FolderNode } from "@/utils/scanFolder";

export interface SearchResult {
  path: string;
  name: string;
  line: number;
  content: string;
}

const READABLE_EXTS = new Set([
  "md", "markdown", "txt", "html", "htm", "css", "scss", "less",
  "js", "jsx", "ts", "tsx", "json", "xml", "svg", "yaml", "yml",
  "py", "rs", "go", "java", "c", "cpp", "h", "hpp", "cs", "rb",
  "php", "sh", "bash", "zsh", "sql", "graphql", "toml", "ini",
  "cfg", "conf", "env", "gitignore", "lock", "log",
]);

function isReadable(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return true; // no extension, treat as text
  return READABLE_EXTS.has(name.slice(dot + 1).toLowerCase());
}

function* walkFiles(node: FolderNode): Generator<FolderNode> {
  if (!node.isDir) {
    if (isReadable(node.name)) yield node;
    return;
  }
  for (const child of node.children) {
    yield* walkFiles(child);
  }
}

export function useSearch(root: FolderNode | null) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!root || !query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    setLoading(true);
    const found: SearchResult[] = [];
    const MAX_RESULTS = 100;

    try {
      for (const file of walkFiles(root)) {
        if (found.length >= MAX_RESULTS) break;
        try {
          const text = await readTextFile(file.path);
          const lines = text.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(q)) {
              found.push({
                path: file.path,
                name: file.name,
                line: i + 1,
                content: lines[i].trim(),
              });
              if (found.length >= MAX_RESULTS) break;
            }
          }
        } catch {
          // skip unreadable files
        }
      }
      setResults(found);
    } finally {
      setLoading(false);
    }
  }, [root]);

  const clear = useCallback(() => setResults([]), []);

  return { results, loading, search, clear };
}
