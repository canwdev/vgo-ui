<script lang="ts" setup>
import { h, ref } from 'vue'
import ModalWindow from './ModalWindow.vue'
import { showModalWindow } from './show'

const plain = ref(false)
const extreme = ref(false)
const focusPrimary = ref(true)

async function openDialog() {
  const confirmed = ref(true)
  const result = await showModalWindow({
    title: '删除文件',
    focusPrimary: focusPrimary.value,
    content: () => h('div', { class: 'vgo-u-flex-column', style: 'gap: var(--vgo-space-2)' }, [
      h('span', '勾选确认后，删除会等待一秒再关闭；没勾选则保持打开。点击遮罩等于取消。'),
      h('label', [
        h('input', {
          type: 'checkbox',
          checked: confirmed.value,
          onChange: (event: Event) => {
            confirmed.value = (event.target as HTMLInputElement).checked
          },
        }),
        ' 我确认删除',
      ]),
      h('button', {
        type: 'button',
        class: 'vgo-button vgo-button--text',
        onClick: () => {
          showModalWindow({
            title: '下一层',
            content: '这个对话框叠在上一个上面，Esc 只关这一层。',
            buttons: [{ label: '好', variant: 'primary' }],
          })
        },
      }, '再开一层'),
    ]),
    buttons: [
      { label: '取消', value: undefined },
      {
        label: '删除',
        variant: 'primary',
        async onClick() {
          if (!confirmed.value) {
            return false
          }
          await new Promise(resolve => setTimeout(resolve, 1000))
          return { deleted: true }
        },
      },
    ],
  })
  console.log('[ModalWindow]', result)
}
</script>

<template>
  <div class="vgo-u-flex-column" style="gap: var(--vgo-space-2);">
    <div class="vgo-u-flex-wrap-center" style="justify-content: flex-start;">
      <button class="vgo-button" @click="openDialog">
        函数式对话框
      </button>
      <button class="vgo-button" :class="{ 'is-active': plain }" @click="plain = true">
        极简
      </button>
      <button class="vgo-button" :class="{ 'is-active': extreme }" @click="extreme = true">
        极限尺寸
      </button>
      <label>
        <input v-model="focusPrimary" type="checkbox">
        聚焦主按钮
      </label>
    </div>

    <!-- 不传 buttons，按钮画在内容里。Esc、Tab 循环由 ModalWindow 处理 -->
    <ModalWindow v-model:visible="plain" title="提示" :focus-primary="focusPrimary">
      <div class="vgo-u-flex-column" style="gap: var(--vgo-space-3);">
        <span>没有底部按钮。这一层不监听键盘，Esc 仍然能关，Tab 在窗口里循环。</span>
        <button class="vgo-button vgo-button--primary" type="button" @click="plain = false">
          知道了
        </button>
      </div>
    </ModalWindow>

    <ModalWindow
      v-model:visible="extreme"
      title="很长很宽"
      :focus-primary="focusPrimary"
      :init-win-options="{ width: '1600px', height: '1400px' }"
      :buttons="[{ label: '关闭', variant: 'primary' }]"
    >
      <div class="vgo-u-flex-column" style="gap: var(--vgo-space-2); width: 1600px;">
        <span>窗口给了 1600 × 1400，比视口大。窗口会被卡在视口内，多出来的在这里滚动。</span>
        <span v-for="row in 40" :key="row">第 {{ row }} 行</span>
      </div>
    </ModalWindow>
  </div>
</template>
