export interface ThemePalette {
  bg: string;
  fg: string;
  muted: string;
  border: string;
  link: string;
  codeBg: string;
  blockquoteBorder: string;
  accent: string;
}

export const githubLight: ThemePalette = {
  bg: "#ffffff",
  fg: "#1F2328",
  muted: "#656d76",
  border: "#d0d7de",
  link: "#0969da",
  codeBg: "#f6f8fa",
  blockquoteBorder: "#d0d7de",
  accent: "#0969da",
};

export const githubDark: ThemePalette = {
  bg: "#0d1117",
  fg: "#c9d1d9",
  muted: "#8b949e",
  border: "#30363d",
  link: "#58a6ff",
  codeBg: "#161b22",
  blockquoteBorder: "#30363d",
  accent: "#58a6ff",
};
