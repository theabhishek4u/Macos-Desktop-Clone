'use client'

import { useCallback, type CSSProperties } from 'react'
import useMacOSStore, { ContextMenuItem } from '@/store/macos-store'
import useDarkModeStore from '@/store/dark-mode-store'

export interface Wallpaper {
  name: string
  style: CSSProperties
}

const WALLPAPERS: Wallpaper[] = [
  // 1. Sonoma — Rolling hills in warm orange/golden tones
  {
    name: 'Sonoma',
    style: {
      background: [
        'radial-gradient(ellipse 120% 60% at 50% 100%, #d4a24e 0%, #c4883a 20%, #a06a2a 40%, transparent 70%)',
        'radial-gradient(ellipse 80% 40% at 30% 95%, #e8b84d 0%, #cc8c2e 50%, transparent 80%)',
        'radial-gradient(ellipse 80% 40% at 75% 98%, #d9a040 0%, #b87d2a 50%, transparent 80%)',
        'radial-gradient(ellipse 100% 50% at 50% 60%, #6b3a1f 0%, #4a2512 40%, transparent 80%)',
        'radial-gradient(ellipse 60% 30% at 20% 80%, #e6c86e 0%, transparent 60%)',
        'radial-gradient(ellipse 60% 30% at 80% 85%, #d4a24e 0%, transparent 60%)',
        'linear-gradient(180deg, #1a0a2e 0%, #2d1548 15%, #6b2f4a 30%, #a84832 50%, #cc7a2e 65%, #d4a24e 80%, #e8c86e 100%)',
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
]

export default function Desktop({ children }: { children: React.ReactNode }) {
  const { setContextMenu, wallpaperIndex, setWallpaperIndex } = useMacOSStore()
  const { isDarkMode } = useDarkModeStore()

  // When dark mode is on, use the Dark Mode wallpaper (index 5) regardless of user selection
  const effectiveWallpaperIndex = isDarkMode ? 5 : wallpaperIndex

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const items: ContextMenuItem[] = [
      { label: 'New Folder', shortcut: '⇧⌘N' },
      { label: 'Get Info', shortcut: '⌘I' },
      { separator: true, label: '' },
      {
        label: 'Change Wallpaper',
        action: () => setWallpaperIndex((wallpaperIndex + 1) % WALLPAPERS.length),
      },
      { separator: true, label: '' },
      { label: 'Use Stacks', disabled: true },
      { label: 'Sort By', disabled: true },
      { label: 'Clean Up', disabled: true },
      { separator: true, label: '' },
      { label: 'Show View Options', shortcut: '⌘J' },
    ]
    setContextMenu({ x: e.clientX, y: e.clientY, items })
  }, [setContextMenu, wallpaperIndex, setWallpaperIndex])

  return (
    <div
      className={`fixed inset-0 overflow-hidden select-none ${isDarkMode ? 'dark-mode-active' : ''}`}
      style={{ ...WALLPAPERS[effectiveWallpaperIndex].style, transition: 'background 0.8s ease-in-out' }}
      onContextMenu={handleContextMenu}
    >
      {/* Animated gradient overlay for subtle shimmer effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 animate-wallpaper-shimmer"
        style={{
          background: [
            'radial-gradient(ellipse 40% 30% at 30% 40%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 30% at 70% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      {children}
    </div>
  )
}

export { WALLPAPERS }
