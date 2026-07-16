/**
 * Export fa trade-services content from tradeServicesCatalog.js → messages/fa/trade-services.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const { tradeServicesContent } = await import(
  pathToFileURL(path.join(root, "app/data/tradeServicesCatalog.js")).href
);

const fa = tradeServicesContent.fa;
const outPath = path.join(root, "messages", "fa", "tradeServices.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(fa, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath}`);
