#!/usr/bin/env node
// Lint a site project. Prefers oxlint (oxc) when the fast linter is installed,
// falls back to eslint, then to fetching oxlint via npx.
//
//   node skills/sites-quality/scripts/lint.mjs <project-dir>
//
// Zero own dependencies. Exits 1 only when a lint problem is found AND
// QUALITY_GATE=1 is set; otherwise it reports and exits 0.

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, join } from "node:path";

const projectDir = resolve(process.argv[2] ?? process.cwd());
const enforcing = process.env.QUALITY_GATE === "1";

const projectBin = (name) => {
  const p = join(projectDir, "node_modules/.bin", name);
  return existsSync(p) ? p : null;
};

const haveCmd = (cmd, args = ["--version"]) => {
  try {
    execFileSync(cmd, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

function run(cmd, args) {
  try {
    execFileSync(cmd, args, { cwd: projectDir, stdio: "inherit" });
    return 0;
  } catch (e) {
    return typeof e.status === "number" ? e.status : 1;
  }
}

let code;
const oxlint = projectBin("oxlint");
const eslint = projectBin("eslint");

if (oxlint) {
  console.log(`Lint: oxlint (${oxlint})`);
  code = run(oxlint, ["."]);
} else if (eslint) {
  console.log(`Lint: eslint (${eslint})`);
  code = run(eslint, [".", "--ignore-pattern", "dist", "--ignore-pattern", ".next"]);
} else if (haveCmd("npx")) {
  console.log("Lint: no local linter — fetching oxlint via npx");
  code = run("npx", ["--yes", "oxlint@latest", "."]);
} else {
  console.error("Lint skipped: no oxlint/eslint installed and npx unavailable.");
  console.error("Enable it with:  npm i -D oxlint   (or use eslint)");
  process.exit(0);
}

if (code !== 0) {
  console.error(`\nLint reported problems (exit ${code}).`);
  if (enforcing) {
    console.error("FAILED: QUALITY_GATE=1 and lint found problems.");
    process.exit(code);
  }
  console.error("Non-enforcing: set QUALITY_GATE=1 to fail on lint problems.");
}
process.exit(0);
