<script setup lang="ts">
withDefaults(defineProps<{
  side: 'left' | 'right'
  open?: boolean
  title?: string
}>(), {
  open: false,
  title: '',
})

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div
    class="doc-side-panel vgo-u-scrollbar"
    :class="[
      `doc-side-panel--${side}`,
      { 'is-open': open },
    ]"
  >
    <Teleport to="body">
      <div
        v-if="open"
        class="doc-side-panel__backdrop"
        @click="emit('close')"
      />
    </Teleport>

    <aside class="doc-side-panel__sticky">
      <div v-if="title" class="doc-side-panel__title">
        {{ title }}
      </div>

      <slot />
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.doc-side-panel {
  min-width: 0;
}

.doc-side-panel__sticky {
  position: sticky;
  top: var(--docs-sticky-top);
  width: var(--doc-side-width, 220px);
  max-height: calc(100vh - var(--docs-sticky-top) - var(--vgo-space-3));
  padding: var(--vgo-space-1);
  overflow: auto;
  box-sizing: border-box;
}

.doc-side-panel__title {
  padding: var(--vgo-space-1) var(--vgo-space-2);
  font-size: var(--vgo-font-sm);
  color: var(--vgo-text-secondary);
}

.doc-side-panel__backdrop {
  display: none;
}

@media (max-width: 960px) {
  .doc-side-panel {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: var(--vgo-z-overlay);
    width: min(320px, 85vw);
    max-height: none;
    padding: var(--vgo-space-2);
    overflow: auto;
    background-color: var(--vgo-surface);
    box-shadow: var(--vgo-shadow);
    transition: transform var(--vgo-duration-base);
  }

  .doc-side-panel__sticky {
    position: static;
    width: 100%;
    max-height: none;
    overflow: visible;
  }

  .doc-side-panel--left {
    left: 0;
    border-right: 1px solid var(--vgo-border);
    transform: translateX(-100%);
  }

  .doc-side-panel--right {
    right: 0;
    border-left: 1px solid var(--vgo-border);
    transform: translateX(100%);
  }

  .doc-side-panel.is-open {
    transform: translateX(0);
  }

  .doc-side-panel__backdrop {
    position: fixed;
    inset: 0;
    z-index: calc(var(--vgo-z-overlay) - 1);
    display: block;
    background-color: var(--vgo-overlay-surface);
  }
}
</style>
