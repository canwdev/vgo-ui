import { useEventListener } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 防止页面关闭
 * @param checkIsChanged 回调函数
 */
export function useBeforeUnload(checkIsChanged: () => boolean) {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (checkIsChanged()) {
      e.preventDefault()
      e.returnValue = 'There is unsaved data.'
      return true
    }
    return undefined
  }
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
}

export function useUnSavedChanges() {
  const isChanged = ref(false)
  useBeforeUnload(() => isChanged.value)
  return {
    isChanged,
  }
}

// replace ctrl+s save action
export function useSaveShortcut(saveFn: () => void) {
  useEventListener(document, 'keydown', (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault() // 阻止默认的保存操作

      saveFn()
    }
  })
}
