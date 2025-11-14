import fs from "fs";

export type LCFValue = string | number | boolean | Array<any> | Record<string, any> | null;

export interface LCFParseOptions {
  trim?: boolean;
}

export class LCFConfigInstance {
  private data: Record<string, any> = {};
  private hidden: Set<string> = new Set();

  constructor(data: Record<string, any>, hidden: Set<string>) {
    this.data = data;
    this.hidden = hidden;
  }

  get(pathStr: string, defaultValue?: any): LCFValue {
    const parts = pathStr.split(":").filter(Boolean);
    let cur: any = this.data;
    for (const p of parts) {
      if (cur == null || typeof cur !== "object" || !(p in cur)) {
        return defaultValue;
      }
      cur = cur[p];
    }
    return cur;
  }

  toObject(): Record<string, any> {
    return JSON.parse(JSON.stringify(this.data));
  }

  getHiddenKeys(): string[] {
    return Array.from(this.hidden);
  }
}

function tryParseValue(raw: string): LCFValue {
  const v = raw.trim();
  if (v === "") return "";
  if (/^(true|false)$/i.test(v)) return v.toLowerCase() === "true";
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if ((v.startsWith("[") && v.endsWith("]")) || (v.startsWith("{") && v.endsWith("}"))) {
    try { return JSON.parse(v); } catch {}
  }
  return v;
}

export function parseLCF(content: string, opts?: LCFParseOptions): { data: Record<string, any>, hidden: Set<string> } {
  const lines = content.split(/\r?\n/);
  const root: Record<string, any> = {};
  const hidden = new Set<string>();
  const stack: Array<{name: string, indent: number, ref: Record<string, any>}> = [{ name: "", indent: -1, ref: root }];

  for (let rawLine of lines) {
    const line = rawLine.replace(/\t/g, "    ");
    if (/^\s*$/.test(line)) continue;
    const indent = line.match(/^ */)?.[0].length ?? 0;
    const trimmed = line.trim();

    if (trimmed.startsWith("::")) {
      const secName = trimmed.slice(2).trim();
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].ref;
      if (!(secName in parent)) parent[secName] = {};
      const newRef = parent[secName];
      stack.push({ name: secName, indent, ref: newRef });
    } else {
      const kvMatch = trimmed.split(">>");
      if (kvMatch.length < 2) continue;

      const rawKey = (kvMatch.shift() ?? "").trim();
      const rawVal = kvMatch.join(">>").trim();
      const isHidden = rawKey.startsWith("$");
      const key = isHidden ? rawKey.slice(1) : rawKey;
      const parsedValue = tryParseValue(rawVal);

      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].ref;
      parent[key] = parsedValue;

      if (isHidden) {
        const fullPath = stack.map(s => s.name).filter(Boolean).join(":");
        hidden.add((fullPath ? fullPath + ":" : "") + key);
      }
    }
  }
  return { data: root, hidden };
}

export function LCFConfig(fileOrContent: string, opts?: LCFParseOptions): LCFConfigInstance {
  let content: string;
  if (fs.existsSync(fileOrContent) && fs.lstatSync(fileOrContent).isFile()) {
    content = fs.readFileSync(fileOrContent, "utf-8");
  } else content = fileOrContent;

  const { data, hidden } = parseLCF(content, opts);
  return new LCFConfigInstance(data, hidden);
}

export default LCFConfig;
