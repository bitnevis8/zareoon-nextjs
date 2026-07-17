/** @see messages/README.md */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_ROOT = path.join(__dirname);

/** Namespaced JSON files per locale (add modules here). */
export const MESSAGE_NAMESPACES = [
  "common",
  "site",
  "nav",
  "auth",
  "cart",
  "applicant",
  "inventory",
  "catalog",
  "legal",
  "search",
  "layout",
  "exchange",
  "home",
  "errors",
  "data",
  "languages",
  "chat",
  "dashboard",
  "product",
  "order",
  "escrow",
  "tradeServices",
  "location",
  "supplier",
  "legacy",
  "users",
  "shared",
  "backup",
];

function deepMerge(target, source) {
  if (!source || typeof source !== "object") return target;
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else if (value !== undefined && value !== null && value !== "") {
      out[key] = value;
    }
  }
  return out;
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function isPrimitive(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function mergeNamespace(messages, namespace, data) {
  if (!data || typeof data !== "object") return messages;
  if (namespace === "legacy") {
    const out = { ...messages, legacyFlat: { ...(messages.legacyFlat || {}) } };
    for (const [key, value] of Object.entries(data)) {
      const existing = out[key];
      if (isPlainObject(existing) && isPrimitive(value)) {
        out.legacyFlat[key] = value;
        continue;
      }
      out[key] = value;
    }
    return out;
  }
  return deepMerge(messages, { [namespace]: data });
}

function loadLocaleLayer(locale) {
  let messages = {};
  for (const ns of MESSAGE_NAMESPACES) {
    const data = readJsonFile(path.join(MESSAGES_ROOT, locale, `${ns}.json`));
    if (data) messages = mergeNamespace(messages, ns, data);
  }
  return messages;
}

/**
 * Load messages: fa is always the base; other locales override fa keys.
 * Empty/missing keys in en/ru fall back to Persian automatically.
 */
export function loadMessagesForLocale(locale) {
  const base = loadLocaleLayer("fa");
  if (locale === "fa") return base;
  return deepMerge(base, loadLocaleLayer(locale));
}
