# Changelog

## 0.4.2

Icons are no longer coupled to the `.mdi` font classes anywhere in the library or its docs. Consumers and the docs site render mdi icons as inline SVG from `@iconify-json/mdi` (with `unplugin-icons` in Vue, i.e. `<i-mdi-* />`), the same setup file-lite already uses. The style contract page (`styles.md`) is still the single reference for tokens / primitives / utilities. This release also adds a self-hosted context menu (`ContextMenu`), ported from the core of `@imengyu/vue3-context-menu`; its page is `context-menu.md`.

### Breaking

- **The button icon default sizing rules are gone.** `:where(.vgo-button) :where(.mdi)` / `:where(.vgo-button--lg) :where(.mdi)` (icon `--vgo-icon-md` / `-lg` defaults inside buttons) were removed from `src/styles/core/_primitives.scss`. The library no longer sizes icon elements by class name or element type, so buttons do not enlarge icons anymore: an icon (inline SVG at `1em`, or a font glyph) renders at the surrounding text size. **Migration**: put `.vgo-u-icon-md` / `.vgo-u-icon-lg` on the icon element itself when a fixed icon size is wanted — the utility is a plain `font-size`, works with any icon mechanism, and its specificity overrides whatever the component sets. Consumers that previously relied on `.mdi` classes inside vgo buttons must switch to their own icon system anyway (vgo-ui never shipped the glyph font); sizing is now explicit instead of implicit.
- The docs site no longer loads `@mdi/font`; if you copied demo markup that used `class="mdi mdi-*"`, replace it with your own icon element (inline SVG from `@iconify-json/mdi`, e.g. `<i-mdi-cog />` with unplugin-icons).

### Added

