import { create } from 'zustand'

interface FullscreenState {
  isFullscreen: boolean
  isSupported: boolean
  setFullscreen: (value: boolean) => void
  toggleFullscreen: () => void
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
}

const useFullscreenStore = create<FullscreenState>((set, get) => ({
  isFullscreen: false,
  isSupported: typeof document !== 'undefined' && !!document.documentElement.requestFullscreen,

  setFullscreen: (value: boolean) => set({ isFullscreen: value }),

  toggleFullscreen: async () => {
    const { isFullscreen, isSupported } = get()
    if (!isSupported) return

    try {
      if (isFullscreen) {
        await get().exitFullscreen()
      } else {
        await get().enterFullscreen()
      }
    } catch (err) {
      // Fullscreen request may fail if not triggered by user gesture
      console.warn('Fullscreen toggle failed:', err)
    }
  },

  enterFullscreen: async () => {
    const { isSupported } = get()
    if (!isSupported) return

    try {
      await document.documentElement.requestFullscreen()
    } catch (err) {
      console.warn('Enter fullscreen failed:', err)
    }
  },

  exitFullscreen: async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err)
    }
  },
}))

export default useFullscreenStore
