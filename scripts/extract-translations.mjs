import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcPath = path.join(root, "app/context/LanguageContext.js");
const src = fs.readFileSync(srcPath, "utf8");
const marker = "const translations = {";
const start = src.indexOf(marker);
if (start < 0) throw new Error("translations block not found");

let depth = 0;
let end = -1;
const openBrace = start + marker.length - 1;
for (let i = openBrace; i < src.length; i++) {
  const ch = src[i];
  if (ch === "{") depth++;
  else if (ch === "}") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
if (end < 0) throw new Error("could not find end of translations object");

const block = src.slice(start, end).replace("const translations", "export const translations");
const outDir = path.join(root, "messages/legacy");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "translations.data.js"), `${block}\n`, "utf8");
console.log("Wrote messages/legacy/translations.data.js");
