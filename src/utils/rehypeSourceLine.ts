import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

const BLOCK_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "ul", "ol", "pre", "blockquote",
  "table", "hr", "li", "details", "div",
]);

export function rehypeSourceLine() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (!BLOCK_TAGS.has(node.tagName)) return;
      const line = node.position?.start?.line;
      if (!line) return;
      if (!node.properties) {
        node.properties = {};
      }
      (node.properties as Record<string, string | number | boolean | null>).dataSourceLine = line;
    });
  };
}