- **A self-hosted context menu**, `ContextMenu` (function mode: `ContextMenu.showContextMenu` / `closeContextMenu` / `isAnyContextMenuOpen` / `transformMenuPosition` / `install`), `ContextMenuBar` (the menu bar), `ContextMenuRoot` / `ContextMenuGroup` / `ContextMenuItem` / `ContextSubMenu` (component mode), plus `MenuItem` / `MenuOptions` / `MenuBarOptions` and the instance types. It is a port of the core of `@imengyu/vue3-context-menu` that file-lite used, with the parts we do not want dropped: the four skins (default / flat / win10 / mac), the `MenuTrigger` wrapper and the standalone `@imengyu/vue-scroll-rect` dependency are gone, so the menu pulls in no third-party runtime. Scrolling is native and submenus are teleported to the menu host, which is also what lets them escape the scroll container. Appearance comes only from `--vgo-*` tokens, so the menu is light under `body.vgo-theme-default` and dark under `html.dark`; `MenuOptions.theme` is kept as a compatibility switch — any value containing `dark` (the old `'flat dark'` included) pins the dark palette on the menu root, other legacy skin names no longer change the look. Menu rows are styled by `.vgo-context-menu__item` itself and do **not** carry the `.vgo-list-item` primitive: a menu row is denser than a list row, and its hover / selection must stay under the menu's control, so consumer restyling of `.vgo-list-item` no longer leaks into menus. The docs page `context-menu.md` is the reference. **Migration from `@imengyu/vue3-context-menu`**: `import ContextMenu from '@imengyu/vue3-context-menu'` becomes `import { ContextMenu } from '@canwdev/vgo-ui'`, `MenuBar` becomes `ContextMenuBar`, and the `import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'` line is dropped — the menu ships inside `styles/core` + `themes/default`. `updownButtonSpaceholder` (declared but never implemented upstream) is removed, `mouseScroll` is accepted but ignored, and `MenuTrigger` is not ported.
- **The upstream spelling mistakes are fixed**, so copied class names and internal APIs no longer carry them: the component and CSS class `Sperator` are now `Separator` / `.vgo-context-menu__separator`, the misspelled `--mx-menu-backgroud` family is replaced by `--vgo-*` tokens, and internal `getPositon` / `closeOtherSubMenuWithTimeOut` / `markThisOpenedByKeyBoard` became `getPosition` / `closeOtherSubMenuWithTimeout` / `markThisOpenedByKeyboard`. The `MenuBar` pop-direction bug (`startsWith('r')` instead of `endsWith('r')` for the right edge) is fixed as well.
- **`useContextMenuTrigger`**, a headless composable for the common "a button opens a menu under itself, the button stays active, clicking it again closes" pattern. Bind `triggerRef` to the trigger, call `toggle` on `click`, drive the active class from `isOpen`, and pass `items` as an array or a getter; the hook computes `x` / `y` from `getBoundingClientRect()` (with a `gap` option) and resets state from `onClose`, so Esc / outside press / scroll also deactivate the trigger. It deliberately stays a hook instead of porting upstream's `MenuTrigger` component — the button markup and styling remain the consumer's (`context-menu.md` shows the usage). It also owns the outside-click ordering: it appends a generated class to the trigger and passes it as `ignoreClickClassName`, so the document capture-phase outside-close no longer swallows the trigger press and reopens the menu it just closed.

### Changed

- **docs workspace now consumes `@iconify-json/mdi` + `unplugin-icons`** (devDependencies, vite plugin `Icons({ compiler: 'vue3', scale: 1 })` + `IconsResolver({ enabledCollections: ['mdi'] })`), mirroring file-lite's setup. All docs chrome icons (nav, theme control, code-block copy button) moved from the `.mdi` font to inline-SVG mdi icons.
- Library demo SFCs (`DemoViewPortWindow.vue`, `DemoOptionUI.vue`) no longer reference `.mdi` classes; window title-bar icons are inline mdi SVGs.
- `styles.md` examples that embed icons now use inline mdi SVG glyphs via a page-local symbol sprite referenced with `<svg><use>`, keeping samples readable; the "icon font size" section explains that `.vgo-u-icon-*` applies to any icon element and buttons no longer auto-size icons.

### Fixed

- **A `ViewPortWindow` nested inside another window can be resized again.** The maximized-window rule `.vgo-window.is-maximized .vgo-window__resize-handle { pointer-events: none }` matched every resize handle in the subtree, so a nested window's handles were dead while its ancestor was maximized. The `is-maximized`, `is-dragging` and `is-titleless` body/handle rules (core) plus the close-button corner rule (default theme) are now scoped to the window's own content (`> .vgo-window__content > .vgo-window__body`, `> .vgo-window__resize-handle`), so nested windows keep their own behaviour and styling.
- **A menu bar forced to dark no longer renders black text on its dark background.** `theme: 'dark'` (any value containing `dark`) pins the dark tokens on `.vgo-context-menu-bar`, but the bar declared no `color` of its own and inherited the body's already-resolved light-theme color, so only the surface darkened while the File / View / Help labels stayed near-black; under global `html.dark` the body color itself was light, which is why that path looked fine. The bar now reads `color: var(--vgo-text)` on the same element that carries the tokens. The popup menu was never affected — `.vgo-context-menu` already declared its own `color`.
- **Moving the pointer diagonally into an open submenu no longer closes it before you arrive.** A submenu used to be closed synchronously as soon as the pointer entered any sibling row without children, so a diagonal path (e.g. `Open with` → second submenu entry) that grazed `Cut` / `Copy` killed the target mid-flight; only sibling rows *with* children got the `subMenuOpenDelay` grace. Closing is now delay-based: `SubMenuParentContext.closeOtherSubMenuWithTimeout()` (declared and implemented since the port but never called) is wired up, entering the submenu cancels the pending close — walking the whole ancestor chain, so teleported nested submenus also keep their parents open — and re-entering the owning item cancels it instead of closing and reopening. A new `subMenuCloseDelay` option controls the grace (`200` ms by default, matching `subMenuOpenDelay`; `0` restores the old immediate close and is documented in `context-menu.md`).
- **`ignoreClickClassName` is honoured for clicks outside the menu too, not just for menu-item clicks.** `checkTargetAndClose` ignored the option and closed on any outside click, which broke the standard "button toggles its own dropdown" pattern: the document capture-phase handler closed the menu on the trigger press, and the button's own `click` then reopened it, so the menu could never be closed by its trigger. Clicks whose path contains that class are now ignored. `context-menu.md` documents the trigger pattern.
- **A touch tap that opens a submenu no longer closes the whole menu when the browser retargets the same tap onto the newly appeared submenu.** On touch screens the synthetic `mouseenter` opens the submenu, and if it is clamped or flipped back over the parent — common for third-level menus on narrow screens — the tapped point ends up over a *different* item by the time the compatibility `click` is dispatched, so the click activated that (often leaf) item and its `clickClose` shut the whole menu. The menu now records the `touchstart` target and ignores a `click` whose target is not on the same path, so the tap only opens the submenu. Desktop clicks and keyboard activation are unaffected.
- **An element-anchored dropdown near the right edge now flips against the trigger's right edge instead of ending up to the left of it.** The horizontal overflow flip subtracts the menu's own width, which put the menu's right edge at the anchor *point* — correct for a cursor-anchored context menu, but for a button it left the whole menu to the left of the button (right edge at the button's left edge). The new `MenuOptions.anchorWidth` makes the flip land on `x + anchorWidth`; `useContextMenuTrigger` fills it with the trigger's width, and also derives the anchor edge from `direction` (right-opening aligns left, left-opening aligns right, centred splits the difference). It applies to the root menu only: submenus must still clear the parent menu by their full width, since `globalOptions` is shared across levels and inheriting the trigger width made a flipped submenu overlap its parent. `showContextMenu` users doing dropdowns should pass `anchorWidth: triggerEl.offsetWidth`; cursor context menus can leave it unset and keep the old behaviour. Documented in `context-menu.md`.

## 0.4.1

- Polish docs styles
- Optimize ViewPortWindow event emits
- Minor style refine
- ViewPortWindow title-bar button icons are now theme tokens (`--vgo-window-icon-minimize` / `-restore` / `-maximize` / `-close`) drawn with a `currentColor` CSS mask, instead of inline SVGs in the component template. A custom theme swaps its own button icons by re-declaring these variables; visual output is unchanged.
- **Removed the `LayoutHelper` component and its styles** (`export { LayoutHelper }`, `.vgo-layout-helper*`). It only fed ViewPortWindow's maximize-button layout menu, which is no longer part of the window. Importers that rendered a layout menu must build their own from the exported `LayoutPreset`; the removed `layoutList` array only fed the deleted menu. Window-edge snapping and the `.vgo-layout-preview` overlay are unaffected.

## 0.4.0 (Breaking style refactor)

The style layer was rewritten into two layers — "core structure + theme appearance" — and converged into a closed vocabulary. See the "Style Overview" page in the docs site; it is the single reference.

### Breaking

- **The style entrypoints were split in two**: `@canwdev/vgo-ui/styles` is removed; import `@canwdev/vgo-ui/styles/core` and `@canwdev/vgo-ui/themes/default` together instead. core holds reset / structure / utilities; theme only holds tokens and appearance. The default theme is scoped to `body.vgo-theme-default`; dark mode uses `html.dark`.
- **Naming unified**: component classes use `vgo-`-prefixed BEM, state classes use `.is-*`, utilities use `.vgo-u-*`. See the migration table below.
- **`FoldableSidebarLayout` and `TabLayout` removed**, along with their styles. Zero references in the library, docs site and consumers. Split views now use Element Plus's `el-splitter`; tab lists are composed with `.vgo-list-item`.
- **`.vgo-button` is now `inline-flex`** with a default height (`--vgo-control-md`) and font size. Previously it only had padding and its height came from content; after upgrading, buttons align to the `--vgo-control-sm` / `-md` / `-lg` scale.
- `.vgo-option-item__subtitle` changed from `opacity: 0.6` to `color: var(--vgo-text-secondary)`.

### Added

- **Tokens**. Structural scales (core, theme-independent): `--vgo-space-1..4`, `--vgo-font-*`, `--vgo-icon-*`, `--vgo-control-*`, `--vgo-z-*`, `--vgo-duration-*`. Derived radii (theme layer): `--vgo-radius-lg`, `--vgo-radius-pill`; overriding `--vgo-radius` follows the whole set. Overlay palettes: `--vgo-overlay-*`, which do not flip with light/dark.
- **Buttons**: `--text` / `--overlay` / `--overlay-light` color variants, `--icon` / `--round` / `--sm` / `--lg` shape and size modifiers, orthogonal in both groups; `.is-active` expresses runtime selection, orthogonal to the color variants.
- **Primitives**: `.vgo-panel--flat` (edge-to-edge toolbar / header / footer), `.vgo-panel--overlay` and `--overlay-light` (floating over images/videos, blur managed centrally by the library), `.vgo-list-item`, `.vgo-empty`, `.vgo-badge`, `.vgo-progress`.
- **Reduced motion is now fully handled by the library**. `html.reduce-motion` (an app-managed persistent toggle) and the system `prefers-reduced-motion` both compress the duration tokens and clamp `animation-duration` / `transition-duration` on `*` as a fallback — tokens cannot reach third parties like element-plus or players that hardcode durations. The former does one extra thing: it drops text shadows and background blur to ease e-ink refresh. Consumers no longer need to implement this themselves.
- **New "Style Overview" page in the docs site**, merging the old "CSS Styles" and "Native HTML Elements" pages; it is the single reference for tokens / primitives / utilities / the banned list.

### Changed

- **Panel theme appearance is now a zero-specificity default** (`:where(.vgo-panel)` etc.). Previously a consumer scoped class could not beat `body.vgo-theme-default .vgo-panel`, so adding a separator line to an edge-to-edge header or making an overlay toolbar pill-shaped required an extra nested parent selector or `!important`; now it just works. The cost: panel modifiers now resolve by source order. Buttons do **not** get this treatment — their variants already rank by specificity.
- **Overlay panels now remap `--vgo-text` / `--vgo-text-secondary` / `--vgo-border` / `--vgo-hover`**. Previously `.vgo-empty` and `.vgo-list-item` nested in `.vgo-panel--overlay` used the theme body color — dark text on a translucent dark surface in light themes, hard to read.
- Hardcoded transition durations, `z-index` values and icon font sizes in the library all switched to tokens.
- `.vgo-list-item` and `.vgo-option-item__child.is-clickable` share the same hover implementation.
- Icon font size inside buttons is declared with `:where()`, so its specificity is 0 and consumers can override it with `.vgo-u-icon-*`.
- `<a class="vgo-button">` / `<a class="vgo-list-item">` no longer get underlined or tinted as links by the browser.

### Class name migration table

| Old | New |
| --- | --- |
| `.font-italic` / `.font-code` / `.font-emoji` | `.vgo-u-font-*` |
| `.btn-no-style` | `.vgo-u-button-reset` |
| `.scrollbar-mini` | `.vgo-u-scrollbar` |
| `.flex-rows` / `.flex-cols` / `.flex-row-center-gap` | `.vgo-u-flex-row` / `.vgo-u-flex-column` / `.vgo-u-flex-wrap-center` |
| `.vgo-bg` | `.vgo-u-surface` |
| `.vgo-button.primary` | `.vgo-button--primary` |
| `.auto-form-el-plus` / `.auto-form-grid` / `.auto-form-actions` / `.auto-form-item` | `.vgo-auto-form` / `.vgo-auto-form__grid` / `.vgo-auto-form__actions` / `.vgo-auto-form-item` |
| `.auto-table-el-plus` / `.common-pagination-wrap` | `.vgo-auto-table` / `.vgo-list-pagination` |
| `.c-panel-item` / `.panel-header` / `.sub-item` / `.option-item-action` / `.rect-switch` | `.vgo-option-item` / `.vgo-option-item__header` / `.vgo-option-item__child` / `.vgo-option-action` / `.vgo-rect-switch` |
| `.vgo-window-content` / `-title-bar` / `-body` / `-controls` / `.draggable-window-resize` | `.vgo-window__content` / `__title-bar` / `__body` / `__controls` / `__resize-handle` |
| `.expanded` / `.clickable` / `.active` / `._maximized` / `._dragging` / `._active` | `.is-expanded` / `.is-clickable` / `.is-active` / `.is-maximized` / `.is-dragging` / `.is-active` |

## 0.3.1 (Beta, includes breaking changes)

### Breaking

- **`VueMonaco` is no longer exported from the main entry `@canwdev/vgo-ui`**. Switch to `import { VueMonaco } from '@canwdev/vgo-ui/vue-monaco'` and install `monaco-editor` in your project. Apps that don't use the editor no longer need to install Monaco.
- Added the **`exports["./vue-monaco"]`** subpath (ESM/CJS + types).
- **QuickOptions module removed**: the `QuickOptions`, `QuickContextMenu`, `QuickMenuStrip`, `DropdownMenu` components and the `QuickOptionItem`, `DynamicValueDisplayProps` types are no longer exported; the corresponding docs pages were removed. If you still need similar capabilities, migrate from an older release or the source yourself.

### Changed

- **`monaco-editor` removed from `peerDependencies`** (only VueMonaco users install it on demand).
- Build is now **dual-entry**: `index` and `vue-monaco`; the main package JS no longer contains a static reference to `monaco-editor`.

## 0.3.0

### Breaking

- Published output is now a **prebuilt `dist/`**; referencing unexported source files from arbitrary package paths is no longer recommended — use the `exports` field of `package.json`. This entry documents the 0.3.x build structure; the current output follows the 0.4.0 entry.
- **Styles (old 0.3.x usage)**: a single compiled stylesheet was used back then; that entrypoint was removed in 0.4.0 — migrate to the two new entrypoints above.
- **Peer dependencies**: `element-plus` and `monaco-editor` are listed in `peerDependencies` (optionally marked via `peerDependenciesMeta`); install matching versions yourself when using the corresponding components.

### Added

- Root-level **Vite library mode** build: `vite build` outputs ESM + CJS, with **`vite-plugin-dts`** generating type declarations.
- **`src/index.ts`**: unified export of components, composables and types; the form-item config interface is exported as **`AutoFormField`** at the package entry because it collides with the component `AutoFormItem`.
- **`package.json` (0.3.x)**: added `main` / `module` / `types` / `exports` / `files` and the then-current single style subpath; current exports follow the 0.4.0 entry.
- Scripts: `build`, `typecheck`; `bun:pack` runs the build before packing.
- Dev dependencies: `vite`, `@vitejs/plugin-vue`, `vite-plugin-dts`, `vue-tsc`, `@vue/tsconfig`, `sass-embedded`, `vue-router` (for types and some components), `ajv` (dts toolchain), etc.

### Changed

- **`tsconfig.json`**: extends `@vue/tsconfig/tsconfig.dom.json`, with `types`, `skipLibCheck` and other options consistent with Vue projects.
- **Types**: fixed multiple TypeScript and template type issues in `src` (OptionUI, QuickOptions, ViewPortWindow, VueMonaco, ListPagination, etc.).
- **Docs**: updated `README.md` and `docs/src/views/docs/*` install/usage notes to match npm package usage.
- **ESLint**: upgraded to **`@antfu/eslint-config` v8** + ESLint 10; `eslint.config.js` uses flat config with recommended settings such as `type: 'lib'`.

### Fixed

- `env.d.ts` and `vite/client` types resolve correctly under the root project; `.vue` module resolution and `vue-tsc` checks pass.
