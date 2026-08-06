# AGENTS.md

## Package manager

Always use **bun** for install, scripts, and linking — never npm, yarn, or pnpm.

## Commands

```bash
bun install            # install deps (root)
bun run lint           # eslint source check
bun run typecheck      # vue-tsc --noEmit
bun run build          # checks + Vite library build + Sass style build
```

No test suite exists in this repo.

## Architecture

- **Library**: `@canwdev/vgo-ui` — a Vue 3 component library (Vite lib mode, ESM + CJS).
- **Two entrypoints**:
  - `src/index.ts` — main barrel, exports components and hooks. Import from `@canwdev/vgo-ui`.
  - `src/vue-monaco.ts` — isolated entry for VueMonaco. Import from `@canwdev/vgo-ui/vue-monaco`. This avoids pulling `monaco-editor` into the main bundle.
- **Styles**: `src/styles/core.scss` and component SFC styles build to `dist/styles/core.css`; `src/styles/themes/default/index.scss` builds separately to `dist/themes/default.css`. Consumers import both style entries.
- **Docs**: Separate bun workspace under `docs/`, uses `rolldown-vite` (aliased from `vite`), not regular Vite. Run with `cd docs && bun run dev`.
- **Token docs are generated, not written.** `docs/src/router/scss-blocks.ts` reads `_runtime.scss` and `_tokens.scss` via `?raw` and substitutes `<!-- @scss:core-tokens -->` style markers in the markdown with the real rule blocks. Change a token value and the docs follow; never hand-copy token tables into markdown. Group comments inside those `:root` / `body.vgo-theme-default` blocks show up in the docs, so keep them readable.

## Peer dependencies (consumers provide these)

| Package       | Required? |
|---------------|-----------|
| vue           | yes       |
| @vueuse/core  | yes       |
| lodash-es     | yes       |
| element-plus  | optional  |

## Build output

- `dist/index.js` / `dist/index.cjs` / `dist/index.d.ts`
- `dist/vue-monaco.js` / `dist/vue-monaco.cjs` / `dist/vue-monaco.d.ts`
- `dist/styles/core.css`
- `dist/themes/default.css`

JavaScript sourcemaps are enabled. Styles are built as separate core and default-theme outputs.

## CSS / Sass

Uses SCSS with `sass-embedded`. The `@use` rule is used (not `@import`) for Dart Sass compatibility.
Component classes use `vgo-` BEM names, states use `is-*`, and utilities use `vgo-u-*`. The default theme is scoped to `body.vgo-theme-default`; dark mode uses `html.dark`.

### Style contract (minimalist)

The primitive set is closed. Before adding any button, panel, or list class, check `docs/src/views/docs/styles.md` — it is the single reference (tokens, native-element classes, primitives, utilities, and the banned list), and the docs site itself must be built only from these primitives.

- Buttons: `.vgo-button` + `--primary` / `--danger` / `--text` / `--overlay` / `--overlay-light`, orthogonal with `--icon` / `--round` / `--sm` / `--lg`. Runtime selection uses `.is-active`, never `--primary`.
- Panels: `.vgo-panel` (card), `--flat` (toolbar/header/footer), `--overlay` / `--overlay-light` (floating over media). Nothing else.
- Overlay palettes deliberately do **not** flip with `html.dark` — what sits underneath is arbitrary media, so the choice depends on the media's brightness, not the app theme. The two modifiers differ only in tokens, so putting `--overlay-light` on a container recolours the `--overlay` children inside it by inheritance.
- List rows: `.vgo-list-item` with `.is-active` / `.is-disabled`. Plus `.vgo-empty`, `.vgo-badge`, `.vgo-progress`.
- Tokens: structural scales (`--vgo-space-*`, `--vgo-font-*`, `--vgo-icon-*`, `--vgo-control-*`, `--vgo-z-*`, `--vgo-duration-*`) live in `core/_runtime.scss`; theme-dependent values live in `themes/default/_tokens.scss`.
- `.is-*` is the shared convention for runtime state across button, list item, rect-switch and window. Add a state, not a variant.

Never write literal colors, literal `border-radius`, custom `box-shadow`, `backdrop-filter`, gradients, or hardcoded transition durations — outside the theme layer, which is where those literals belong.

**Specificity is the recurring trap.** The theme selector `body.vgo-theme-default .vgo-x` scores (0,2,1) — one notch above a consumer's Vue scoped class (`.x[data-v-hash]`, (0,2,0)). So:

- A modifier in core that overrides a themed property (notably `border-radius`) loses. Define it in the theme layer instead.
- To make a library default *easy* to override, wrap it in `:where()` to zero out the class part. Two places do this deliberately: button icon sizing in `core/_primitives.scss`, and **the whole panel group** in the theme (`:where(.vgo-panel)`, `:where(.vgo-panel--flat)`, `:where(.vgo-panel--overlay, …)`). Panels are the primitive consumers keep reshaping, so their appearance is a default, not a rule. The cost is that panel modifiers now resolve by source order, so base must stay above modifiers.
- Do **not** extend `:where()` to buttons. Their variants rely on specificity to rank `--text` / `--overlay` / `.is-active` against each other and against the `:hover` rules; flattening them would make source order decide and silently break, for instance, hover on an active overlay button.
- For anything else, remember custom properties resolve per element: redeclaring a token on the element (`--vgo-radius: var(--vgo-radius-pill)`) sidesteps the specificity contest entirely and is usually the cheapest fix.

Overlay panels remap `--vgo-text`, `--vgo-text-secondary`, `--vgo-border` and `--vgo-hover` onto the overlay palette, so nested primitives (`.vgo-empty`, `.vgo-list-item`) stay readable on top of the translucent surface without each needing its own override.

Reduced motion lives in `core/_runtime.scss`, not in the consumer. `html.reduce-motion` (an app-managed persistent toggle) and the system `prefers-reduced-motion` query both compress the duration tokens *and* clamp `animation-duration` / `transition-duration` on `*` — tokens only reach the library's own transitions, while element-plus, players and context menus hardcode theirs. The manual class does one extra thing the system preference must not: it drops text shadows and backdrop blur to ease e-ink refresh.

The main consumer, `file-lite`, enforces the same contract in CI via `frontend/scripts/check-styles.mjs`. Changing the primitive vocabulary here means updating that script's rules and `styles.md` together.

## Changelog

Update `CHANGELOG.md` in the same change that alters public API, class names, tokens, style entrypoints, or exports. Skip it for internal refactors, docs-only edits and tooling.

- Newest version first. Write in Chinese.
- Subsections in this order, omitting any that would be empty: `### 破坏性变更（Breaking）` / `### 新增` / `### 变更` / `### 修复`.
- **Never open an "未发布" section for work that will ship in the current unreleased version** — fold it into that version's entry instead. `package.json` holds the version that is being written to.
- Every breaking bullet must state the migration inline, not just what changed. Say what a reader has to *do*.
- Explain why a change matters where it isn't obvious; a bullet that only restates a diff is noise. One bullet per user-visible change, not per commit.
- Long rename lists go in a table, not nested bullets.
- Lead each version with a one-sentence summary when the release has a theme, and point at the doc page that is the source of truth.

## CI

GitHub Actions deploys `docs/dist` to GitHub Pages on push to `master`. The workflow installs both root and docs dependencies with `--frozen-lockfile`, then copies `index.html` to `404.html` for SPA fallback.

## Local development (link to consumer project)

```bash
bun i && bun run build && bun link
# in consumer project:
bun link @canwdev/vgo-ui
```

## Publish

```bash
# 1. bump version in package.json
bun publish --access public
```
