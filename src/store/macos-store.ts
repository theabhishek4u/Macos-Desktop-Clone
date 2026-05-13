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
  snapPosition?: 'left' | 'right' | null
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
    icon: 'finder',
    defaultWidth: 750,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: 'calculator',
    defaultWidth: 320,
    defaultHeight: 500,
    minWidth: 280,
    minHeight: 400,
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: 'notes',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: 'terminal',
    defaultWidth: 650,
    defaultHeight: 420,
    minWidth: 400,
    minHeight: 250,
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    icon: 'calendar',
    defaultWidth: 700,
    defaultHeight: 550,
    minWidth: 500,
    minHeight: 400,
  },
  safari: {
    id: 'safari',
    name: 'Safari',
    icon: 'safari',
    defaultWidth: 900,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 400,
  },
  settings: {
    id: 'settings',
    name: 'System Preferences',
    icon: 'settings',
    defaultWidth: 680,
    defaultHeight: 520,
    minWidth: 500,
    minHeight: 400,
  },
  clock: {
    id: 'clock',
    name: 'Clock',
    icon: 'clock',
    defaultWidth: 400,
    defaultHeight: 450,
    minWidth: 350,
    minHeight: 400,
  },
  photos: {
    id: 'photos',
    name: 'Photos',
    icon: 'photos',
    defaultWidth: 750,
    defaultHeight: 550,
    minWidth: 500,
    minHeight: 400,
  },
  music: {
    id: 'music',
    name: 'Music',
    icon: 'music',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 500,
    minHeight: 350,
  },
  textedit: {
    id: 'textedit',
    name: 'TextEdit',
    icon: 'textedit',
    defaultWidth: 650,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 300,
  },
  weather: {
    id: 'weather',
    name: 'Weather',
    icon: 'weather',
    defaultWidth: 500,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 350,
  },
  launchpad: {
    id: 'launchpad',
    name: 'Launchpad',
    icon: 'launchpad',
    defaultWidth: 0,
    defaultHeight: 0,
    minWidth: 0,
    minHeight: 0,
  },
  maps: {
    id: 'maps',
    name: 'Maps',
    icon: 'maps',
    defaultWidth: 800,
    defaultHeight: 550,
    minWidth: 600,
    minHeight: 400,
  },
  reminders: {
    id: 'reminders',
    name: 'Reminders',
    icon: 'reminders',
    defaultWidth: 650,
    defaultHeight: 500,
    minWidth: 450,
    minHeight: 350,
  },
  chrome: {
    id: 'chrome',
    name: 'Chrome',
    icon: 'chrome',
    defaultWidth: 900,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 400,
  },
  appletv: {
    id: 'appletv',
    name: 'Apple TV',
    icon: 'appletv',
    defaultWidth: 900,
    defaultHeight: 600,
    minWidth: 600,
    minHeight: 400,
  },
  facetime: {
    id: 'facetime',
    name: 'FaceTime',
    icon: 'facetime',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 500,
    minHeight: 400,
  },
  messages: {
    id: 'messages',
    name: 'Messages',
    icon: 'messages',
    defaultWidth: 750,
    defaultHeight: 500,
    minWidth: 500,
    minHeight: 350,
  },
  appstore: {
    id: 'appstore',
    name: 'App Store',
    icon: 'appstore',
    defaultWidth: 800,
    defaultHeight: 550,
    minWidth: 600,
    minHeight: 400,
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
  snapWindow: (windowId: string, position: 'left' | 'right') => void
  unsnapWindow: (windowId: string) => void
  setContextMenu: (menu: { x: number; y: number; items: ContextMenuItem[] } | null) => void
  setWallpaperIndex: (index: number) => void
}

export interface ContextMenuItem {
  label: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
  shortcut?: string
  submenu?: ContextMenuItem[]
}

let windowCounter = 0

const useMacOSStore = create<MacOSState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  dockApps: [
    'launchpad', 'finder', 'safari', 'chrome', 'appletv', 'notes', 'terminal', 'calculator',
    'calendar', 'photos', 'music', 'settings', 'clock',
    'textedit', 'weather', 'maps', 'reminders', 'facetime', 'messages', 'appstore',
  ],
  openApps: [],
  contextMenu: null,
  wallpaperIndex: 0,

  openApp: (appId: string) => {
    // Launchpad is not a window app - it's an overlay handled separately
    if (appId === 'launchpad') return
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

  snapWindow: (windowId: string, position: 'left' | 'right') => {
    set(state => ({
      windows: state.windows.map(w => {
        if (w.id !== windowId) return w
        // Save current bounds as prevBounds if not already saved
        const prevBounds = w.prevBounds ?? { x: w.x, y: w.y, width: w.width, height: w.height }
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080
        const menuBarH = 28
        const dockH = 80

        if (position === 'left') {
          return {
            ...w,
            prevBounds,
            snapPosition: 'left',
            isMaximized: false,
            x: 0,
            y: menuBarH,
            width: Math.floor(screenW / 2),
            height: screenH - menuBarH - dockH,
          }
        } else {
          return {
            ...w,
            prevBounds,
            snapPosition: 'right',
            isMaximized: false,
            x: Math.floor(screenW / 2),
            y: menuBarH,
            width: Math.floor(screenW / 2),
            height: screenH - menuBarH - dockH,
          }
        }
      }),
    }))
  },

  unsnapWindow: (windowId: string) => {
    set(state => ({
      windows: state.windows.map(w => {
        if (w.id !== windowId) return w
        if (!w.snapPosition) return w
        return {
          ...w,
          snapPosition: null,
          isMaximized: false,
          x: w.prevBounds?.x ?? w.x,
          y: w.prevBounds?.y ?? w.y,
          width: w.prevBounds?.width ?? w.width,
          height: w.prevBounds?.height ?? w.height,
          prevBounds: undefined,
        }
      }),
    }))
  },

  setContextMenu: (menu) => set({ contextMenu: menu }),
  setWallpaperIndex: (index) => set({ wallpaperIndex: index }),
}))

export default useMacOSStore
