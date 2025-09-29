import type { QuickOptionItem } from '../enum'
import { onMounted, ref } from 'vue'

export function useRemoteOptions({ fetchFn, mapFn }) {
  const options = ref<QuickOptionItem[]>([])

  interface ListItem {
    children?: ListItem[]
  }

  const traverse = (list: ListItem[] = [], result: QuickOptionItem[] = []) => {
    list.forEach((item: ListItem) => {
      const r: QuickOptionItem = {
        children: item.children ? traverse(item.children) : undefined,
        ...mapFn(item),
      }

      result.push(r)
    })
    return result
  }

  const loadOptions = async () => {
    const data = await fetchFn()
    options.value = traverse(data)
  }
  onMounted(loadOptions)

  return {
    options,
    traverse,
    loadOptions,
  }
}
