#!/usr/bin/env node
// Capture critique screenshots of a running site AND run objective on-screen
// checks, then write a machine-readable fault card.
//
//   node skills/sites-critique/scripts/critique.mjs <project-dir> [url]
//
// Writes desktop/mobile x light/dark PNGs (+ full page) and faults.json to
// <project-dir>/.sites/critique/. Uses Playwright if it is installed in the
// project; otherwise prints how to enable the vision pass.
//
// Zero dependencies of its own — Playwright is imported dynamically.
//
// The fault card is data, never a fix: a machine-readable list of concrete
// on-screen problems for the agent (or a human) to act on. This script does
// not edit source. A "fix button" would be the wrong shape — the fixes are
// design decisions; the detection is the part worth automating.

import { mkdir, writeFile } from "node:fs/promises";
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

// Page-side probe: runs in the browser, returns plain data only.
function probePage() {
  const vw = window.innerWidth;
  const de = document.documentElement;

  const brokenImages = [...document.images].filter(
    (i) => i.complete && i.naturalWidth === 0,
  ).length;

  const interactive = [
    ...document.querySelectorAll("a,button,input,select,textarea,[role=button]"),
  ];
  const tinyTargets = interactive.filter((el) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      r.width === 0 ||
      r.height === 0
    ) {
      return false;
    }
    return r.width < 24 || r.height < 24;
  }).length;

  const main = document.querySelector("main") ?? document.body;
  const mainTextLength = (main?.innerText ?? "").trim().length;

  const headingCount = [...document.querySelectorAll("h1")].filter(
    (h) => (h.innerText ?? "").trim().length > 0,
  ).length;

  let overflowing = 0;
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vw + 2) overflowing++;
  }

  return {
    hasTitle: !!document.title.trim(),
    lang: de.lang || "",
    scrollOverflow: de.scrollWidth - vw,
    brokenImages,
    tinyTargets,
    interactive: interactive.length,
    mainTextLength,
    headingCount,
    overflowing,
  };
}

function faultsFrom(probe, viewport, theme) {
  const at = { viewport, theme };
  const out = [];
  if (!probe.hasTitle)
    out.push({ ...at, id: "missing-title", severity: "error", message: "Document has no <title>." });
  if (!probe.lang)
    out.push({ ...at, id: "missing-lang", severity: "warning", message: "Root element has no lang attribute." });
  if (probe.scrollOverflow > 1)
    out.push({ ...at, id: "horizontal-overflow", severity: "error", message: `Page is ${probe.scrollOverflow}px wider than the viewport.`, evidence: `${probe.overflowing} element(s) extend past the right edge.` });
  if (probe.brokenImages > 0)
    out.push({ ...at, id: "broken-images", severity: "error", message: `${probe.brokenImages} image(s) failed to load.` });
  if (probe.tinyTargets > 0)
    out.push({ ...at, id: "tiny-tap-targets", severity: "warning", message: `${probe.tinyTargets} of ${probe.interactive} interactive element(s) are under 24px.` });
  if (probe.mainTextLength < 20)
    out.push({ ...at, id: "empty-main", severity: "error", message: "Main content area renders almost no text." });
  if (probe.headingCount === 0)
    out.push({ ...at, id: "no-visible-h1", severity: "warning", message: "No <h1> with text content on the page." });
  if (probe.headingCount > 1)
    out.push({ ...at, id: "multiple-h1", severity: "info", message: `${probe.headingCount} <h1> elements on the page.` });
  return out;
}

const browser = await playwright.chromium.launch();
const screenshots = [];
const faults = [];
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
      const consoleErrors = [];
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text());
      });
      page.on("pageerror", (e) => consoleErrors.push(String(e.message ?? e)));

      await page.goto(url, { waitUntil: "networkidle" });
      // Force the app theme too, for apps that key off data-theme rather than the media query.
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.waitForTimeout(400);

      const file = resolve(outDir, `${device}-${theme}.png`);
      await page.screenshot({ path: file });
      screenshots.push(file);
      count++;

      const probe = await page.evaluate(probePage);
      faults.push(...faultsFrom(probe, device, theme));
      if (consoleErrors.length) {
        faults.push({
          viewport: device,
          theme,
          id: "console-errors",
          severity: "warning",
          message: `${consoleErrors.length} console error(s).`,
          evidence: consoleErrors.slice(0, 3).join(" | "),
        });
      }
      await context.close();
    }
  }

  const ctx = await browser.newContext({ viewport: viewports.desktop, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const full = resolve(outDir, "full-page.png");
  await page.screenshot({ path: full, fullPage: true });
  screenshots.push(full);
  count++;
  await ctx.close();
} finally {
  await browser.close();
}

const summary = faults.reduce(
  (a, f) => ((a[f.severity] = (a[f.severity] ?? 0) + 1), a),
  {},
);
const card = {
  url,
  generatedAt: new Date().toISOString(),
  screenshots,
  faultCount: faults.length,
  summary,
  faults,
};
const cardPath = resolve(outDir, "faults.json");
await writeFile(cardPath, JSON.stringify(card, null, 2));

console.log(`\n${count} screenshots in ${outDir}`);
console.log(`Fault card: ${cardPath} — ${faults.length} fault(s) ${JSON.stringify(summary)}`);
for (const f of faults.slice(0, 12)) {
  console.log(`  [${f.severity}] ${f.id} (${f.viewport}/${f.theme}): ${f.message}`);
}
console.log("Now run the vision critique prompt in SKILL references/vision-loop.md.");
