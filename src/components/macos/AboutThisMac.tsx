'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Shared about dialog state (module-level) ---
interface AboutState {
  isOpen: boolean
}

const aboutState: AboutState = { isOpen: false }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useAboutThisMac() {
  const [isOpen, setIsOpen] = useState(aboutState.isOpen)

  useEffect(() => {
    const listener = () => setIsOpen(aboutState.isOpen)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const open = useCallback(() => {
    aboutState.isOpen = true
    emitChange()
  }, [])

  const close = useCallback(() => {
    aboutState.isOpen = false
    emitChange()
  }, [])

  return { isOpen, open, close }
}

export default function AboutThisMac() {
  const { isOpen, close } = useAboutThisMac()

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aboutState.isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[99998] bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="pointer-events-auto w-[540px] rounded-xl overflow-hidden select-none"
              style={{
                boxShadow: '0 0 0 0.5px rgba(0,0,0,0.1), 0 22px 70px 4px rgba(0,0,0,0.35)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sonoma wallpaper gradient background */}
              <div
                className="relative flex flex-col"
                style={{
                  background: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b69 15%, #5b2c8e 30%, #8b3a8e 45%, #c25477 60%, #e87d5f 75%, #f4a261 88%, #f9c74f 100%)',
                }}
              >
                {/* Close button - overlay on gradient */}
                <div className="absolute top-2.5 left-3 z-10">
                  <button
                    onClick={close}
                    className="w-[14px] h-[14px] rounded-full bg-white/30 hover:bg-white/50 transition-colors flex items-center justify-center group"
                    aria-label="Close"
                  >
                    <svg
                      className="w-[6px] h-[6px] opacity-0 group-hover:opacity-100 text-white transition-opacity"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                  </button>
                </div>

                {/* macOS branding area - large, like real About This Mac */}
                <div className="flex flex-col items-center pt-8 pb-6">
                  {/* Apple logo - larger, white */}
                  <svg
                    className="w-20 h-20 mb-4 text-white"
                    viewBox="0 0 170 170"
                    fill="currentColor"
                  >
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.75-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.04 3.69-6.27 8.6-11.23 14.76-14.88 6.15-3.65 12.8-5.51 19.97-5.63 3.92 0 9.06 1.21 15.43 3.6 6.36 2.4 10.44 3.62 12.24 3.62 1.34 0 5.87-1.43 13.56-4.28 7.27-2.64 13.41-3.74 18.44-3.32 13.63 1.1 23.87 6.47 30.68 16.15-12.2 7.39-18.22 17.73-18.1 31 0.12 10.33 3.86 18.93 11.19 25.77 3.33 3.17 7.05 5.62 11.18 7.37-.9 2.6-1.84 5.09-2.85 7.47zM119.1 7.01c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37a25.2 25.2 0 0 1-.19-3.07c0-7.78 3.39-16.1 9.4-22.9 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.75.13 1.11.17 2.22.17 3.28z" />
                  </svg>

                  {/* macOS Sonoma text */}
                  <h2 className="text-[28px] font-semibold text-white tracking-tight">
                    macOS Sonoma
                  </h2>
                  <p className="text-[14px] text-white/70 mt-1">Version 14.5</p>
                </div>
              </div>

              {/* Info section - light background */}
              <div className="bg-[#f5f5f7] px-6 pt-5 pb-4">
                {/* MacBook Pro */}
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-6 h-6 text-[#555]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                    <line x1="8" y1="17" x2="8" y2="20" />
                    <line x1="16" y1="17" x2="16" y2="20" />
                  </svg>
                  <span className="text-[14px] font-medium text-[#1d1d1f]">MacBook Pro</span>
                </div>

                {/* Spec grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#86868b] uppercase tracking-wide">Chip</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">Apple M3 Pro</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#86868b] uppercase tracking-wide">Memory</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">18 GB</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#86868b] uppercase tracking-wide">Serial Number</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">C02ZXXXXXX</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#86868b] uppercase tracking-wide">macOS</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">Sonoma 14.5</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/8" />

              {/* Buttons */}
              <div className="bg-[#f5f5f7] flex items-center justify-between px-6 py-3.5 rounded-b-xl">
                <button
                  className="text-[12px] text-[#0060df] hover:text-[#0040b0] transition-colors font-medium"
                  onClick={() => {
                    /* System Report placeholder */
                  }}
                >
                  System Report...
                </button>
                <button
                  className="text-[12px] text-[#0060df] hover:text-[#0040b0] transition-colors font-medium"
                  onClick={() => {
                    /* Software Update placeholder */
                  }}
                >
                  Software Update...
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
