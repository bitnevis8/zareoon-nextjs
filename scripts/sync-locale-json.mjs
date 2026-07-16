/**
 * Export fa/en/ru translation objects to messages/{locale}/legacy.json
 * Run after editing messages/legacy/translations.data.js OR after fa text changes.
 *
 * AI translation workflow:
 * 1. Give messages/fa/*.json to AI → receive messages/en/*.json (same structure, translated values)
 * 2. Drop en files into messages/en/ — no code changes needed
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const { translations } = await import(
  pathToFileURL(path.join(root, "messages/legacy/translations.data.js")).href
);

const LOCALES = ["fa", "en", "ru"];

for (const locale of LOCALES) {
  const data = translations[locale] || {};
  const dir = path.join(root, "messages", locale);
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, "legacy.json");
  fs.writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outPath} (${Object.keys(data).length} keys)`);
}
