#!/usr/bin/env node
// Quality gate for a Sites project.
//
//   node skills/sites-quality/scripts/quality-gate.mjs <project-dir>
//   SITES_AUDIT_URL=http://localhost:3000 node .../quality-gate.mjs <project-dir>
//
// Always runs static checks (zero deps).
// Runs Lighthouse + axe live audits when SITES_AUDIT_URL is set and the tools
// are reachable via npx. Writes <project>/.sites/quality.json.
//
// Exit code: 0 when passing or advisory-only; 1 when a BLOCKING check fails AND
// QUALITY_GATE=1 is set. Without QUALITY_GATE=1 it never fails the process.

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, join, extname } from "node:path";

const projectDir = resolve(process.argv[2] ?? process.cwd());
const auditUrl = process.env.SITES_AUDIT_URL || "";
const enforcing = process.env.QUALITY_GATE === "1";

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".sites", ".wrangler", ".vinext", "drizzle"]);
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".html", ".mdx"]);
const TOKEN_FILES = [/tokens\.css$/, /preview\.css$/];

const findings = [];
const record = (level, check, file, detail) => findings.push({ level, check, file, detail });

async function walk(dir, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".sites") {
      if (SKIP_DIRS.has(e.name) || e.name === ".git") continue;
    }
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(p, acc);
    } else if (CODE_EXT.has(extname(e.name))) {
      acc.push(p);
    }
  }
  return acc;
}

function stripCommentsAndStrings(src) {
  // Best-effort: blank out comments and string literals so tokens like "#fff"
  // that are only examples in prose do not trip the raw-color check.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/`(?:\\.|[^`])*`/g, "``")
    .replace(/"(?:\\.|[^"])*"/g, '""')
    .replace(/'(?:\\.|[^'])*'/g, "''");
}

// ---------- static checks ----------
const files = await walk(projectDir);
const rel = (f) => f.replace(projectDir + "/", "");

for (const file of files) {
  if (TOKEN_FILES.some((re) => re.test(file))) continue;
  const src = await readFile(file, "utf8");
  const code = stripCommentsAndStrings(src);

  // raw colors (style={} and css only; template strings already stripped)
  if (/\.(tsx?|jsx?|css)$/.test(file)) {
    const hex = code.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hex) record("advisory", "raw-color", rel(file), `${hex.length} hex literal(s): ${[...new Set(hex)].slice(0, 4).join(", ")}`);
    const fn = code.match(/\b(rgb|hsl)a?\(/g);
    if (fn) record("advisory", "raw-color", rel(file), `${fn.length} rgb()/hsl() literal(s)`);
  }

  // images without alt
  const imgs = src.match(/<(img|Image)\b[^>]*>/g) ?? [];
  for (const tag of imgs) {
    if (!/\balt\s*=/.test(tag)) record("blocking", "image-alt", rel(file), tag.slice(0, 90));
  }

  // outline removal without a replacement
  if (/\boutline\s*:\s*none|outline-none/.test(src) && !/focus-visible|focus:/.test(src)) {
    record("advisory", "focus-outline", rel(file), "outline removed without focus-visible replacement");
  }

  // icon-only buttons without a name
  const btns = src.match(/<button\b[^>]*>\s*(<[^>]+>\s*)*<\/button>/g) ?? [];
  for (const b of btns) {
    if (!/aria-label|aria-labelledby|title=/.test(b)) {
      record("advisory", "button-name", rel(file), "button may lack an accessible name");
    }
  }

  // placeholder text
  const ph = src.match(/\b(lorem ipsum|TODO|FIXME|XXX)\b/gi);
  if (ph) record("advisory", "placeholder-text", rel(file), [...new Set(ph.map((s) => s.toLowerCase()))].join(", "));
}

// exactly one h1 across rendered app pages, and html lang
const appDir = join(projectDir, "app");
if (existsSync(appDir)) {
  const pageFiles = (await walk(appDir)).filter((f) => /page\.(tsx|jsx)$/.test(f));
  for (const p of pageFiles) {
    const src = await readFile(p, "utf8");
    const h1 = (src.match(/<h1\b/g) ?? []).length;
    if (h1 === 0) record("advisory", "heading-h1", rel(p), "no <h1> on page");
    if (h1 > 1) record("advisory", "heading-h1", rel(p), `${h1} <h1> elements on page`);
  }
}
const layout = [join(appDir, "layout.tsx"), join(appDir, "layout.jsx")].find(existsSync);
if (layout) {
  const src = await readFile(layout, "utf8");
  if (!/<html[^>]*\blang=/.test(src)) record("advisory", "html-lang", rel(layout), "<html> missing lang");
}

// ---------- live audits (opt-in) ----------
const live = { url: auditUrl, lighthouse: null, axe: null, skipped: [] };

