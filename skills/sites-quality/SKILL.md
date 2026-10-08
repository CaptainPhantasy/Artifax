---
name: sites-quality
description: Enforce objective quality gates on a site before it is hosted — static checks (raw values, missing alt text, focus regressions, dead states) plus optional live audits (Lighthouse, axe-core). Use before hosting, in CI, whenever the user asks for accessibility, performance, or SEO assurance, or when packaging a release.
license: MIT
metadata:
  layer: "5 — verification"
  version: "1.0"
---

# Sites quality

Taste is judgment; quality is measurement. This skill makes the measurable part
non-negotiable, so "looks good" is backed by evidence.

## Run the gate

```bash
node skills/sites-quality/scripts/quality-gate.mjs <project-dir>
```

- **Static checks** run always, with no dependencies: raw color values outside
  the token file, images without `alt`, `outline: none` without a replacement
  focus style, buttons/links without accessible names, missing `<h1>`, etc.
- **Live audits** run when you provide a URL and the tools are reachable:

  ```bash
  SITES_AUDIT_URL=http://localhost:3000 node skills/sites-quality/scripts/quality-gate.mjs .
  ```

  It uses `npx lighthouse` and `npx @axe-core/cli` (no install required; they
  are fetched on demand) and writes `.sites/quality.json`.

## Thresholds

| Metric | Target | Blocking? |
| --- | --- | --- |
| axe **critical** violations | 0 | **blocking** |
| axe serious violations | 0 (disclose others) | blocking |
| Lighthouse Accessibility | ≥ 95 | blocking |
| Lighthouse Performance | ≥ 90 | advisory |
| Lighthouse SEO | ≥ 90 | advisory |
| Lighthouse Best Practices | ≥ 95 | advisory |
| LCP | < 2.5s | advisory |
| CLS | < 0.1 | advisory |
| INP | < 200ms | advisory |

"Blocking" means: do not host, or disclose the failure explicitly in the final
report. Advisory means: note it, fix if cheap.

See [gates](references/gates.md) for the full check list, the exact commands,
how to wire this into `package-site.sh`, and how to fix each failure class.

## Enforce at packaging

The platform's `package-site.sh` calls this gate when `QUALITY_GATE=1`:

```bash
QUALITY_GATE=1 SITES_AUDIT_URL=http://localhost:3000 scripts/package-site.sh ./site out.tar.gz
```

With the flag unset, packaging stays permissive (static checks warn only) so
inspecting an in-progress build never blocks. With it set, blocking failures
abort packaging — this is the seam where quality becomes mandatory.

## Ethics of the gate

- A green gate is **not** proof of accessibility; automated tools catch a subset
  of issues. Pair with the manual rubric in `sites-critique`.
- Never "fix" a contrast failure by removing the element.
- Never silence a check to make the gate pass. Fix or disclose.

## Handoff

Green (or disclosed), continue to `sites-hosting`.
