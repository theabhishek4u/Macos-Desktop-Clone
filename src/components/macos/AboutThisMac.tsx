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

// --- macOS Sonoma wallpaper gradient (high quality) ---
function SonomaWallpaper() {
  return (
    <div className="relative w-full h-[240px] overflow-hidden">
      {/* Base gradient — more vibrant Sonoma colors */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b69 10%, #5b2c8e 20%, #8b3a8e 30%, #c25477 42%, #e87d5f 55%, #f4a261 68%, #f9c74f 82%, #fce58a 100%)',
        }}
      />
      {/* Sun glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 65% 35%, rgba(255,230,160,0.25) 0%, transparent 60%)',
        }}
      />
      {/* Subtle light overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.12) 0%, transparent 55%)',
        }}
      />
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export default function AboutThisMac() {
  const { isOpen, close } = useAboutThisMac()
  const [showMoreInfo, setShowMoreInfo] = useState(false)

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
              className="pointer-events-auto w-[540px] rounded-2xl overflow-hidden select-none"
              style={{
                boxShadow: '0 0 0 0.5px rgba(0,0,0,0.12), 0 30px 90px 6px rgba(0,0,0,0.45), 0 10px 35px rgba(0,0,0,0.25)',
              }}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sonoma wallpaper background at top */}
              <div className="relative">
                <SonomaWallpaper />

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

                {/* macOS branding area - overlay on wallpaper */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Apple logo — refined */}
                  <svg
                    className="w-[56px] h-[56px] mb-2 text-white drop-shadow-lg"
                    viewBox="0 0 170 170"
                    fill="currentColor"
                  >
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.75-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.04 3.69-6.27 8.6-11.23 14.76-14.88 6.15-3.65 12.8-5.51 19.97-5.63 3.92 0 9.06 1.21 15.43 3.6 6.36 2.4 10.44 3.62 12.24 3.62 1.34 0 5.87-1.43 13.56-4.28 7.27-2.64 13.41-3.74 18.44-3.32 13.63 1.1 23.87 6.47 30.68 16.15-12.2 7.39-18.22 17.73-18.1 31 0.12 10.33 3.86 18.93 11.19 25.77 3.33 3.17 7.05 5.62 11.18 7.37-.9 2.6-1.84 5.09-2.85 7.47zM119.1 7.01c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37a25.2 25.2 0 0 1-.19-3.07c0-7.78 3.39-16.1 9.4-22.9 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.75.13 1.11.17 2.22.17 3.28z" />
                  </svg>

                  {/* macOS text */}
                  <h2 className="text-[24px] font-semibold text-white tracking-tight drop-shadow-md">
                    macOS Sonoma
                  </h2>
                  <p className="text-[12px] text-white/60 mt-0.5 font-medium">Version 14.4</p>
                </div>
              </div>

              {/* Info section - light background */}
              <div className="bg-[#f5f5f7] px-6 pt-4 pb-3">
                {/* MacBook Pro — realistic laptop icon */}
                <div className="flex items-center gap-2.5 mb-3">
                  <svg className="w-8 h-8 text-[#555]" viewBox="0 0 40 40" fill="none">
                    {/* Screen */}
                    <rect x="5" y="4" width="30" height="20" rx="2" fill="#333" />
                    <rect x="6.5" y="5.5" width="27" height="17" rx="1" fill="#1a1a2e" />
                    {/* Screen content — tiny desktop */}
                    <rect x="8" y="7" width="24" height="14" rx="0.5" fill="#2c1458" opacity="0.8" />
                    {/* Dock on screen */}
                    <rect x="12" y="18" width="16" height="2.5" rx="1" fill="rgba(255,255,255,0.15)" />
                    {/* Base/keyboard */}
                    <path d="M3 25h34c0.5 0 1 0.3 1 0.7v1.3H2v-1.3c0-0.4 0.4-0.7 1-0.7z" fill="#ccc" />
                    <path d="M1 27h38l-1.5 2H2.5L1 27z" fill="#bbb" />
                    {/* Notch indicator */}
                    <rect x="16" y="4" width="8" height="1.5" rx="0.75" fill="#1a1a2e" />
                  </svg>
                  <span className="text-[14px] font-semibold text-[#1d1d1f]">MacBook Pro</span>
                </div>

                {/* Spec grid - 2 columns */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Chip</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">Apple M3 Pro</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Memory</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">18 GB</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Serial Number</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f] font-mono text-[12px]">C02ZX1XXJHD2</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">macOS</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">Sonoma 14.4</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Build</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f] font-mono text-[12px]">23E224</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Startup Disk</span>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">Macintosh HD</span>
                  </div>
                </div>

                {/* More Info toggle */}
                <button
                  className="mt-3 text-[11px] text-[#007AFF] hover:text-[#0060df] transition-colors font-medium"
                  onClick={() => setShowMoreInfo(!showMoreInfo)}
                >
                  {showMoreInfo ? '▼ Less Info' : '▶ More Info...'}
                </button>

                {/* Expanded system info */}
                <AnimatePresence>
                  {showMoreInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t border-black/[0.06] mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Processor</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">12-Core CPU</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Graphics</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">18-Core GPU</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Neural Engine</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">16-Core</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Storage</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">512 GB SSD</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Display</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">14" Liquid Retina XDR</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Resolution</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">3024 × 1964</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Battery</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">72% — 14h remaining</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868b] uppercase tracking-wide font-medium">Uptime</span>
                          <span className="text-[13px] font-medium text-[#1d1d1f]">3 days, 7:42</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/[0.08]" />

              {/* Buttons */}
              <div className="bg-[#f5f5f7] flex items-center justify-between px-6 py-3.5 rounded-b-2xl">
                <button
                  className="text-[12px] text-[#007AFF] hover:text-[#0060df] transition-colors font-medium"
                  onClick={() => {
                    setShowMoreInfo(true)
                  }}
                >
                  System Information...
                </button>
                <button
                  className="text-[12px] text-[#007AFF] hover:text-[#0060df] transition-colors font-medium"
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
