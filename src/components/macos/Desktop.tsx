'use client'

import { useState, useCallback, useEffect, useRef, type CSSProperties } from 'react'
import useMacOSStore, { ContextMenuItem } from '@/store/macos-store'
import useDarkModeStore from '@/store/dark-mode-store'

export interface Wallpaper {
  name: string
  style: CSSProperties
  overlayStyle?: CSSProperties
}

const WALLPAPERS: Wallpaper[] = [
  // 1. Sonoma — Rolling hills in warm orange/golden tones (ENHANCED)
  {
    name: 'Sonoma',
    style: {
      background: [
        // Sun/light source glow in upper area — multiple layers for soft falloff
        'radial-gradient(ellipse 50% 28% at 50% 18%, rgba(255,210,120,0.45) 0%, rgba(255,180,80,0.2) 35%, rgba(255,140,40,0.08) 60%, transparent 80%)',
        // Upper atmospheric haze — warm light scattering
        'radial-gradient(ellipse 100% 22% at 50% 28%, rgba(220,160,90,0.18) 0%, rgba(200,140,70,0.08) 50%, transparent 80%)',
        // Cloud wisps catching light
        'radial-gradient(ellipse 35% 3% at 30% 20%, rgba(255,200,140,0.15) 0%, transparent 80%)',
        'radial-gradient(ellipse 25% 2.5% at 65% 24%, rgba(255,190,120,0.12) 0%, transparent 80%)',
        // Distant hills (lighter, haze-covered) — multiple overlapping for natural shapes
        'radial-gradient(ellipse 130% 14% at 35% 51%, rgba(195,145,85,0.55) 0%, rgba(175,125,70,0.35) 50%, rgba(160,110,60,0.15) 80%, transparent 100%)',
        'radial-gradient(ellipse 110% 11% at 60% 53%, rgba(185,135,78,0.45) 0%, rgba(165,115,65,0.25) 55%, transparent 85%)',
        'radial-gradient(ellipse 90% 10% at 80% 55%, rgba(175,125,72,0.35) 0%, rgba(155,105,58,0.18) 50%, transparent 80%)',
        // Mid-ground hills (richer, more saturated color)
        'radial-gradient(ellipse 115% 17% at 28% 62%, #d8a850 0%, #c89842 25%, #b08535 50%, #9a7228 75%, transparent 100%)',
        'radial-gradient(ellipse 95% 18% at 72% 64%, #d09848 0%, #c08a3a 25%, #a87830 50%, #906525 75%, transparent 100%)',
        'radial-gradient(ellipse 70% 12% at 50% 66%, rgba(200,150,70,0.3) 0%, transparent 70%)',
        // Foreground rolling hills (darkest, most saturated)
        'radial-gradient(ellipse 140% 24% at 42% 84%, #be8530 0%, #a47022 20%, #8a5e1a 45%, #6a4812 70%, transparent 100%)',
        'radial-gradient(ellipse 100% 18% at 22% 89%, #aa7828 0%, #8e6218 30%, #725010 55%, transparent 80%)',
        'radial-gradient(ellipse 105% 16% at 78% 91%, #b47a28 0%, #966418 30%, #785010 55%, transparent 80%)',
        // Very foreground — deepest green-brown
        'radial-gradient(ellipse 150% 14% at 50% 100%, #5a3a10 0%, #48300a 40%, #3a2506 70%, transparent 100%)',
        // Sky gradient — deeper, more nuanced color transitions
        'linear-gradient(180deg, #0a0418 0%, #120828 4%, #1c0c38 8%, #2a1250 13%, #3c1a60 18%, #582458 23%, #7a3050 28%, #983842 33%, #b84830 38%, #d46020 43%, #e07828 47%, #e89438 51%, #e8ac50 55%, #e0b858 59%, #d0a048 64%, #b88838 70%, #9a7028 76%, #7a5818 82%, #5a4010 89%, #3a2a08 95%, #201808 100%)',
      ].join(', '),
    },
    overlayStyle: {
      // Atmospheric haze effect near the horizon
      background: [
        'linear-gradient(180deg, transparent 0%, transparent 44%, rgba(220,180,110,0.06) 48%, rgba(210,170,100,0.04) 52%, rgba(220,180,110,0.02) 56%, transparent 60%)',
      ].join(', '),
    },
  },

  // 2. Sequoia — Deep forest greens and teals with subtle warm highlights
  {
    name: 'Sequoia',
    style: {
      background: [
        'radial-gradient(ellipse 80% 50% at 50% 90%, #1a4a2e 0%, #0d3320 40%, transparent 70%)',
        'radial-gradient(ellipse 60% 40% at 25% 85%, #2d6b3f 0%, transparent 60%)',
        'radial-gradient(ellipse 60% 40% at 80% 88%, #1f5c35 0%, transparent 60%)',
        'radial-gradient(ellipse 100% 40% at 50% 50%, #0a2e1a 0%, transparent 70%)',
        'radial-gradient(ellipse 40% 20% at 70% 40%, #3d8b5a 0%, transparent 60%)',
        'radial-gradient(ellipse 30% 15% at 30% 45%, #2a7a4a 0%, transparent 50%)',
        'linear-gradient(180deg, #040d08 0%, #0a1f12 20%, #0d3320 40%, #1a4a2e 60%, #2d6b3f 80%, #4a8a5e 100%)',
      ].join(', '),
    },
  },

  // 3. Ventura — Ocean blues with golden horizon light
  {
    name: 'Ventura',
    style: {
      background: [
        'radial-gradient(ellipse 100% 30% at 50% 55%, #e8c86e 0%, #cc9a3a 30%, transparent 60%)',
        'radial-gradient(ellipse 120% 20% at 50% 58%, #d4a24e 0%, transparent 50%)',
        'radial-gradient(ellipse 80% 50% at 50% 100%, #0a2a4a 0%, #0d3a5e 30%, transparent 60%)',
        'radial-gradient(ellipse 60% 30% at 30% 80%, #1a5a8a 0%, transparent 60%)',
        'radial-gradient(ellipse 60% 30% at 70% 85%, #0d4a7a 0%, transparent 60%)',
        'linear-gradient(180deg, #0a1a3a 0%, #0d2a5a 25%, #1a4a7a 40%, #3a7aaa 52%, #cc9a3a 56%, #e8c86e 60%, #1a5a8a 70%, #0d3a5e 85%, #0a2a4a 100%)',
      ].join(', '),
    },
  },

  // 4. Monterey — Deep purple to blue gradient with subtle glow
  {
    name: 'Monterey',
    style: {
      background: [
        'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(120, 80, 200, 0.4) 0%, transparent 70%)',
        'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(80, 60, 180, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse 80% 50% at 70% 60%, rgba(60, 80, 200, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse 40% 30% at 50% 30%, rgba(160, 120, 220, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse 50% 25% at 20% 70%, rgba(40, 50, 160, 0.4) 0%, transparent 60%)',
        'radial-gradient(ellipse 50% 25% at 80% 30%, rgba(100, 60, 180, 0.4) 0%, transparent 60%)',
        'linear-gradient(135deg, #0d0a2a 0%, #1a1050 20%, #2d1b6e 40%, #4a2d8a 55%, #3a2090 65%, #1a1a6e 80%, #0d0a4a 100%)',
      ].join(', '),
    },
  },

  // 5. Big Sur — Multicolor gradient (purple, orange, blue)
  {
    name: 'Big Sur',
    style: {
      background: [
        'radial-gradient(ellipse 80% 50% at 20% 80%, #e8783a 0%, #cc5a2e 30%, transparent 60%)',
        'radial-gradient(ellipse 80% 50% at 80% 80%, #4a6ae8 0%, #3a5acc 30%, transparent 60%)',
        'radial-gradient(ellipse 100% 40% at 50% 50%, #8a3ae8 0%, #6a2acc 40%, transparent 70%)',
        'radial-gradient(ellipse 60% 30% at 35% 60%, #cc5a8a 0%, transparent 50%)',
        'radial-gradient(ellipse 60% 30% at 65% 55%, #5a7aee 0%, transparent 50%)',
        'radial-gradient(ellipse 40% 20% at 50% 40%, #aa4ae8 0%, transparent 50%)',
        'linear-gradient(180deg, #1a0a3a 0%, #2d1568 15%, #4a1a8a 30%, #7a2aae 42%, #cc5a3a 55%, #e8783a 65%, #4a6ae8 78%, #2a4acc 90%, #1a2a8a 100%)',
      ].join(', '),
    },
  },

  // 6. Dark Mode — Very dark with subtle purple/blue undertones
  {
    name: 'Dark Mode',
    style: {
      background: [
        'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(40, 30, 80, 0.5) 0%, transparent 70%)',
        'radial-gradient(ellipse 80% 50% at 30% 60%, rgba(30, 40, 80, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse 80% 50% at 70% 40%, rgba(50, 30, 70, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse 40% 30% at 50% 80%, rgba(20, 30, 60, 0.4) 0%, transparent 60%)',
        'radial-gradient(ellipse 30% 20% at 80% 70%, rgba(40, 20, 60, 0.3) 0%, transparent 50%)',
        'linear-gradient(180deg, #0a0a12 0%, #0d0d1a 30%, #12121f 50%, #0f0f1a 70%, #0a0a14 100%)',
      ].join(', '),
    },
  },

  // 7. Sunset — Warm orange/red/pink gradient
  {
    name: 'Sunset',
    style: {
      background: [
        'radial-gradient(ellipse 80% 40% at 50% 60%, #e84a3a 0%, #cc3a2e 30%, transparent 60%)',
        'radial-gradient(ellipse 60% 30% at 30% 50%, #e87a5a 0%, transparent 50%)',
        'radial-gradient(ellipse 60% 30% at 70% 55%, #cc5a4a 0%, transparent 50%)',
        'radial-gradient(ellipse 100% 30% at 50% 40%, #e8aa6e 0%, transparent 50%)',
        'radial-gradient(ellipse 50% 25% at 20% 35%, #d46a8a 0%, transparent 50%)',
        'radial-gradient(ellipse 50% 25% at 80% 30%, #e8a070 0%, transparent 50%)',
        'linear-gradient(180deg, #1a0a2a 0%, #3a1a3e 15%, #8a2a4a 30%, #cc4a3a 45%, #e87a4a 55%, #e8aa6e 65%, #d46a8a 75%, #8a3a6a 88%, #3a1a3e 100%)',
      ].join(', '),
    },
  },

  // 8. Aurora — Northern lights effect with greens and purples
  {
    name: 'Aurora',
    style: {
      background: [
        'radial-gradient(ellipse 120% 30% at 30% 40%, rgba(80, 220, 120, 0.5) 0%, rgba(40, 180, 100, 0.3) 40%, transparent 70%)',
        'radial-gradient(ellipse 100% 25% at 60% 35%, rgba(100, 200, 180, 0.4) 0%, transparent 60%)',
        'radial-gradient(ellipse 80% 30% at 70% 50%, rgba(80, 120, 220, 0.4) 0%, rgba(120, 80, 200, 0.3) 40%, transparent 70%)',
        'radial-gradient(ellipse 60% 20% at 40% 30%, rgba(120, 240, 160, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse 50% 25% at 80% 45%, rgba(140, 80, 220, 0.3) 0%, transparent 50%)',
        'radial-gradient(ellipse 40% 15% at 20% 50%, rgba(60, 200, 140, 0.3) 0%, transparent 50%)',
        'linear-gradient(180deg, #020810 0%, #040d1a 20%, #061a2a 35%, #0a2a3a 50%, #0d1a2a 65%, #0a0d2a 80%, #050818 100%)',
      ].join(', '),
    },
  },

  // 9. Ocean — Deep teal to dark blue
  {
    name: 'Ocean',
    style: {
      background: [
        'radial-gradient(ellipse 80% 50% at 50% 80%, #0d6a6a 0%, #0a5a5e 30%, transparent 60%)',
        'radial-gradient(ellipse 60% 40% at 30% 70%, #1a8a7a 0%, transparent 50%)',
        'radial-gradient(ellipse 60% 40% at 70% 75%, #0d7a8a 0%, transparent 50%)',
        'radial-gradient(ellipse 100% 40% at 50% 40%, #0a3a5a 0%, transparent 60%)',
        'radial-gradient(ellipse 40% 20% at 50% 60%, #1a9a9a 0%, transparent 50%)',
        'radial-gradient(ellipse 30% 15% at 20% 50%, #0d5a7a 0%, transparent 50%)',
        'linear-gradient(180deg, #020a14 0%, #041424 20%, #0a2a4a 40%, #0d4a5e 55%, #0d6a6a 70%, #1a8a7a 85%, #2aaa8a 100%)',
      ].join(', '),
    },
  },

  // 10. Minimal — Subtle gradient from dark gray to slightly lighter
  {
    name: 'Minimal',
    style: {
      background: [
        'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(40, 40, 50, 0.4) 0%, transparent 70%)',
        'radial-gradient(ellipse 60% 40% at 30% 60%, rgba(35, 35, 45, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse 60% 40% at 70% 40%, rgba(45, 45, 55, 0.3) 0%, transparent 60%)',
        'linear-gradient(180deg, #1a1a20 0%, #20202a 25%, #28282f 50%, #24242c 75%, #1e1e24 100%)',
      ].join(', '),
    },
  },

  // 11. Sonoma Photo — A more photo-realistic Sonoma landscape wallpaper
  {
    name: 'Sonoma Photo',
    style: {
      background: [
        // Bright sun near horizon
        'radial-gradient(ellipse 15% 12% at 50% 48%, rgba(255,240,180,0.8) 0%, rgba(255,200,100,0.4) 30%, transparent 70%)',
        // Sun glow spread
        'radial-gradient(ellipse 40% 20% at 50% 48%, rgba(255,180,80,0.3) 0%, rgba(255,140,40,0.1) 50%, transparent 80%)',
        // Cloud wisps in upper sky
        'radial-gradient(ellipse 30% 3% at 25% 18%, rgba(100,60,120,0.3) 0%, transparent 80%)',
        'radial-gradient(ellipse 25% 2% at 70% 15%, rgba(80,50,110,0.25) 0%, transparent 80%)',
        'radial-gradient(ellipse 20% 2.5% at 40% 22%, rgba(120,70,100,0.2) 0%, transparent 80%)',
        // Distant mountain silhouettes
        'radial-gradient(ellipse 100% 10% at 30% 55%, rgba(40,20,50,0.6) 0%, rgba(30,15,40,0.4) 60%, transparent 100%)',
        'radial-gradient(ellipse 80% 8% at 65% 56%, rgba(35,18,45,0.5) 0%, rgba(25,12,35,0.3) 60%, transparent 100%)',
        // Mid-ground hills — warm golden-green
        'radial-gradient(ellipse 130% 15% at 35% 68%, #8a7a30 0%, #6a6020 40%, #4a4015 70%, transparent 100%)',
        'radial-gradient(ellipse 110% 12% at 70% 70%, #7a6a28 0%, #5a5018 40%, #3a3510 70%, transparent 100%)',
        // Foreground green rolling hills
        'radial-gradient(ellipse 150% 20% at 45% 88%, #2a4a20 0%, #1a3015 40%, #0f200a 70%, transparent 100%)',
        'radial-gradient(ellipse 120% 18% at 20% 92%, #254818 0%, #1a3510 40%, transparent 80%)',
        'radial-gradient(ellipse 130% 16% at 78% 90%, #2a4a20 0%, #1a3510 40%, transparent 80%)',
        // Very foreground — darkest green
        'radial-gradient(ellipse 160% 12% at 50% 100%, #0f1a08 0%, #0a1205 50%, transparent 100%)',
        // Sky gradient — dark purple top through sunset colors to green bottom
        'linear-gradient(180deg, #0a0520 0%, #1a0a30 8%, #2d1048 14%, #4a1860 20%, #6a2050 26%, #8a2838 32%, #b03a20 38%, #d4500a 43%, #e87830 48%, #f0a050 52%, #e0a040 56%, #c08830 62%, #8a7a28 70%, #5a6020 78%, #3a4a18 85%, #2a3a10 92%, #1a2a08 100%)',
      ].join(', '),
    },
    overlayStyle: {
      // Atmospheric haze near horizon
      background: [
        'linear-gradient(180deg, transparent 0%, transparent 42%, rgba(240,180,100,0.04) 47%, rgba(240,160,80,0.03) 50%, rgba(240,180,100,0.02) 53%, transparent 58%)',
      ].join(', '),
    },
  },
]

