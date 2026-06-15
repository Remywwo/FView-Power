import { readDir } from "@tauri-apps/plugin-fs";
import { basename, join } from "@tauri-apps/api/path";

export interface FolderNode {
  name: string;
  path: string;
  isDir: boolean;
  children: FolderNode[];
}

const MAX_DEPTH = 32;
const SKIP_NAMES = new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  "target",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  ".cache",
  ".parcel-cache",
  "__pycache__",
  ".venv",
  "venv",
]);

function shouldSkip(name: string): boolean {
  if (name.startsWith(".")) return true;
  if (SKIP_NAMES.has(name)) return true;
  return false;
}

function sortChildren(children: FolderNode[]): void {
  children.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  });
}

export async function scanFolder(path: string, depth = 0): Promise<FolderNode> {
  const node: FolderNode = {
    name: await basename(path),
    path,
    isDir: true,
    children: [],
  };

  if (depth >= MAX_DEPTH) {
    console.warn(`scanFolder: max depth reached at ${path}`);
    return node;
  }

  try {
    const entries = await readDir(path);
    for (const entry of entries) {
      if (!entry.name || shouldSkip(entry.name)) continue;
      if (entry.isSymlink) continue;
      const childPath = await join(path, entry.name);
      if (entry.isDirectory) {
        node.children.push(await scanFolder(childPath, depth + 1));
      } else if (entry.isFile) {
        node.children.push({
          name: entry.name,
          path: childPath,
          isDir: false,
          children: [],
        });
      }
    }
    sortChildren(node.children);
  } catch (e) {
    console.warn("Failed to read directory:", path, e);
  }

  return node;
}

export function collectFolderPaths(node: FolderNode): Set<string> {
  const result = new Set<string>();
  const walk = (n: FolderNode) => {
    if (n.isDir) {
      result.add(n.path);
      for (const child of n.children) walk(child);
    }
  };
  walk(node);
  return result;
}
