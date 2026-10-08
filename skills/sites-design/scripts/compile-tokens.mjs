#!/usr/bin/env node
// Compile the DTCG token source into CSS custom properties.
//
//   node skills/sites-design/scripts/compile-tokens.mjs
//
// - Top-level group names become CSS prefixes:  sp.4 -> --sp-4
// - The `semantic` group emits WITHOUT a prefix: semantic.bg -> --bg
// - "{group.token}" aliases resolve to var(--group-token)
// - "$extensions.dark" values are emitted in the dark blocks
// - "$extensions.tint" on a group derives its values from another token
//   (e.g. neutrals tinted toward the brand hue in OKLCH) — see tokens.json "n"
// - "$contrast.pairs" are WCAG AA assertions evaluated at compile time,
//   in both themes, on fully resolved colors. Any failure exits non-zero:
//   an illegal foreground/background pairing must die here, not on screen.
//
// Zero dependencies. Deterministic output. Safe to run repeatedly.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tokenPath = resolve(here, "../assets/tokens/tokens.json");
const outPath = resolve(here, "../assets/tokens/tokens.css");

const ALIAS = /\{([^}]+)\}/g;
const aliasToVar = (s) =>
  String(s).replace(ALIAS, (_, path) => `var(--${path.replace(/\./g, "-")})`);

const isLeaf = (node) =>
  node && typeof node === "object" && Object.hasOwn(node, "$value");

function walk(node, path, visit) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    const next = [...path, key];
    if (isLeaf(child)) visit(next, child);
    else if (child && typeof child === "object") walk(child, next, visit);
  }
}

// ---------------------------------------------------------------------------
// Color math (WCAG 2.x). Zero dependencies.
// ---------------------------------------------------------------------------

const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const linearToSrgb = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

function parseColor(str) {
  const s = String(str).trim();
  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) {
    const [r, g, b] = m[1].split("").map((h) => parseInt(h + h, 16) / 255);
    return { r, g, b, a: 1 };
  }
  m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) {
    const n = parseInt(m[1], 16);
    return {
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255,
      a: 1,
    };
  }
  // rgb(255 255 255 / 0.1) and legacy rgba(255, 255, 255, 0.1)
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return { r: parts[0] / 255, g: parts[1] / 255, b: parts[2] / 255, a: parts[3] ?? 1 };
  }
  throw new Error(`unsupported color value: ${s}`);
}

const toHex = ({ r, g, b }) => {
  const h = (v) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
};

// --- OKLab / OKLCH (perceptually uniform) ---------------------------------
const oklabFromLinear = (r, g, b) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
};

const linearFromOklab = ({ L, a, b }) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
};

// Tint a base color toward the brand's hue in OKLCH. Preserves the base's
// perceived lightness and applies a uniform cast across the whole ramp — a
// subtle warm/cool bias, never a lightness shift (linear-space mixing would
// turn dark neutrals into navy while barely touching light ones).
function mix(baseHex, tintHex, t) {
  const base = parseColor(baseHex);
  const brand = parseColor(tintHex);
  const baseLab = oklabFromLinear(
    srgbToLinear(base.r),
    srgbToLinear(base.g),
    srgbToLinear(base.b),
  );
  const brandLab = oklabFromLinear(
    srgbToLinear(brand.r),
    srgbToLinear(brand.g),
    srgbToLinear(brand.b),
  );
  const c = t * Math.hypot(brandLab.a, brandLab.b);
  const h = Math.atan2(brandLab.b, brandLab.a);
  const lin = linearFromOklab({ L: baseLab.L, a: c * Math.cos(h), b: c * Math.sin(h) });
  const clamp = (v) => Math.min(1, Math.max(0, v));
  return toHex({
    r: linearToSrgb(clamp(lin.r)),
    g: linearToSrgb(clamp(lin.g)),
    b: linearToSrgb(clamp(lin.b)),
  });
}

// Gamma-space source-over compositing (alpha foreground onto opaque bg).
function compositeOver(fg, bgHex) {
  const bg = parseColor(bgHex);
  const a = fg.a;
  const ch = (f, b) => a * f + (1 - a) * b;
  return toHex({ r: ch(fg.r, bg.r), g: ch(fg.g, bg.g), b: ch(fg.b, bg.b) });
}

function luminance(hex) {
  const { r, g, b } = parseColor(hex);
  return (
    0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
  );
}

