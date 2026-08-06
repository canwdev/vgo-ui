<script lang="ts">
import type { PropType, VNode } from 'vue'
import { defineComponent } from 'vue'

type RenderFn = (...args: never[]) => VNode
type EmitFn = (event: string, ...args: unknown[]) => void

export default defineComponent({
  name: 'VueRender',
  props: {
    renderFn: {
      type: [Object, Function] as PropType<VNode | RenderFn>,
      required: true,
    },
    params: null,
    modelValue: null,
  },
  render(props: { params: unknown, modelValue: unknown }) {
    if (typeof this.renderFn === 'function') {
      const emit = (event: string, ...args: unknown[]) => this.$emit(event, ...args)
      const renderFn = this.renderFn as (
        params: unknown,
        modelValue: unknown,
        emit: EmitFn,
      ) => VNode
      return renderFn(props.params, props.modelValue, emit)
    }
    return this.renderFn
  },
})
</script>
