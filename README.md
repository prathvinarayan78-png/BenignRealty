# Benign Realty

A bespoke, responsive real-estate website for Delhi & NCR. Inspired by Fort Vega’s architectural, spacious presentation, with an original Benign identity, sculptural imagery and a default dark charcoal-green / ivory / champagne palette.

## Run locally

Requires Node.js 22.12+ (or another Node version supported by Vite 8).

```sh
npm ci
npm run dev
```

The dev server listens on `0.0.0.0:5173`. The Vite configuration permits Arena’s `.e2b.app` preview hosts. Browser assets are local and the site makes no third-party font or image requests.

```sh
npm run build    # TypeScript check + production bundle in dist/
npm run preview  # Preview the production bundle
```

Deploy `dist/` to any static hosting provider. No API or database is needed for this preview.

## Features

- Dark mode is the default on first paint, regardless of OS colour preference. Navigation, collection controls, photo placeholders, native form controls and dialogs share the dark palette; no theme preference or toggle is required.
- Original Benign Realty identity and Delhi-focused content, with an original interlocking BR monogram, restrained champagne detailing, a precision-spaced Manrope wordmark and a matching favicon.
- Lenis smooth-wheel and anchor scrolling; native mobile touch scrolling; a desktop hero that pins briefly while its architecture zooms and frames itself.
- Section copy is visible by default. Optional entrance motion never hides it or depends on an IntersectionObserver callback to make it readable.
- Reversible collection-image reveals, scroll-linked brand typography, a moving editorial text band, Delhi parallax, a settling closing composition and a page-reading progress indicator.
- A three-chapter, scroll-driven journey with a sticky desktop stage, continuous image wipes, reversible chapter progression and keyboard-accessible chapter controls. Touch devices, short viewports and reduced-motion users get all three chapters in normal document flow.
- Subtle mobile scroll depth in the hero, journey imagery and founder placeholders, plus a sticky chapter guide with live reading progress and working chapter shortcuts. Mobile stays in natural document flow; reduced-motion disables the added movement.
- Mobile-first refinements: single-column phone property finder, two-column tablet collections, readable type, 44px controls, 16px form fields, scrollable dialogs with a sticky close button, and a focus-managed, scroll-locking mobile menu.
- A founders section introducing Talib Khan and Prathvi Narayan, with reserved portrait spaces and original editorial thoughts on home. Set each `portrait` path in `src/Founders.tsx` when approved photos are available.
- Six **illustrative** property concepts with location, residential/commercial and indicative-budget filters.
- Saved properties persisted locally, including an empty state and saved-only filtering.
- Accessible native property dialogs, service accordions, neighbourhood shortcuts and responsive navigation.
- A validated enquiry form that prepares a downloadable text brief **in the browser**, without falsely claiming a message was delivered.
- Self-hosted Manrope fonts, optimised WebP architecture imagery, metadata and custom SVG favicon.

## Ponytail

The official [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) package is installed as `@dietrichgebert/ponytail` in `devDependencies`. `opencode.json` enables its documented OpenCode plugin integration. Ponytail is development-agent tooling, not a browser animation library; it is intentionally excluded from the production bundle. Its rules and skills are available in the installed package. Lenis supplies the browser scrolling behaviour.

## Tests

```sh
npx playwright install --with-deps chromium
npm test
```

The 50 Playwright checks cover desktop and mobile layouts, imagery, filters, empty results, saved-property persistence, dialogs, accordion expansion/collapse, neighbourhood navigation, input validation, enquiry downloads, the mobile menu, privacy information and Lenis navigation/scroll locking. They also check the reversible hero, continuous journey wipes, dynamic collection-card reveals, typography movement, chapter controls, dynamic reduced-motion changes, 320px–1024px layouts, landscape rotation, mobile-menu focus/scroll locking, long-form dismissal, and visible content from Our Story through the footer even when reveal observers are silent or unavailable. Dark-theme checks cover both OS colour preferences, readable core surfaces and form controls, mobile chapter tracking in both scroll directions, working shortcuts and reduced-motion fallbacks.

When testing with an existing Chromium binary, set `CHROMIUM_PATH=/path/to/chromium`. Systems with custom shared-library locations may also require `LD_LIBRARY_PATH`.

## Before a public launch

1. Replace the concept data in `src/data.ts` with approved inventory. All current images, areas and budgets are clearly labelled as illustrative, not live offers.
2. Verify property ownership, location, measurements, availability, prices, permissions and applicable RERA details. Add genuine listing disclosures and registration information where required.
3. Supply verified company contact details and connect the enquiry form to an approved email/CRM backend. Until then it only downloads a locally prepared brief, and never sends or persists personal details.
4. Review the privacy policy for the eventual backend, analytics and data-retention practices. Current storage contains only saved property IDs.
5. Set final production canonical/absolute Open Graph URLs, and review company/legal information.

## Structure

- `src/App.tsx` — page sections, browsing, saved collection and native dialogs
- `src/Founders.tsx` — founder names, portrait placeholders and editorial home thoughts
- `src/ScrollJourney.tsx` — responsive scroll-driven journey with static/touch fallbacks
- `src/useScrollScenes.ts` — frame-batched progress, text-reveal and parallax updates
- `src/data.ts` — illustrative property concepts and service copy
- `src/styles.css` — responsive visual system and reduced-motion rules
- `src/theme.css` — default dark colour system, native controls and dialogs
- `src/mobile-motion.css` — progressive mobile depth and sticky chapter guide
- `public/images/` — locally served optimised imagery
- `tests/site.spec.ts` — desktop/mobile functional checks
- `tests/scroll-responsive.spec.ts` — scroll scenes, narrow layouts and accessible mobile interactions
- `tests/visibility.spec.ts` — painted-content regressions with motion enabled and observers disabled
- `tests/dark-mobile.spec.ts` — default dark theme, core contrast and mobile motion/navigation

See `ASSETS.md` for imagery and typography details.
