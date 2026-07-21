/**
 * Mirror messages/fa/*.json structure into every other locale folder.
 * Non-fa locales get empty strings (fallback to fa at runtime).
 *
 * Usage: npm run i18n:scaffold
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesRoot = path.join(__dirname, "..", "messages");
const faDir = path.join(messagesRoot, "fa");

function emptyLeafValues(value) {
  if (typeof value === "string") return "";
  if (Array.isArray(value)) return value.map(emptyLeafValues);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = emptyLeafValues(child);
    }
    return out;
  }
  return value;
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(dir, name));
}

const faFiles = listJsonFiles(faDir);
if (!faFiles.length) {
  console.error("No JSON files in messages/fa/");
  process.exit(1);
}

const localeDirs = fs
  .readdirSync(messagesRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "fa" && d.name !== "legacy")
  .map((d) => d.name);

const allLocales = new Set([
  ...localeDirs,
  "en",
  "es",
  "nl",
  "ar",
  "ru",
  "ur",
  "fi",
  "tr",
]);

for (const locale of allLocales) {
  const outDir = path.join(messagesRoot, locale);
  fs.mkdirSync(outDir, { recursive: true });
  for (const faPath of faFiles) {
    const fileName = path.basename(faPath);
    const faData = JSON.parse(fs.readFileSync(faPath, "utf8"));
    const outPath = path.join(outDir, fileName);
    const payload = locale === "fa" ? faData : emptyLeafValues(faData);
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${outPath}`);
  }
}

console.log("Done. Edit messages/fa/*.json only; re-run to refresh empty templates.");
