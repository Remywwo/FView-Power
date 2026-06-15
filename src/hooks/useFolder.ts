import { useCallback, useState } from "react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { scanFolder, type FolderNode } from "@/utils/scanFolder";

export function useFolder() {
  const [root, setRoot] = useState<FolderNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openFolder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const selected = await openDialog({ directory: true, multiple: false, title: "Open Folder" });
      if (typeof selected !== "string") {
        setLoading(false);
        return;
      }
      const tree = await scanFolder(selected);
      setRoot(tree);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const setFolderPath = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const tree = await scanFolder(path);
      setRoot(tree);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!root) return;
    try {
      setLoading(true);
      setError(null);
      const tree = await scanFolder(root.path);
      setRoot(tree);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [root]);

  const close = useCallback(() => {
    setRoot(null);
    setError(null);
  }, []);

  return { root, loading, error, openFolder, setFolderPath, refresh, close };
}
