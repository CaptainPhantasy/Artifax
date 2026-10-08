# PWA

Make a site installable and offline-tolerant. Do this when the site is
something people return to — dashboards, trackers, tools, games, portals.

## When it is worth it

Ship a PWA when **at least one** holds: the site is used repeatedly, it has
app-like state, it benefits from an icon on the home screen, or it should work
on a flaky connection. Do **not** PWA-ify a one-page marketing site; it adds
weight for no user benefit.

## The three requirements

1. **Manifest** — `public/manifest.webmanifest`, linked from `app/layout.tsx`
   via the `manifest` metadata field.
2. **Service worker** — registered, precaching the app shell.
3. **Icons** — 192×192 and 512×512 PNG, plus a 512×512 `maskable` variant.
   SVG-only is not installable on most platforms.

## Manifest (starter ships this)

```json
{
  "name": "Site name",
  "short_name": "Site",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#faf9f7",
  "theme_color": "#4f46e5",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

`theme_color` / `background_color` should match `--brand` / `--bg` so the splash
and OS chrome blend with the site.

## Service worker via vite-plugin-pwa (recommended on this stack)

```bash
npm i -D vite-plugin-pwa workbox-window
```

```ts
// vite.config.ts (add to plugins)
import { VitePWA } from "vite-plugin-pwa";

VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.svg", "icons/*.png"],
  manifest: false, // we ship our own manifest.webmanifest
  workbox: {
    globPatterns: ["**/*.{js,css,html,svg,woff2}"],
    navigateFallback: "/offline.html",
  },
  devOptions: { enabled: false },
});
```

Register in a small client component:

```tsx
"use client";
import { useEffect } from "react";
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
```

- Links: https://github.com/vite-pwa/vite-plugin-pwa · https://github.com/GoogleChrome/workbox
- References: https://web.dev/explore/progressive-web-apps · https://www.pwabuilder.com

## Offline strategy — pick one, deliberately

| Strategy | Behavior | Fit |
| --- | --- | --- |
| **App shell** | UI loads offline; data is last-cached or empty-states | tools, dashboards |
| **Offline fallback** | Any missed navigation shows `public/offline.html` | content sites |
| **Full offline** | Data cached/replayed with Background Sync | field/utility tools |

State the chosen strategy in the site README. Never leave it implicit.

## Install affordance

```tsx
"use client";
import { useEffect, useState } from "react";
export function InstallButton() {
  const [evt, setEvt] = useState<any>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  if (!evt) return null;
  return <button onClick={() => { evt.prompt(); setEvt(null); }}>Install app</button>;
}
```

Show it once, dismissibly. Never nag.

## Update flow

Use `registerType: "autoUpdate"` for tools; for apps with unsaved state,
prompt the user before reloading. Always make the update **user-visible**: silent
reloads that lose work are the #1 PWA complaint.

## Testing

- Chrome DevTools → Application → Manifest / Service Workers / Storage.
- Lighthouse "Installable" audit must pass.
- Toggle "Offline" in DevTools and confirm the chosen strategy.
- iOS Safari: add to Home Screen; verify standalone display and safe areas
  (`env(safe-area-inset-*)`).
