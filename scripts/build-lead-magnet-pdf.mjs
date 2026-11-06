#!/usr/bin/env node
// Rebuilds the lead-magnet PDF from the source HTML using Chrome headless.
// Run after editing public/downloads/ejercicios-embarazo.html.
//
// Usage:
//   node scripts/build-lead-magnet-pdf.mjs
//
// Override Chrome path if needed:
//   CHROME_PATH="C:\path\to\chrome.exe" node scripts/build-lead-magnet-pdf.mjs

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find(p => existsSync(p));
if (!chrome) {
  console.error("Chrome/Edge not found. Set CHROME_PATH env var.");
  process.exit(1);
}

const root = resolve(process.cwd());
const htmlPath = resolve(root, "public/downloads/ejercicios-embarazo.html");
const pdfPath = resolve(root, "public/downloads/ejercicios-embarazo.pdf");

if (!existsSync(htmlPath)) {
  console.error(`HTML not found: ${htmlPath}`);
  process.exit(1);
}

console.log(`→ Chrome:  ${chrome}`);
console.log(`→ Source:  ${htmlPath}`);
console.log(`→ Output:  ${pdfPath}`);
console.log();

execFileSync(chrome, [
  "--headless",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`,
  `file:///${htmlPath.replace(/\\/g, "/")}`,
], { stdio: "inherit" });

console.log();
console.log("✓ PDF rebuilt.");
