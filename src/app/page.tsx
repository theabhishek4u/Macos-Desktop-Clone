'use client'

import dynamic from 'next/dynamic'
import useMacOSStore from '@/store/macos-store'

// Dynamic imports to avoid SSR issues
const Desktop = dynamic(() => import('@/components/macos/Desktop'), { ssr: false })
const MenuBar = dynamic(() => import('@/components/macos/MenuBar'), { ssr: false })
const Dock = dynamic(() => import('@/components/macos/Dock'), { ssr: false })
const Window = dynamic(() => import('@/components/macos/Window'), { ssr: false })
const ContextMenu = dynamic(() => import('@/components/macos/ContextMenu'), { ssr: false })

const Finder = dynamic(() => import('@/components/macos/apps/Finder'), { ssr: false })
const Calculator = dynamic(() => import('@/components/macos/apps/Calculator'), { ssr: false })
const Notes = dynamic(() => import('@/components/macos/apps/Notes'), { ssr: false })
const Terminal = dynamic(() => import('@/components/macos/apps/Terminal'), { ssr: false })
const CalendarApp = dynamic(() => import('@/components/macos/apps/Calendar'), { ssr: false })
const Safari = dynamic(() => import('@/components/macos/apps/Safari'), { ssr: false })
const SystemPreferences = dynamic(() => import('@/components/macos/apps/SystemPreferences'), { ssr: false })
const Clock = dynamic(() => import('@/components/macos/apps/Clock'), { ssr: false })
const Photos = dynamic(() => import('@/components/macos/apps/Photos'), { ssr: false })
const Music = dynamic(() => import('@/components/macos/apps/Music'), { ssr: false })
const TextEdit = dynamic(() => import('@/components/macos/apps/TextEdit'), { ssr: false })
const Weather = dynamic(() => import('@/components/macos/apps/Weather'), { ssr: false })

const APP_COMPONENTS: Record<string, React.ComponentType> = {
  finder: Finder,
  calculator: Calculator,
  notes: Notes,
  terminal: Terminal,
  calendar: CalendarApp,
  safari: Safari,
  settings: SystemPreferences,
  clock: Clock,
  photos: Photos,
  music: Music,
  textedit: TextEdit,
  weather: Weather,
}

export default function MacOSDesktop() {
  const { windows } = useMacOSStore()

  return (
    <Desktop>
      <MenuBar />
      {windows.map(win => {
        const AppComponent = APP_COMPONENTS[win.appId]
        if (!AppComponent) return null
        return (
          <Window key={win.id} windowId={win.id}>
            <AppComponent />
          </Window>
        )
      })}
      <Dock />
      <ContextMenu />
    </Desktop>
  )
}
