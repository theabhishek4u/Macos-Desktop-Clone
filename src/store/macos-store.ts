import { create } from 'zustand'

export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  prevBounds?: { x: number; y: number; width: number; height: number }
}

export interface AppConfig {
  id: string
  name: string
  icon: string
  defaultWidth: number
  defaultHeight: number
  minWidth: number
  minHeight: number
}

export const APP_CONFIGS: Record<string, AppConfig> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    icon: '📁',
    defaultWidth: 750,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: '🧮',
    defaultWidth: 320,
    defaultHeight: 500,
    minWidth: 280,
    minHeight: 400,
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    defaultWidth: 650,
    defaultHeight: 420,
    minWidth: 400,
    minHeight: 250,
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    icon: '📅',
    defaultWidth: 700,
    defaultHeight: 550,
    minWidth: 500,
    minHeight: 400,
  },
  safari: {
    id: 'safari',
    name: 'Safari',
    icon: '🧭',
    defaultWidth: 900,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 400,
  },
  settings: {
    id: 'settings',
    name: 'System Preferences',
    icon: '⚙️',
    defaultWidth: 680,
    defaultHeight: 520,
    minWidth: 500,
    minHeight: 400,
  },
  clock: {
    id: 'clock',
    name: 'Clock',
    icon: '🕐',
    defaultWidth: 400,
    defaultHeight: 450,
    minWidth: 350,
    minHeight: 400,
  },
  photos: {
    id: 'photos',
    name: 'Photos',
    icon: '🖼️',
    defaultWidth: 750,
    defaultHeight: 550,
    minWidth: 500,
    minHeight: 400,
  },
  music: {
    id: 'music',
    name: 'Music',
    icon: '🎵',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 500,
    minHeight: 350,
  },
  textedit: {
    id: 'textedit',
    name: 'TextEdit',
    icon: '📄',
    defaultWidth: 650,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 300,
  },
  weather: {
    id: 'weather',
    name: 'Weather',
    icon: '🌤️',
    defaultWidth: 500,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 350,
  },
}

interface MacOSState {
  windows: WindowState[]
  activeWindowId: string | null
  nextZIndex: number
  dockApps: string[]
  openApps: string[]
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null
  wallpaperIndex: number

  openApp: (appId: string) => void
  closeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  updateWindowPosition: (windowId: string, x: number, y: number) => void
  updateWindowSize: (windowId: string, width: number, height: number) => void
  setContextMenu: (menu: { x: number; y: number; items: ContextMenuItem[] } | null) => void
  setWallpaperIndex: (index: number) => void
}

export interface ContextMenuItem {
  label: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
  shortcut?: string
}

let windowCounter = 0

const useMacOSStore = create<MacOSState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  dockApps: [
    'finder', 'safari', 'notes', 'terminal', 'calculator',
    'calendar', 'photos', 'music', 'settings', 'clock',
    'textedit', 'weather',
  ],
  openApps: [],
  contextMenu: null,
  wallpaperIndex: 0,

  openApp: (appId: string) => {
    const config = APP_CONFIGS[appId]
    if (!config) return

    const existingWindow = get().windows.find(w => w.appId === appId && !w.isMinimized)
    if (existingWindow) {
      get().focusWindow(existingWindow.id)
      return
    }

    // Check if minimized
    const minimizedWindow = get().windows.find(w => w.appId === appId && w.isMinimized)
    if (minimizedWindow) {
      set(state => ({
        windows: state.windows.map(w =>
          w.id === minimizedWindow.id ? { ...w, isMinimized: false } : w
        ),
        activeWindowId: minimizedWindow.id,
      }))
      get().focusWindow(minimizedWindow.id)
      return
    }

    windowCounter++
    const windowId = `${appId}-${windowCounter}`
    const zIndex = get().nextZIndex

    // Center the window with some randomness
    const offsetX = Math.random() * 80 - 40
    const offsetY = Math.random() * 40 - 20
    const x = Math.max(0, (window.innerWidth - config.defaultWidth) / 2 + offsetX)
    const y = Math.max(28, (window.innerHeight - config.defaultHeight) / 2 + offsetY)

    const newWindow: WindowState = {
      id: windowId,
      appId,
      title: config.name,
      x,
      y,
      width: config.defaultWidth,
      height: config.defaultHeight,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex,
    }

    set(state => ({
      windows: [...state.windows, newWindow],
      activeWindowId: windowId,
      nextZIndex: zIndex + 1,
      openApps: state.openApps.includes(appId)
        ? state.openApps
        : [...state.openApps, appId],
    }))
  },

  closeWindow: (windowId: string) => {
    const window = get().windows.find(w => w.id === windowId)
    if (!window) return

    set(state => {
      const newWindows = state.windows.filter(w => w.id !== windowId)
      const remainingOpenApps = new Set(newWindows.map(w => w.appId))
      const newOpenApps = state.openApps.filter(id => remainingOpenApps.has(id))
      const newActiveId = newWindows.length > 0
        ? newWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id
        : null

      return {
        windows: newWindows,
        activeWindowId: newActiveId,
        openApps: newOpenApps,
      }
    })
  },

  minimizeWindow: (windowId: string) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, isMinimized: true } : w
      ),
      activeWindowId: state.windows.find(w => w.id !== windowId && !w.isMinimized)?.id ?? null,
    }))
  },

  maximizeWindow: (windowId: string) => {
    set(state => ({
      windows: state.windows.map(w => {
        if (w.id !== windowId) return w
        if (w.isMaximized) {
          // Restore
          return {
            ...w,
            isMaximized: false,
            x: w.prevBounds?.x ?? w.x,
            y: w.prevBounds?.y ?? w.y,
            width: w.prevBounds?.width ?? w.width,
            height: w.prevBounds?.height ?? w.height,
            prevBounds: undefined,
          }
        }
        // Maximize
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 28,
          width: window.innerWidth,
          height: window.innerHeight - 28 - 80, // minus menubar and dock
        }
      }),
    }))
  },

  focusWindow: (windowId: string) => {
    const zIndex = get().nextZIndex
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, zIndex } : w
      ),
      activeWindowId: windowId,
      nextZIndex: zIndex + 1,
    }))
  },

  updateWindowPosition: (windowId: string, x: number, y: number) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, x, y } : w
      ),
    }))
  },

  updateWindowSize: (windowId: string, width: number, height: number) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, width, height } : w
      ),
    }))
  },

  setContextMenu: (menu) => set({ contextMenu: menu }),
  setWallpaperIndex: (index) => set({ wallpaperIndex: index }),
}))

export default useMacOSStore