function haveNpx() {
  try {
    execFileSync("npx", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function runLive() {
  if (!auditUrl) {
    live.skipped.push("no SITES_AUDIT_URL set");
    return;
  }
  if (!haveNpx()) {
    live.skipped.push("npx not available");
    return;
  }
  await mkdir(join(projectDir, ".sites"), { recursive: true });

  try {
    const out = join(projectDir, ".sites/lighthouse.json");
    execFileSync(
      "npx",
      ["--yes", "lighthouse", auditUrl, "--quiet", "--chrome-flags=--headless --no-sandbox", "--output=json", `--output-path=${out}`],
      { stdio: "ignore", timeout: 180000 },
    );
    const lh = JSON.parse(await readFile(out, "utf8"));
    const c = (k) => Math.round((lh.categories?.[k]?.score ?? 0) * 100);
    live.lighthouse = {
      performance: c("performance"),
      accessibility: c("accessibility"),
      "best-practices": c("best-practices"),
      seo: c("seo"),
      lcp: lh.audits?.["largest-contentful-paint"]?.numericValue,
      cls: lh.audits?.["cumulative-layout-shift"]?.numericValue,
      tbt: lh.audits?.["total-blocking-time"]?.numericValue,
    };
    if (live.lighthouse.accessibility < 95) record("blocking", "lighthouse-a11y", "-", `accessibility ${live.lighthouse.accessibility} < 95`);
    if (live.lighthouse.performance < 90) record("advisory", "lighthouse-perf", "-", `performance ${live.lighthouse.performance} < 90`);
    if (live.lighthouse.seo < 90) record("advisory", "lighthouse-seo", "-", `seo ${live.lighthouse.seo} < 90`);
  } catch (e) {
    live.skipped.push(`lighthouse: ${e.message?.split("\n")[0] ?? e}`);
  }

  try {
    const out = join(projectDir, ".sites/axe.json");
    execFileSync("npx", ["--yes", "@axe-core/cli", auditUrl, "--save", out], { stdio: "ignore", timeout: 120000 });
    const axe = JSON.parse(await readFile(out, "utf8"));
    const arr = Array.isArray(axe) ? axe : [axe];
    const violations = arr.flatMap((r) => r.violations ?? []);
    const byImpact = violations.reduce((a, v) => ((a[v.impact] = (a[v.impact] ?? 0) + 1), a), {});
    live.axe = { total: violations.length, byImpact };
    if ((byImpact.critical ?? 0) > 0) record("blocking", "axe-critical", "-", `${byImpact.critical} critical`);
    if ((byImpact.serious ?? 0) > 0) record("blocking", "axe-serious", "-", `${byImpact.serious} serious`);
    if ((byImpact.moderate ?? 0) + (byImpact.minor ?? 0) > 0)
      record("advisory", "axe-minor", "-", `${(byImpact.moderate ?? 0) + (byImpact.minor ?? 0)} moderate/minor`);
  } catch (e) {
    live.skipped.push(`axe: ${e.message?.split("\n")[0] ?? e}`);
  }
}

await runLive();

// ---------- report ----------
const blocking = findings.filter((f) => f.level === "blocking");
const advisory = findings.filter((f) => f.level === "advisory");

const report = {
  project: projectDir,
  generatedAt: new Date().toISOString(),
  enforcing,
  live,
  summary: { blocking: blocking.length, advisory: advisory.length },
  findings,
};

await mkdir(join(projectDir, ".sites"), { recursive: true });
await writeFile(join(projectDir, ".sites/quality.json"), JSON.stringify(report, null, 2));

const line = (f) => `  [${f.level}] ${f.check}${f.file && f.file !== "-" ? ` — ${f.file}` : ""}${f.detail ? `: ${f.detail}` : ""}`;

console.log(`Quality gate — ${projectDir}`);
console.log(`  blocking: ${blocking.length}   advisory: ${advisory.length}`);
if (blocking.length) { console.log("Blocking:"); blocking.forEach((f) => console.log(line(f))); }
if (advisory.length) { console.log("Advisory:"); advisory.forEach((f) => console.log(line(f))); }
if (live.skipped.length) console.log(`Live audits skipped: ${live.skipped.join("; ")}`);
if (live.lighthouse) console.log(`Lighthouse: ${JSON.stringify(live.lighthouse)}`);
if (live.axe) console.log(`axe: ${JSON.stringify(live.axe)}`);
console.log(`Report: ${join(projectDir, ".sites/quality.json")}`);

if (blocking.length && enforcing) {
  console.error(`\nFAILED: ${blocking.length} blocking issue(s) and QUALITY_GATE=1.`);
  process.exit(1);
}
console.log(blocking.length ? "\nPassing with advisories (non-enforcing)." : "\nPASS.");
