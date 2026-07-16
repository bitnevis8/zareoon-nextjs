/**
 * List app files with Persian in string literals (not comments).
 * Run: npm run i18n:audit
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "..", "app");
const PERSIAN = /[\u0600-\u06FF]/;

const SKIP_DIRS = new Set(["node_modules", ".next"]);
const SKIP_GLOBS = [/^app\/test-/, /^app\/test\./];

function stripComments(source) {
  let out = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  return out;
}

function hasPersianStringLiteral(source) {
  const stripped = stripComments(source);
  const patterns = [
    /"[^"\\]*(?:\\.[^"\\]*)*"/g,
    /'[^'\\]*(?:\\.[^'\\]*)*'/g,
    /`[^`\\]*(?:\\.[^`\\]*)*`/g,
  ];
  for (const re of patterns) {
    for (const match of stripped.matchAll(re)) {
      if (PERSIAN.test(match[0])) return true;
    }
  }
  return false;
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const rel = path.relative(path.join(__dirname, ".."), full).replace(/\\/g, "/");
      if (SKIP_GLOBS.some((re) => re.test(rel))) continue;
      const source = fs.readFileSync(full, "utf8");
      if (hasPersianStringLiteral(source)) results.push(rel);
    }
  }
  return results;
}

const files = walk(appRoot).sort();
console.log(`Found ${files.length} files with Persian string literals (comments excluded, test-* skipped):\n`);
files.forEach((f) => console.log(f));
