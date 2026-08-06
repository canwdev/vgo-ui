interface ItemDragOptions {
  index: number
  cb: (oldIndex: number, newIndex: number, event: DragEvent) => void
}

export function generateItemDragProps({ index, cb }: ItemDragOptions) {
  const getEl = (event: DragEvent) => (event.currentTarget as HTMLElement).closest('.vgo-option-item__child')
  return {
    draggable: true,
    onDragstart: (event: DragEvent) => {
      // const el = getEl(event)
      // console.log('onDragStart', el)
      event.dataTransfer?.setData('data-transfer-index', String(index))
    },
    onDragover: (event: DragEvent) => {
      event.preventDefault()
      const el = getEl(event)
      // console.log('onDragOver', el)
      el?.classList.add('is-drag-over')
    },
    onDragleave: (event: DragEvent) => {
      event.preventDefault()
      const el = getEl(event)
      // console.log('onDragLeave', el)
      el?.classList.remove('is-drag-over')
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      const el = getEl(event)
      // console.log('onDrop', el)
      el?.classList.remove('is-drag-over')
      const oldIndex = Number(event.dataTransfer?.getData('data-transfer-index'))
      cb(oldIndex, index, event)
    },
  }
}
