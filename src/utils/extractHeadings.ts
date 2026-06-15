import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";
import type { Heading as MdastHeading, Text, InlineCode, PhrasingContent } from "mdast";

export interface Heading {
  depth: number;
  text: string;
  id: string;
}

export function extractHeadings(markdown: string): Heading[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  visit(tree, "heading", (node: MdastHeading) => {
    const text = node.children
      .map((c: PhrasingContent) => {
        if (c.type === "text" || c.type === "inlineCode") {
          return (c as Text | InlineCode).value;
        }
        return "";
      })
      .join("");
    headings.push({
      depth: node.depth,
      text,
      id: slugger.slug(text),
    });
  });
  return headings;
}
