<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import type { AutoFormSchema } from './enum'
import { onBeforeUnmount, onMounted, ref, toRefs } from 'vue'
import AutoFormItem from './AutoFormItem.vue'
import { AutoFormItemType } from './enum'
/**
 * Element Plus 表单生成组件
 */
const props = withDefaults(
  defineProps<{
    formSchema: AutoFormSchema
    hideActions?: boolean
    isLoading?: boolean
  }>(),
  {
    hideActions: false,
    isLoading: false,
  },
)

const emit = defineEmits([
  'onInvalidForm',
  'onSubmit',
  'onMounted',
  'onBeforeUnmount',
])

const { formSchema } = toRefs(props)

const formRef = ref<FormInstance>()
function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      console.log('Invalid form')
      emit('onInvalidForm')
      return
    }
    console.log('onSubmit', formSchema.value.model)
    emit('onSubmit', formSchema.value.model)
  })
}

onMounted(() => {
  emit('onMounted', formRef.value)
})

onBeforeUnmount(() => {
  emit('onBeforeUnmount', formRef.value)
})

defineExpose({
  formRef,
  AutoFormItemType,
  submitForm,
})
</script>

<template>
  <el-form
    ref="formRef"
    :label-width="formSchema.labelWidth"
    :model="formSchema.model"
    :rules="formSchema.rules"
    :label-position="formSchema.labelPosition"
    class="vgo-auto-form"
    v-bind="formSchema.props"
    :disabled="isLoading"
    @submit.prevent="submitForm"
  >
    <transition name="fade">
      <div v-show="isLoading" class="vgo-auto-form__loading">
        <div class="vgo-auto-form__loading-text vgo-panel">
          Loading...
        </div>
      </div>
    </transition>

    <div class="vgo-auto-form__content">
      <template v-for="(item, index) in formSchema.formItems">
        <!--      自动grid数组 -->
        <div
          v-if="Array.isArray(item)"
          :key="`g_${index}`"
          class="vgo-auto-form__grid"
          :class="[`vgo-auto-form__grid--cols-${item.length}`]"
          :style="{ gridTemplateColumns: `repeat(${item.length}, 1fr)` }"
        >
          <template v-for="vi in item">
            <AutoFormItem
              v-if="'key' in vi"
              :key="vi.key"
              :item="vi"
              :model="formSchema.model"
            />
          </template>
        </div>
        <!--      手动grid数组(AutoFormRow) -->
        <div
          v-else-if="'children' in item && Array.isArray(item.children)"
          :key="`ag_${index}`"
          class="vgo-auto-form__grid"
          :class="[`vgo-auto-form__grid--cols-${item.cols}`]"
          :style="{ gridTemplateColumns: `repeat(${item.cols}, 1fr)` }"
        >
          <AutoFormItem
            v-for="vi in item.children"
            :key="vi.key"
            :item="vi"
            :model="formSchema.model"
          />
        </div>
        <!--      单个内容 -->
        <AutoFormItem
          v-else-if="'key' in item"
          :key="index"
          :item="item"
          :model="formSchema.model"
        />
      </template>
    </div>

    <!--    操作按钮 -->
    <div v-if="!hideActions" class="vgo-auto-form__actions">
      <slot name="actions" :submit-form="submitForm">
        <el-button type="primary" @click="submitForm()">
          Submit
        </el-button>
      </slot>
    </div>

    <slot />
  </el-form>
</template>

<style lang="scss">
.vgo-auto-form {
  position: relative;

  &__loading {
    position: absolute;
    inset: 0;
    z-index: var(--vgo-z-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: wait;
  }

  &__loading-text {
    padding: 10px;
  }

  &__grid {
    display: grid;
    grid-template-rows: auto;
    gap: 10px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
