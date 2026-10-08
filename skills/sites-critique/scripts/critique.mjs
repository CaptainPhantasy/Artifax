#!/usr/bin/env node
// Capture critique screenshots of a running site.
//
//   node skills/sites-critique/scripts/critique.mjs <project-dir> [url]
//
// Writes desktop/mobile x light/dark PNGs (+ full page) to <project-dir>/.sites/critique/.
// Uses Playwright if it is installed in the project; otherwise prints how to enable it.
//
// Zero dependencies of its own — Playwright is imported dynamically.

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const [, , projectArg, urlArg] = process.argv;
const projectDir = resolve(projectArg ?? process.cwd());
const url = urlArg ?? process.env.SITES_URL ?? "http://localhost:3000";
const outDir = resolve(projectDir, ".sites/critique");

const require = createRequire(resolve(projectDir, "package.json"));

async function loadPlaywright() {
  for (const name of ["playwright", "playwright-core", "@playwright/test"]) {
    try {
      return require(name);
    } catch {}
  }
  return null;
}

const playwright = await loadPlaywright();
if (!playwright) {
  console.error(
    [
      "Playwright is not installed in this project.",
      "Enable the vision critique pass with one of:",
      "  npm i -D playwright && npx playwright install chromium",
      "Then re-run:  node skills/sites-critique/scripts/critique.mjs . " + url,
      "",
      "Alternatively, use an in-app browser tool to open the URL and screenshot manually.",
    ].join("\n"),
  );
  process.exit(0);
}

const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};
const themes = ["light", "dark"];

await mkdir(outDir, { recursive: true });

const browser = await playwright.chromium.launch();
let count = 0;

try {
  for (const [device, viewport] of Object.entries(viewports)) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport,
        locale: "en-US",
        reducedMotion: "no-preference",
        colorScheme: theme,
        deviceScaleFactor: device === "mobile" ? 2 : 1,
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      // Force the app theme too, for apps that key off data-theme rather than the media query.
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.waitForTimeout(400);
      const file = resolve(outDir, `${device}-${theme}.png`);
      await page.screenshot({ path: file });
      console.log("wrote", file);
      count++;
      await context.close();
    }
  }

  const ctx = await browser.newContext({ viewport: viewports.desktop, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const full = resolve(outDir, "full-page.png");
  await page.screenshot({ path: full, fullPage: true });
  console.log("wrote", full);
  count++;
  await ctx.close();
} finally {
  await browser.close();
}

console.log(`\n${count} screenshots in ${outDir}`);
console.log("Now run the vision critique prompt in SKILL references/vision-loop.md.");
