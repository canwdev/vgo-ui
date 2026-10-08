import { nextTick, reactive } from 'vue'

export interface ManagedWindow<T = unknown> {
  id: string
  // 相同 key 的窗口只保留一个，再次打开时复用
  key?: string
  title: string
  data: T
  minimized: boolean
  maximized: boolean
  // 关闭动画进行中，动画结束后从列表移除
  isClosing: boolean
}

export interface OpenWindowOptions {
  key?: string
  title?: string
  maximized?: boolean
}

// 窗口的渲染层，由 WindowStack 注册；自行渲染窗口时也可以自己注册
export interface WindowView {
  setActive: () => void
  focus: () => void
}

// 返回 false 时取消关闭，例如有未保存的修改
export type CloseGuard = () => boolean | Promise<boolean>

export interface WindowManagerOptions<T> {
  // 关闭动画时长（ms），之后才从列表移除
  closeDelay?: number
  // 守卫通过、窗口开始关闭时调用
  onClose?: (win: ManagedWindow<T>) => void
}

// WindowDock 右键菜单文案
export interface WindowDockMenuLabels {
  close: string
  closeOthers: string
  closeToLeft: string
  closeToRight: string
}

export interface WindowManager<T> {
  // 任务栏顺序，move() 会改变它
  readonly windows: ManagedWindow<T>[]
  // 打开顺序，排序不影响；自行渲染窗口时按它 v-for，避免窗口 DOM 被移动
  readonly stack: ManagedWindow<T>[]
  readonly activeId: string
  readonly activeWindow: ManagedWindow<T> | undefined
  get: (id: string) => ManagedWindow<T> | undefined
  findByKey: (key: string) => ManagedWindow<T> | undefined
  open: (data: T, options?: OpenWindowOptions) => ManagedWindow<T>
  toggle: (data: T, options: OpenWindowOptions & { key: string }) => void
  activate: (id: string) => void
  toggleFromDock: (id: string) => void
  minimize: (id: string) => void
  // 最小化全部窗口并清空当前窗口
  minimizeAll: () => void
  // 是否处于“显示桌面”状态，再次 toggleDesktop() 会还原
  readonly desktopShown: boolean
  // 显示桌面：第一次最小化所有可见窗口，第二次按原叠放顺序还原它们和当前窗口。
  // 期间打开或激活了窗口则放弃还原，下次调用重新最小化全部
  toggleDesktop: () => void
  requestClose: (id: string) => Promise<boolean>
  closeOthers: (id: string) => Promise<void>
  closeToLeft: (id: string) => Promise<void>
  closeToRight: (id: string) => Promise<void>
  close: (id: string) => void
  move: (from: number, to: number) => void
  setCloseGuard: (id: string, guard: CloseGuard | null) => void
  registerView: (id: string, view: WindowView | null) => void
}

let idSeed = 0

