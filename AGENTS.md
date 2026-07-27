# AGENTS.md

## Package manager

Always use **bun** for install, scripts, and linking — never npm, yarn, or pnpm.

## Commands

```bash
bun install            # install deps (root)
bun run lint           # eslint src --fix (uses @antfu/eslint-config, type: 'lib')
bun run typecheck      # vue-tsc --noEmit
bun run build          # vue-tsc -b && vite build → dist/
```

No test suite exists in this repo.

## Architecture

- **Library**: `@canwdev/vgo-ui` — a Vue 3 component library (Vite lib mode, ESM + CJS).
- **Two entrypoints**:
  - `src/index.ts` — main barrel, exports components + hooks + styles. Import from `@canwdev/vgo-ui`.
  - `src/vue-monaco.ts` — isolated entry for VueMonaco. Import from `@canwdev/vgo-ui/vue-monaco`. This avoids pulling `monaco-editor` into the main bundle.
- **Styles**: `src/styles/base.scss` is imported by `src/index.ts` at build time and emitted as a single `dist/index.css`. Consumers import via `@canwdev/vgo-ui/styles`.
- **Docs**: Separate bun workspace under `docs/`, uses `rolldown-vite` (aliased from `vite`), not regular Vite. Run with `cd docs && bun run dev`.

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
- `dist/index.css`

Sourcemaps are enabled. CSS code-splitting is disabled (single CSS output).

## CSS / Sass

Uses SCSS with `sass-embedded`. The `@use` rule is used (not `@import`) for Dart Sass compatibility.

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