export default function Desktop({ children }: { children: React.ReactNode }) {
  const { setContextMenu, wallpaperIndex, setWallpaperIndex } = useMacOSStore()
  const { isDarkMode } = useDarkModeStore()

  // When dark mode is on, use the Dark Mode wallpaper (index 5) regardless of user selection
  const effectiveWallpaperIndex = isDarkMode ? 5 : wallpaperIndex

  // Cross-fade state: track previous and current wallpaper layers
  const [prevWallpaperIndex, setPrevWallpaperIndex] = useState(effectiveWallpaperIndex)
  const [currentWallpaperIndex, setCurrentWallpaperIndex] = useState(effectiveWallpaperIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Wallpaper name display
  const [showWallpaperName, setShowWallpaperName] = useState(false)
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Adjust state during rendering (React recommended pattern for derived state)
  // This avoids the lint error from calling setState inside useEffect
  if (effectiveWallpaperIndex !== currentWallpaperIndex) {
    setPrevWallpaperIndex(currentWallpaperIndex)
    setCurrentWallpaperIndex(effectiveWallpaperIndex)
    setIsTransitioning(true)
    setShowWallpaperName(true)
  }

  // Handle transition timers in effect (side effects only)
  useEffect(() => {
    if (!isTransitioning) return

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current)

    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false)
    }, 800)

    nameTimerRef.current = setTimeout(() => {
      setShowWallpaperName(false)
    }, 2000)

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current)
    }
  }, [isTransitioning])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    // Build wallpaper submenu items
    const wallpaperItems: ContextMenuItem[] = WALLPAPERS.map((wp, idx) => ({
      label: wp.name,
      action: () => setWallpaperIndex(idx),
    }))

    // Build sort submenu items
    const sortItems: ContextMenuItem[] = [
      { label: 'Name' },
      { label: 'Kind' },
      { label: 'Date Modified' },
      { label: 'Size' },
    ]

    const items: ContextMenuItem[] = [
      { label: 'New Folder', shortcut: '⇧⌘N' },
      { label: 'Get Info', shortcut: '⌘I' },
      { separator: true, label: '' },
      {
        label: 'Change Desktop Background...',
        submenu: wallpaperItems,
      },
      { separator: true, label: '' },
      { label: 'Use Stacks', disabled: true },
      {
        label: 'Sort By',
        submenu: sortItems,
      },
      { label: 'Clean Up', disabled: true },
      { separator: true, label: '' },
      { label: 'Show View Options', shortcut: '⌘J' },
    ]
    setContextMenu({ x: e.clientX, y: e.clientY, items })
  }, [setContextMenu, setWallpaperIndex])

  const prevWallpaper = WALLPAPERS[prevWallpaperIndex]
  const currentWallpaper = WALLPAPERS[currentWallpaperIndex]

  return (
    <div
      className={`fixed inset-0 overflow-hidden select-none ${isDarkMode ? 'dark-mode-active' : ''}`}
      onContextMenu={handleContextMenu}
    >
      {/* Previous wallpaper layer (fades out during transition) */}
      <div
        className="absolute inset-0"
        style={{
          ...prevWallpaper.style,
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out',
        }}
      />

      {/* Current wallpaper layer (fades in during transition) */}
      <div
        className="absolute inset-0"
        style={{
          ...currentWallpaper.style,
          opacity: isTransitioning ? 1 : 1,
          transition: 'opacity 0.8s ease-in-out',
        }}
      />

      {/* Vignette overlay — darken edges for cinematic look */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.4) 100%)',
          ].join(', '),
        }}
      />

      {/* Noise texture overlay for realism */}
      <div
        className="absolute inset-0 pointer-events-none animate-wallpaper-breathe"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
      {/* Animated gradient overlay for subtle shimmer effect */}
      <div
        className="absolute inset-0 pointer-events-none animate-wallpaper-shimmer"
        style={{
          background: [
            'radial-gradient(ellipse 40% 30% at 30% 40%, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 30% at 70% 60%, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      {/* Wallpaper-specific overlay (haze, atmospheric effects) */}
      {currentWallpaper.overlayStyle && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={currentWallpaper.overlayStyle}
        />
      )}
      {/* Slow breathing gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none animate-wallpaper-breathe"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)',
        }}
      />

      {/* Wallpaper name display — fades in/out */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
        style={{
          opacity: showWallpaperName ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        <div
          className="px-6 py-3 rounded-xl backdrop-blur-2xl"
          style={{
            background: 'rgba(0,0,0,0.55)',
            border: '0.5px solid rgba(255,255,255,0.12)',
          }}
        >
          <span
            className="text-white/90 text-lg font-medium tracking-wide"
            style={{
              font: "500 17px -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
            }}
          >
            {currentWallpaper.name}
          </span>
        </div>
      </div>

      {children}
    </div>
  )
}

export { WALLPAPERS }