export function createWindowManager<T = unknown>(options: WindowManagerOptions<T> = {}): WindowManager<T> {
  const closeDelay = options.closeDelay ?? 300
  // 不让 reactive 推导类型：它会把 data 展开成 UnwrapRef<T>，与泛型 T 对不上
  // windows 是任务栏顺序，可拖动排序；stack 是打开顺序，渲染窗口用。
  // 两者分开是因为重排渲染列表会移动窗口 DOM，其中的 iframe 会因此重新加载
  const state = reactive({ windows: [], stack: [], activeId: '', desktop: null }) as {
    windows: ManagedWindow<T>[]
    stack: ManagedWindow<T>[]
    activeId: string
    // 显示桌面前可见的窗口（按叠放顺序，底层在前）和当时的当前窗口
    desktop: { ids: string[], activeId: string } | null
  }
  const views = new Map<string, WindowView>()
  const guards = new Map<string, CloseGuard>()
  const closeInFlight = new Set<string>()
  // 激活顺序，最后一个在最上层；还原显示桌面时按它恢复叠放顺序
  let zOrder: string[] = []

  function raise(id: string) {
    zOrder = zOrder.filter(item => item !== id)
    zOrder.push(id)
  }

  function isAlive(win: ManagedWindow<T> | undefined): win is ManagedWindow<T> {
    return Boolean(win && !win.isClosing)
  }

  function get(id: string) {
    return state.windows.find(win => win.id === id)
  }

  function findByKey(key: string) {
    return state.windows.find(win => win.key === key && !win.isClosing)
  }

  function focusLater(id: string) {
    setTimeout(() => views.get(id)?.focus())
  }

  function activate(id: string) {
    const win = get(id)
    if (!win || win.isClosing) {
      return
    }
    state.desktop = null
    win.minimized = false
    raise(id)
    if (state.activeId !== id) {
      state.activeId = id
      views.get(id)?.setActive()
    }
    focusLater(id)
  }

  function open(data: T, openOptions: OpenWindowOptions = {}) {
    const existing = openOptions.key === undefined ? undefined : findByKey(openOptions.key)
    if (existing) {
      existing.data = data
      if (openOptions.title !== undefined) {
        existing.title = openOptions.title
      }
      activate(existing.id)
      return existing
    }

    state.windows.push({
      id: `vgo-win-${Date.now().toString(36)}-${(idSeed++).toString(36)}`,
      key: openOptions.key,
      title: openOptions.title ?? '',
      data,
      minimized: false,
      maximized: openOptions.maximized ?? false,
      isClosing: false,
    })
    // 取回数组里的响应式代理，调用方修改它才会触发更新
    const win = state.windows[state.windows.length - 1]
    state.stack.push(win)
    state.activeId = win.id
    state.desktop = null
    raise(win.id)
    return win
  }

  function toggle(data: T, openOptions: OpenWindowOptions & { key: string }) {
    const existing = findByKey(openOptions.key)
    if (existing) {
      requestClose(existing.id)
      return
    }
    open(data, openOptions)
  }

  // 任务栏行为：点击当前窗口切换最小化，点击其他窗口激活
  function toggleFromDock(id: string) {
    const win = get(id)
    if (!win) {
      return
    }
    if (state.activeId === id && !win.minimized) {
      win.minimized = true
      return
    }
    activate(id)
  }

  function minimize(id: string) {
    const win = get(id)
    if (win) {
      win.minimized = true
    }
  }

  function minimizeAll() {
    for (const win of state.windows) {
      win.minimized = true
    }
    state.activeId = ''
    state.desktop = null
  }

  async function restoreDesktop(saved: { ids: string[], activeId: string }) {
    state.desktop = null
    const wins = saved.ids.map(get).filter(isAlive)
    if (!wins.length) {
      return
    }
    for (const win of wins) {
      win.minimized = false
    }
    // 窗口重新显示时会各自置顶并上报激活，等它们完成后再按原顺序重排
    await nextTick()
    const top = wins.find(win => win.id === saved.activeId) ?? wins[wins.length - 1]
    for (const win of [...wins.filter(win => win !== top), top]) {
      views.get(win.id)?.setActive()
      raise(win.id)
    }
    state.activeId = top.id
    focusLater(top.id)
  }

  function toggleDesktop() {
    if (state.desktop) {
      restoreDesktop(state.desktop)
      return
    }
    const visible = zOrder.map(get).filter(isAlive).filter(win => !win.minimized)
    if (!visible.length) {
      return
    }
    const activeId = state.activeId
    minimizeAll()
    state.desktop = { ids: visible.map(win => win.id), activeId }
  }

  function close(id: string) {
    const win = get(id)
    if (!win || win.isClosing) {
      return
    }
    win.isClosing = true
    guards.delete(id)
    options.onClose?.(win)

    setTimeout(() => {
      const index = state.windows.findIndex(item => item.id === id)
      if (index === -1) {
        return
      }
      state.windows.splice(index, 1)
      state.stack.splice(state.stack.findIndex(item => item.id === id), 1)
      views.delete(id)
      zOrder = zOrder.filter(item => item !== id)
      if (state.activeId !== id) {
        return
      }
      // 激活关闭窗口前一个仍打开的窗口，最小化的只设为当前项，不弹出；
      // 批量关闭时相邻窗口可能也在关闭中，要跳过
      const alive = (item: ManagedWindow<T>) => !item.isClosing
      const next = state.windows.slice(0, index).reverse().find(alive)
        ?? state.windows.slice(index).reverse().find(alive)
      if (!next) {
        state.activeId = ''
        return
      }
      state.activeId = next.id
      if (!next.minimized) {
        raise(next.id)
        views.get(next.id)?.setActive()
        focusLater(next.id)
      }
    }, closeDelay)
  }

  async function requestClose(id: string) {
    const win = get(id)
    if (!win || win.isClosing || closeInFlight.has(id)) {
      return false
    }
    closeInFlight.add(id)
    try {
      const guard = guards.get(id)
      if (guard) {
        // 确认框问的是哪个窗口，要让用户看得到它。等一帧画出来再问：
        // window.confirm 这类同步弹窗会阻塞渲染，窗口还没还原就弹出
        activate(id)
        await nextTick()
        await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve)))
        if (await guard() === false) {
          return false
        }
      }
      close(id)
      return true
    }
    finally {
      closeInFlight.delete(id)
    }
  }

  // 依次关闭，一次只弹一个确认框；某个窗口取消关闭时保留它，继续关其余的
  async function requestCloseEach(ids: string[]) {
    for (const id of ids) {
      await requestClose(id)
    }
  }

  function openIds() {
    return state.windows.filter(win => !win.isClosing).map(win => win.id)
  }

  function closeOthers(id: string) {
    return requestCloseEach(openIds().filter(item => item !== id))
  }

  function closeToLeft(id: string) {
    const ids = openIds()
    const index = ids.indexOf(id)
    return requestCloseEach(index === -1 ? [] : ids.slice(0, index))
  }

  function closeToRight(id: string) {
    const ids = openIds()
    const index = ids.indexOf(id)
    return requestCloseEach(index === -1 ? [] : ids.slice(index + 1))
  }

  // to 是插入位置 0..windows.length，按移动前的下标计算
  function move(from: number, to: number) {
    const length = state.windows.length
    if (from < 0 || from >= length || to < 0 || to > length) {
      return
    }
    const target = to > from ? to - 1 : to
    if (target === from) {
      return
    }
    const [win] = state.windows.splice(from, 1)
    state.windows.splice(target, 0, win)
  }

  function setCloseGuard(id: string, guard: CloseGuard | null) {
    if (guard) {
      guards.set(id, guard)
    }
    else {
      guards.delete(id)
    }
  }

  function registerView(id: string, view: WindowView | null) {
    if (view) {
      views.set(id, view)
    }
    else {
      views.delete(id)
    }
  }

  return {
    get windows() {
      return state.windows
    },
    get stack() {
      return state.stack
    },
    get activeId() {
      return state.activeId
    },
    get activeWindow() {
      return get(state.activeId)
    },
    get,
    findByKey,
    open,
    toggle,
    activate,
    toggleFromDock,
    minimize,
    minimizeAll,
    get desktopShown() {
      return state.desktop !== null
    },
    toggleDesktop,
    requestClose,
    closeOthers,
    closeToLeft,
    closeToRight,
    close,
    move,
    setCloseGuard,
    registerView,
  }
}
