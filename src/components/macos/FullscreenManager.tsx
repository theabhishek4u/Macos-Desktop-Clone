'use client'

import { useEffect, useCallback } from 'react'
import useFullscreenStore from '@/store/fullscreen-store'
import { useLoginScreen } from '@/components/macos/LoginScreen'

export default function FullscreenManager() {
  const setFullscreen = useFullscreenStore((s) => s.setFullscreen)
  const isSupported = useFullscreenStore((s) => s.isSupported)
  const enterFullscreen = useFullscreenStore((s) => s.enterFullscreen)
  const { isLoggedIn } = useLoginScreen()

  // Listen for fullscreen changes
  useEffect(() => {
    if (!isSupported) return

    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isSupported, setFullscreen])

  // Auto-enter fullscreen after login (requires user gesture context)
  // We use a one-time click listener on the document
  useEffect(() => {
    if (!isSupported || !isLoggedIn) return

    let hasEntered = false

    const handleFirstInteraction = async () => {
      if (hasEntered) return
      hasEntered = true

      // Only enter fullscreen if not already in fullscreen
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen()
        } catch {
          // Silently fail — user may have blocked fullscreen
        }
      }

      // Remove listener after first successful attempt
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    // Listen for the first user interaction after login
    document.addEventListener('click', handleFirstInteraction, { once: false })
    document.addEventListener('keydown', handleFirstInteraction, { once: false })

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [isSupported, isLoggedIn, enterFullscreen])

  // Expose fullscreen toggle globally for keyboard shortcuts
  useEffect(() => {
    ;(window as unknown as Record<string, () => void>).__macOSFullscreenToggle = useFullscreenStore.getState().toggleFullscreen
    ;(window as unknown as Record<string, () => void>).__macOSFullscreenEnter = useFullscreenStore.getState().enterFullscreen
    ;(window as unknown as Record<string, () => void>).__macOSFullscreenExit = useFullscreenStore.getState().exitFullscreen

    return () => {
      delete (window as unknown as Record<string, () => void>).__macOSFullscreenToggle
      delete (window as unknown as Record<string, () => void>).__macOSFullscreenEnter
      delete (window as unknown as Record<string, () => void>).__macOSFullscreenExit
    }
  }, [])

  return null // This component has no UI — it only manages fullscreen state
}