function contrastRatio(fgHex, bgHex) {
  const l1 = luminance(fgHex);
  const l2 = luminance(bgHex);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------------------
// Load tokens
// ---------------------------------------------------------------------------

const raw = JSON.parse(await readFile(tokenPath, "utf8"));

// Flatten group leaves ("n.25" -> leaf) for alias resolution.
const groupLeaves = new Map();
for (const [key, value] of Object.entries(raw)) {
  if (key.startsWith("$") || key === "semantic") continue;
  walk(value, [key], (path, leaf) => groupLeaves.set(path.join("."), leaf));
}

// ---------------------------------------------------------------------------
// Tint pass: groups with $extensions.tint derive effective values from another
// token, so recoloring the source (e.g. the brand ramp) re-tints the group.
// ---------------------------------------------------------------------------

const effective = new Map(); // "n.25" -> effective hex (tinted or authored)
for (const [ref, leaf] of groupLeaves) effective.set(ref, String(leaf.$value));

for (const [key, value] of Object.entries(raw)) {
  if (key.startsWith("$") || key === "semantic") continue;
  const tint = value?.$extensions?.tint;
  if (!tint) continue;
  const tintRef = Object.keys(tint).find((k) => !k.startsWith("$"));
  const t = tint.$mix ?? 0.05;
  const except = new Set(tint.$except ?? []);
  if (!tintRef) throw new Error(`group "${key}": $extensions.tint needs a "{group.step}" source`);
  const ref = String(tint[tintRef]).replace(/^\{|\}$/g, "");
  const tintLeaf = groupLeaves.get(ref);
  if (!tintLeaf) throw new Error(`group "${key}": tint source ${ref} not found`);
  const tintHex = toHex(parseColor(String(tintLeaf.$value)));
  walk(value, [key], (path, leaf) => {
    if (!except.has(path[path.length - 1])) {
      effective.set(path.join("."), mix(String(leaf.$value), tintHex, t));
    }
  });
}

function resolveEffective(ref) {
  const leaf = groupLeaves.get(ref);
  if (!leaf) throw new Error(`unknown alias {${ref}}`);
  return effective.get(ref) ?? String(leaf.$value);
}

// ---------------------------------------------------------------------------
// Emission (unchanged structure; tinted groups emit concrete derived hexes)
// ---------------------------------------------------------------------------

function emitValue(ref, value) {
  const tinted = effective.get(ref);
  return tinted !== undefined && tinted !== String(value)
    ? tinted
    : aliasToVar(value);
}

function collect(group, { stripPrefix = false, groupKey } = {}) {
  const rows = [];
  walk(group, [], (path, leaf) => {
    const name = (stripPrefix ? path : [group.__name, ...path]).join("-");
    const ref = groupKey ? `${groupKey}.${path.join(".")}` : name;
    rows.push({ name, value: emitValue(ref, leaf.$value) });
  });
  return rows;
}

function block(rows, indent = "  ") {
  return rows.map((r) => `${indent}--${r.name}: ${r.value};`).join("\n");
}

const root = [];
const dark = [];

for (const [key, value] of Object.entries(raw)) {
  if (key.startsWith("$")) continue;
  if (key === "semantic") {
    const g = { __name: "semantic" };
    Object.assign(g, value);
    root.push(...collect(g, { stripPrefix: true, groupKey: "semantic" }));
    const darkRows = [];
    walk(value, [], (path, leaf) => {
      const v = leaf?.$extensions?.dark?.$value;
      if (v !== undefined) darkRows.push({ name: path.join("-"), value: aliasToVar(v) });
    });
    dark.push(...darkRows);
  } else {
    const g = { __name: key };
    Object.assign(g, value);
    root.push(...collect(g, { groupKey: key }));
  }
}

// ---------------------------------------------------------------------------
// Compile-time WCAG contrast assertions
// ---------------------------------------------------------------------------

function resolveSemantic(name, theme) {
  const leaf = raw.semantic?.[name];
  if (!leaf) throw new Error(`$contrast: unknown semantic role "${name}"`);
  const rawValue =
    theme === "dark" ? (leaf.$extensions?.dark?.$value ?? leaf.$value) : leaf.$value;
  const m = /^{([^}]+)}$/.exec(String(rawValue).trim());
  let hex = m ? resolveEffective(m[1]) : String(rawValue);
  return parseColor(hex);
}

const failures = [];
for (const pair of raw.$contrast?.pairs ?? []) {
  for (const theme of ["light", "dark"]) {
    let fg = resolveSemantic(pair.fg, theme);
    let bg = resolveSemantic(pair.bg, theme);
    // Alpha backgrounds render over the page background — composite the same
    // way the browser will before measuring. Alpha foregrounds composite over
    // their resolved background.
    if (bg.a < 1) bg = parseColor(compositeOver(bg, toHex(resolveSemantic("bg", theme))));
    if (fg.a < 1) fg = parseColor(compositeOver(fg, toHex(bg)));
    const ratio = contrastRatio(toHex(fg), toHex(bg));
    if (ratio < pair.min) {
      failures.push({
        theme,
        fg: pair.fg,
        bg: pair.bg,
        ratio: ratio.toFixed(2),
        min: pair.min,
        note: `${toHex(fg)} on ${toHex(bg)}`,
      });
    }
  }
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} WCAG contrast assertion(s) failed:\n`);
  for (const f of failures) {
    console.error(
      `  [${f.theme}] ${f.fg} on ${f.bg}: ${f.ratio} < ${f.min}  (${f.note})`,
    );
  }
  console.error(
    `\nFix the token source — never the rendered output. Contrast is a token contract.\n`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write CSS
// ---------------------------------------------------------------------------

const header = `/* GENERATED by skills/sites-design/scripts/compile-tokens.mjs
 * Source: skills/sites-design/assets/tokens/tokens.json
 * Do not edit by hand — edit the JSON and re-run the compiler.
 * Neutrals are tinted toward the brand at compile time; WCAG pairings
 * are asserted before this file is written. */`;

const css = `${header}

:root {
  color-scheme: light;
${block(root)}
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
${block(dark, "    ")}
  }
}

[data-theme="light"] {
  color-scheme: light;
${block(root)}
}

[data-theme="dark"] {
  color-scheme: dark;
${block(dark)}
}
`;

await writeFile(outPath, css, "utf8");
console.log(
  `wrote ${outPath} (${root.length} base, ${dark.length} dark tokens; ${raw.$contrast?.pairs?.length ?? 0} contrast pairs asserted in both themes)`,
);
