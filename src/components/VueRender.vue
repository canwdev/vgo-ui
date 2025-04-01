<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'VueRender',
  props: {
    renderFn: {
      type: [Object, Function],
      required: true,
    },
    params: null,
    modelValue: null,
  },
  render(props) {
    if (typeof this.renderFn === 'function') {
      return this.renderFn(props.params, props.modelValue, this.$emit)
    }
    return this.renderFn
  },
})
</script>
