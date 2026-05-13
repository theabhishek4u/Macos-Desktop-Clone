import { create } from 'zustand'

const STORAGE_KEY = 'macos-auth-store'

interface AuthState {
  password: string
  passwordHint: string
  isPasswordSet: boolean
  requireLogin: boolean
  setPassword: (newPassword: string) => void
  setPasswordHint: (hint: string) => void
  authenticate: (inputPassword: string) => boolean
  removePassword: () => void
  setRequireLogin: (value: boolean) => void
}

function encodePassword(pwd: string): string {
  if (typeof window === 'undefined') return ''
  return btoa(encodeURIComponent(pwd))
}

function decodePassword(encoded: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return decodeURIComponent(atob(encoded))
  } catch {
    return ''
  }
}

function loadFromStorage(): { password: string; passwordHint: string; isPasswordSet: boolean; requireLogin: boolean } {
  if (typeof window === 'undefined') {
    return { password: '', passwordHint: '', isPasswordSet: false, requireLogin: false }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { password: '', passwordHint: '', isPasswordSet: false, requireLogin: false }
    const data = JSON.parse(raw)
    return {
      password: data.password ?? '',
      passwordHint: data.passwordHint ?? '',
      isPasswordSet: data.isPasswordSet ?? false,
      requireLogin: data.requireLogin ?? false,
    }
  } catch {
    return { password: '', passwordHint: '', isPasswordSet: false, requireLogin: false }
  }
}

function saveToStorage(state: { password: string; passwordHint: string; isPasswordSet: boolean; requireLogin: boolean }) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

const useAuthStore = create<AuthState>((set, get) => {
  const stored = loadFromStorage()

  return {
    password: stored.password,
    passwordHint: stored.passwordHint,
    isPasswordSet: stored.isPasswordSet,
    requireLogin: stored.requireLogin,

    setPassword: (newPassword: string) => {
      const encoded = encodePassword(newPassword)
      const newState = {
        password: encoded,
        isPasswordSet: true,
        requireLogin: true,
      }
      const current = get()
      const toSave = {
        password: newState.password,
        passwordHint: current.passwordHint,
        isPasswordSet: newState.isPasswordSet,
        requireLogin: newState.requireLogin,
      }
      saveToStorage(toSave)
      set(newState)
    },

    setPasswordHint: (hint: string) => {
      const current = get()
      const toSave = {
        password: current.password,
        passwordHint: hint,
        isPasswordSet: current.isPasswordSet,
        requireLogin: current.requireLogin,
      }
      saveToStorage(toSave)
      set({ passwordHint: hint })
    },

    authenticate: (inputPassword: string): boolean => {
      const { password } = get()
      const decoded = decodePassword(password)
      return inputPassword === decoded
    },

    removePassword: () => {
      const current = get()
      const toSave = {
        password: '',
        passwordHint: '',
        isPasswordSet: false,
        requireLogin: false,
      }
      saveToStorage(toSave)
      set({ password: '', passwordHint: '', isPasswordSet: false, requireLogin: false })
    },

    setRequireLogin: (value: boolean) => {
      const current = get()
      const toSave = {
        password: current.password,
        passwordHint: current.passwordHint,
        isPasswordSet: current.isPasswordSet,
        requireLogin: value,
      }
      saveToStorage(toSave)
      set({ requireLogin: value })
    },
  }
})

export default useAuthStore
