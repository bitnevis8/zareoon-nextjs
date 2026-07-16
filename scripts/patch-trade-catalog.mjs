import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "..", "app", "data", "tradeServicesCatalog.js");
let src = fs.readFileSync(filePath, "utf8");
const marker = "/** Illustrative sample providers until a backend catalog exists. */";
const endMarker = "export function getSampleProviders";
const i = src.indexOf(marker);
const j = src.indexOf(endMarker);
if (i < 0 || j < 0) throw new Error("markers not found");
const head =
  src.slice(0, i + marker.length) +
  '\nimport sampleTradeServiceProviders from "../../messages/fa/tradeServiceSamples.json";\n\nexport { sampleTradeServiceProviders };\n\n';
const tail = src.slice(j);
fs.writeFileSync(filePath, head + tail);
console.log("patched tradeServicesCatalog.js");
