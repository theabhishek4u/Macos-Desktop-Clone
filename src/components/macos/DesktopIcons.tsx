'use client'

import { useState, useCallback } from 'react'
import useMacOSStore from '@/store/macos-store'

interface DesktopIcon {
  id: string
  name: string
  emoji: string
  appId: string
}

const DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'macintosh-hd', name: 'Macintosh HD', emoji: '💾', appId: 'finder' },
  { id: 'documents', name: 'Documents', emoji: '📂', appId: 'finder' },
  { id: 'downloads', name: 'Downloads', emoji: '📥', appId: 'finder' },
]

export default function DesktopIcons() {
  const { openApp } = useMacOSStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleDoubleClick = useCallback(
    (appId: string) => {
      openApp(appId)
    },
    [openApp]
  )

  return (
    <div className="absolute top-[40px] right-[16px] flex flex-col items-end gap-2 z-10">
      {DESKTOP_ICONS.map(icon => (
        <div
          key={icon.id}
          className="flex flex-col items-center justify-center w-[80px] h-[80px] rounded-lg cursor-default select-none transition-colors"
          style={{
            background:
              hoveredId === icon.id
                ? 'rgba(255, 255, 255, 0.12)'
                : 'transparent',
          }}
          onMouseEnter={() => setHoveredId(icon.id)}
          onMouseLeave={() => setHoveredId(null)}
          onDoubleClick={() => handleDoubleClick(icon.appId)}
        >
          <span className="text-3xl leading-none mb-1">{icon.emoji}</span>
          <span className="text-[11px] text-white/80 text-center leading-tight font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {icon.name}
          </span>
        </div>
      ))}
    </div>
  )
}
