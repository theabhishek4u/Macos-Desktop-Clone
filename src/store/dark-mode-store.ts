import { create } from 'zustand'

interface DarkModeState {
  isDarkMode: boolean
  toggle: () => void
  setDarkMode: (value: boolean) => void
}

const useDarkModeStore = create<DarkModeState>((set) => ({
  isDarkMode: false,
  toggle: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  setDarkMode: (value: boolean) => set({ isDarkMode: value }),
}))

export default useDarkModeStore
