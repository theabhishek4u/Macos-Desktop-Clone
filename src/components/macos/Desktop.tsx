'use client'

import { useCallback } from 'react'
import useMacOSStore, { ContextMenuItem } from '@/store/macos-store'

const WALLPAPERS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 30%, #2d1b69 70%, #4a1942 100%)',
  'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
  'linear-gradient(135deg, #000428 0%, #004e92 100%)',
  'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
  'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
]

export default function Desktop({ children }: { children: React.ReactNode }) {
  const { setContextMenu, wallpaperIndex, setWallpaperIndex } = useMacOSStore()

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
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: WALLPAPERS[wallpaperIndex] }}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  )
}

export { WALLPAPERS }
