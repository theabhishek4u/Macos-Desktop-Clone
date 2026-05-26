'use client'

import React, { useState } from 'react'
import useMacOSStore from '@/store/macos-store'
import useDarkModeStore from '@/store/dark-mode-store'
import { WALLPAPERS } from '@/components/macos/Desktop'
import {
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Battery,
  Volume2,
  Wifi,
  Bluetooth,
  Shield,
  Users,
  Bell,
  Layout,
  Palette,
  Image,
  HardDrive,
  Keyboard,
  Mouse,
  Printer,
  Globe,
  Accessibility,
  Timer,
  Lock,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ─── Types ───────────────────────────────────────────────────────────────────

type PaneId =
  | 'about'
  | 'general'
  | 'appearance'
  | 'desktop'
  | 'dock'
  | 'display'
  | 'battery'
  | 'sound'
  | 'notifications'
  | 'network'
  | 'bluetooth'
  | 'privacy'
  | 'users'
  | 'wallpaper'
  | 'storage'
  | 'keyboard'
  | 'mouse'
  | 'printers'
  | 'language'
  | 'accessibility'
  | 'datetime'
  | 'profiles'

interface PreferencePane {
  id: PaneId
  name: string
  color: string
  icon: React.ElementType
  category?: string
}

// ─── Pane definitions with categories ────────────────────────────────────────

const PREFERENCE_PANES: PreferencePane[] = [
  // Personal
  { id: 'general', name: 'General', color: 'bg-gray-500', icon: Palette, category: 'Personal' },
  { id: 'appearance', name: 'Appearance', color: 'bg-blue-500', icon: Sun, category: 'Personal' },
  { id: 'desktop', name: 'Desktop & Screen Saver', color: 'bg-purple-500', icon: Monitor, category: 'Personal' },
  { id: 'dock', name: 'Dock & Menu Bar', color: 'bg-slate-500', icon: Layout, category: 'Personal' },
  { id: 'notifications', name: 'Notifications', color: 'bg-red-500', icon: Bell, category: 'Personal' },
  // Hardware
  { id: 'display', name: 'Display', color: 'bg-sky-500', icon: Monitor, category: 'Hardware' },
  { id: 'sound', name: 'Sound', color: 'bg-rose-500', icon: Volume2, category: 'Hardware' },
  { id: 'battery', name: 'Battery', color: 'bg-green-500', icon: Battery, category: 'Hardware' },
  { id: 'keyboard', name: 'Keyboard', color: 'bg-gray-600', icon: Keyboard, category: 'Hardware' },
  { id: 'mouse', name: 'Mouse', color: 'bg-violet-500', icon: Mouse, category: 'Hardware' },
  { id: 'printers', name: 'Printers & Scanners', color: 'bg-gray-500', icon: Printer, category: 'Hardware' },
  { id: 'storage', name: 'Storage', color: 'bg-indigo-500', icon: HardDrive, category: 'Hardware' },
  // Internet & Wireless
  { id: 'network', name: 'Wi-Fi', color: 'bg-blue-600', icon: Wifi, category: 'Internet & Wireless' },
  { id: 'bluetooth', name: 'Bluetooth', color: 'bg-blue-400', icon: Bluetooth, category: 'Internet & Wireless' },
  // System
  { id: 'about', name: 'About This Mac', color: 'bg-gray-700', icon: Monitor, category: 'System' },
  { id: 'privacy', name: 'Privacy & Security', color: 'bg-blue-700', icon: Shield, category: 'System' },
  { id: 'users', name: 'Users & Groups', color: 'bg-cyan-600', icon: Users, category: 'System' },
  { id: 'language', name: 'Language & Region', color: 'bg-emerald-500', icon: Globe, category: 'System' },
  { id: 'accessibility', name: 'Accessibility', color: 'bg-blue-500', icon: Accessibility, category: 'System' },
  { id: 'datetime', name: 'Date & Time', color: 'bg-amber-500', icon: Timer, category: 'System' },
  { id: 'profiles', name: 'Profiles', color: 'bg-orange-500', icon: Lock, category: 'System' },
]

const PANE_CATEGORIES = ['Personal', 'Hardware', 'Internet & Wireless', 'System']

// ─── macOS-style toggle switch (custom, bigger than shadcn default) ──────────

function MacToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`pointer-events-none block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

// ─── Section helper ──────────────────────────────────────────────────────────

function SettingRow({
  label,
  children,
  description,
}: {
  label: string
  children: React.ReactNode
  description?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-[13px] text-gray-800 font-medium">{label}</div>
        {description && (
          <div className="text-[11px] text-gray-500 mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SettingSection({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      {title && (
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
          {title}
        </h3>
      )}
      <div className="bg-white/80 rounded-xl border border-gray-200/60 px-4 divide-y divide-gray-100">
        {React.Children.map(children, (child, i) => {
          // Remove the top divider from the first child and bottom from the last
          return child
        })}
      </div>
    </div>
  )
}

// ─── Detail Views ────────────────────────────────────────────────────────────

function GeneralPane() {
  const { isDarkMode, setDarkMode } = useDarkModeStore()
  const [accentColor, setAccentColor] = useState('blue')
  const [sidebarIconSize, setSidebarIconSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [showScrollBars, setShowScrollBars] = useState<'auto' | 'scrolling' | 'always'>('auto')
  const [closeWindowsWhenQuitting, setCloseWindowsWhenQuitting] = useState(false)
  const [allowWallpaperTinting, setAllowWallpaperTinting] = useState(true)

  const accentColors = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'purple', color: 'bg-purple-500' },
    { id: 'pink', color: 'bg-pink-500' },
    { id: 'red', color: 'bg-red-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'yellow', color: 'bg-yellow-500' },
    { id: 'green', color: 'bg-green-500' },
    { id: 'graphite', color: 'bg-gray-400' },
  ]

  return (
    <div>
      <SettingSection title="Appearance">
        <div className="py-3">
          <div className="text-[13px] text-gray-800 font-medium mb-3">Appearance</div>
          <div className="flex gap-4">
            {(['light', 'dark', 'auto'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  if (mode === 'light') setDarkMode(false)
                  else if (mode === 'dark') setDarkMode(true)
                  else setDarkMode(false)
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-[64px] h-[44px] rounded-lg border-2 transition-all ${
                    (mode === 'light' && !isDarkMode) || (mode === 'dark' && isDarkMode)
                      ? 'border-blue-500 shadow-md shadow-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${mode === 'light' ? 'bg-white' : mode === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'}`}
                >
                  <div className={`h-3 rounded-t-lg ${mode === 'light' ? 'bg-gray-100' : mode === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-gray-100 to-gray-700'}`} />
                </div>
                <span className="text-[11px] text-gray-600 capitalize">{mode}</span>
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Accent Color">
        <div className="py-3">
          <div className="text-[13px] text-gray-800 font-medium mb-3">Accent color</div>
          <div className="flex gap-2">
            {accentColors.map((c) => (
              <button
                key={c.id}
                onClick={() => setAccentColor(c.id)}
                className={`w-6 h-6 rounded-full ${c.color} transition-all ${
                  accentColor === c.id
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                    : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Sidebar Icon Size">
        <div className="py-3">
          <RadioGroup
            value={sidebarIconSize}
            onValueChange={(v) => setSidebarIconSize(v as typeof sidebarIconSize)}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="small" id="icon-small" />
              <Label htmlFor="icon-small" className="text-[13px] text-gray-700 cursor-pointer">Small</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="medium" id="icon-medium" />
              <Label htmlFor="icon-medium" className="text-[13px] text-gray-700 cursor-pointer">Medium</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="large" id="icon-large" />
              <Label htmlFor="icon-large" className="text-[13px] text-gray-700 cursor-pointer">Large</Label>
            </div>
          </RadioGroup>
        </div>
      </SettingSection>

      <SettingSection title="Scroll Bars">
        <div className="py-3">
          <RadioGroup
            value={showScrollBars}
            onValueChange={(v) => setShowScrollBars(v as typeof showScrollBars)}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="auto" id="sb-auto" />
              <Label htmlFor="sb-auto" className="text-[13px] text-gray-700 cursor-pointer">Automatically based on mouse or trackpad</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="scrolling" id="sb-scrolling" />
              <Label htmlFor="sb-scrolling" className="text-[13px] text-gray-700 cursor-pointer">When scrolling</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="always" id="sb-always" />
              <Label htmlFor="sb-always" className="text-[13px] text-gray-700 cursor-pointer">Always</Label>
            </div>
          </RadioGroup>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Close windows when quitting an application"
          description="If disabled, windows will be restored when the app reopens">
          <MacToggle checked={closeWindowsWhenQuitting} onCheckedChange={setCloseWindowsWhenQuitting} />
        </SettingRow>
        <SettingRow label="Allow wallpaper tinting in windows">
          <MacToggle checked={allowWallpaperTinting} onCheckedChange={setAllowWallpaperTinting} />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

function AppearancePane() {
  const { isDarkMode, setDarkMode, toggle: toggleDarkMode } = useDarkModeStore()
  const [accentColor, setAccentColor] = useState('blue')
  const [highlightColor, setHighlightColor] = useState('blue')

  const accentColors = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'purple', color: 'bg-purple-500' },
    { id: 'pink', color: 'bg-pink-500' },
    { id: 'red', color: 'bg-red-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'yellow', color: 'bg-yellow-500' },
    { id: 'green', color: 'bg-green-500' },
    { id: 'graphite', color: 'bg-gray-400' },
  ]

  return (
    <div>
      <SettingSection title="Appearance">
        <div className="py-3">
          <div className="text-[13px] text-gray-800 font-medium mb-3">Appearance</div>
          <div className="flex gap-5">
            {(['light', 'dark', 'auto'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (m === 'light') setDarkMode(false)
                  else if (m === 'dark') setDarkMode(true)
                  else setDarkMode(false) // auto defaults to light for now
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-[72px] h-[48px] rounded-lg border-2 transition-all ${
                    (m === 'light' && !isDarkMode) || (m === 'dark' && isDarkMode) || (m === 'auto' && false)
                      ? 'border-blue-500 shadow-md shadow-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${m === 'light' ? 'bg-white' : m === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'}`}
                >
                  <div className={`h-3 rounded-t-lg ${m === 'light' ? 'bg-gray-100' : m === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-gray-100 to-gray-700'}`} />
                </div>
                <span className="text-[11px] text-gray-600 capitalize">{m}</span>
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Accent & Highlight Color">
        <div className="py-3">
          <div className="text-[13px] text-gray-800 font-medium mb-2">Accent color</div>
          <div className="flex gap-2 mb-4">
            {accentColors.map((c) => (
              <button
                key={c.id}
                onClick={() => setAccentColor(c.id)}
                className={`w-7 h-7 rounded-full ${c.color} transition-all ${
                  accentColor === c.id
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                    : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
          <div className="text-[13px] text-gray-800 font-medium mb-2">Highlight color</div>
          <div className="flex gap-2">
            {accentColors.map((c) => (
              <button
                key={c.id}
                onClick={() => setHighlightColor(c.id)}
                className={`w-6 h-6 rounded-full ${c.color} transition-all ${
                  highlightColor === c.id
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                    : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>
      </SettingSection>
    </div>
  )
}

function DisplayPane() {
  const [brightness, setBrightness] = useState([75])
  const [trueTone, setTrueTone] = useState(true)
  const [nightShift, setNightShift] = useState(false)
  const [autoBrightness, setAutoBrightness] = useState(true)
  const [resolution, setResolution] = useState('default')
  const [refreshRate, setRefreshRate] = useState('pro')
  const [mirroring, setMirroring] = useState(false)

  return (
    <div>
      <SettingSection title="Brightness">
        <div className="py-3">
          <div className="flex items-center gap-3">
            <Sun className="w-4 h-4 text-gray-400 shrink-0" />
            <Slider
              value={brightness}
              onValueChange={setBrightness}
              max={100}
              step={1}
              className="flex-1"
            />
            <Sun className="w-5 h-5 text-gray-600 shrink-0" />
          </div>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="True Tone" description="Automatically adapt display to ambient lighting">
          <MacToggle checked={trueTone} onCheckedChange={setTrueTone} />
        </SettingRow>
        <SettingRow label="Night Shift" description="Shift display colors to warmer end of spectrum">
          <MacToggle checked={nightShift} onCheckedChange={setNightShift} />
        </SettingRow>
        <SettingRow label="Automatically adjust brightness">
          <MacToggle checked={autoBrightness} onCheckedChange={setAutoBrightness} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Resolution">
        <div className="py-3">
          <RadioGroup
            value={resolution}
            onValueChange={setResolution}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="default" id="res-default" />
              <Label htmlFor="res-default" className="text-[13px] text-gray-700 cursor-pointer">Default for display</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="scaled" id="res-scaled" />
              <Label htmlFor="res-scaled" className="text-[13px] text-gray-700 cursor-pointer">Scaled</Label>
            </div>
          </RadioGroup>
          {resolution === 'scaled' && (
            <div className="mt-3 flex gap-3 pl-6">
              {['Larger Text', 'Default', 'More Space'].map((label, i) => (
                <button
                  key={label}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                    i === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-5 rounded border ${i === 0 ? 'border-gray-300 bg-gray-50' : i === 1 ? 'border-blue-300 bg-blue-100' : 'border-gray-300 bg-gray-50'}`} />
                  <span className="text-[10px] text-gray-600">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Refresh Rate">
          <select
            value={refreshRate}
            onChange={(e) => setRefreshRate(e.target.value)}
            className="text-[13px] bg-gray-100 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pro">ProMotion (120Hz)</option>
            <option value="60">60 Hertz</option>
            <option value="30">30 Hertz</option>
          </select>
        </SettingRow>
        <SettingRow label="AirPlay Display">
          <MacToggle checked={mirroring} onCheckedChange={setMirroring} />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

function SoundPane() {
  const [volume, setVolume] = useState([65])
  const [alertVolume, setAlertVolume] = useState([80])
  const [inputVolume, setInputVolume] = useState([50])
  const [outputMuted, setOutputMuted] = useState(false)
  const [playSoundOnStartup, setPlaySoundOnStartup] = useState(true)
  const [playUserInterfaceSoundEffects, setPlayUserInterfaceSoundEffects] = useState(true)
  const [selectedAlertSound, setSelectedAlertSound] = useState('Basso')
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('MacBook Pro Speakers')
  const [selectedInputDevice, setSelectedInputDevice] = useState('MacBook Pro Microphone')
  const [playingSound, setPlayingSound] = useState<string | null>(null)

  const alertSounds = [
    'Basso', 'Blow', 'Bottle', 'Frog', 'Funk', 'Glass', 'Hero',
    'Morse', 'Ping', 'Pop', 'Purr', 'Sosumi', 'Submarine', 'Tink',
  ]

  const outputDevices = [
    { name: 'MacBook Pro Speakers', type: 'Built-in', icon: '🔊' },
    { name: 'AirPods Pro', type: 'Bluetooth', icon: '🎧' },
    { name: 'External Display Speakers', type: 'HDMI', icon: '📺' },
  ]

  const inputDevices = [
    { name: 'MacBook Pro Microphone', type: 'Built-in', icon: '🎙️' },
    { name: 'AirPods Pro Microphone', type: 'Bluetooth', icon: '🎧' },
    { name: 'External Microphone', type: 'USB', icon: '🎤' },
  ]

  const handlePlaySound = (sound: string) => {
    setPlayingSound(sound)
    setTimeout(() => setPlayingSound(null), 800)
  }

  return (
    <div>
      <SettingSection title="Output">
        <div className="py-3">
          <div className="text-[12px] text-gray-500 mb-2">Output Device</div>
          <div className="space-y-1">
            {outputDevices.map((device) => (
              <button
                key={device.name}
                onClick={() => setSelectedOutputDevice(device.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                  selectedOutputDevice === device.name
                    ? 'bg-blue-500/10 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span className="text-base">{device.icon}</span>
                <div className="flex-1 text-left min-w-0">
                  <div className={`font-medium ${selectedOutputDevice === device.name ? 'text-blue-600' : 'text-gray-800'}`}>{device.name}</div>
                  <div className="text-[11px] text-gray-500">{device.type}</div>
                </div>
                {selectedOutputDevice === device.name && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Output Volume">
        <div className="py-3">
          <div className="flex items-center gap-3 mb-3">
            <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-[12px] text-gray-500 w-8 text-right">{volume[0]}%</span>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={outputMuted}
              onChange={(e) => setOutputMuted(e.target.checked)}
              className="rounded border-gray-300"
            />
            Mute
          </label>
        </div>
      </SettingSection>

      <SettingSection title="Input">
        <div className="py-3">
          <div className="text-[12px] text-gray-500 mb-2">Input Device</div>
          <div className="space-y-1">
            {inputDevices.map((device) => (
              <button
                key={device.name}
                onClick={() => setSelectedInputDevice(device.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                  selectedInputDevice === device.name
                    ? 'bg-blue-500/10 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span className="text-base">{device.icon}</span>
                <div className="flex-1 text-left min-w-0">
                  <div className={`font-medium ${selectedInputDevice === device.name ? 'text-blue-600' : 'text-gray-800'}`}>{device.name}</div>
                  <div className="text-[11px] text-gray-500">{device.type}</div>
                </div>
                {selectedInputDevice === device.name && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
            <Slider
              value={inputVolume}
              onValueChange={setInputVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-[12px] text-gray-500 w-8 text-right">{inputVolume[0]}%</span>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Alert Volume">
        <div className="py-3">
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
            <Slider
              value={alertVolume}
              onValueChange={setAlertVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-[12px] text-gray-500 w-8 text-right">{alertVolume[0]}%</span>
          </div>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Play sound on startup">
          <MacToggle checked={playSoundOnStartup} onCheckedChange={setPlaySoundOnStartup} />
        </SettingRow>
        <SettingRow label="Play user interface sound effects">
          <MacToggle checked={playUserInterfaceSoundEffects} onCheckedChange={setPlayUserInterfaceSoundEffects} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Sound Effects">
        <div className="py-2">
          <div className="max-h-48 overflow-y-auto">
            {alertSounds.map((sound) => (
              <div
                key={sound}
                className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                  selectedAlertSound === sound
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedAlertSound(sound)
                  handlePlaySound(sound)
                }}
              >
                <button
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    selectedAlertSound === sound
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlaySound(sound)
                  }}
                >
                  {playingSound === sound ? (
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  ) : (
                    <svg className="w-2.5 h-2.5 ml-0.5" viewBox="0 0 8 8" fill="currentColor">
                      <polygon points="0,0 8,4 0,8" />
                    </svg>
                  )}
                </button>
                <span className="flex-1">{sound}</span>
                {selectedAlertSound === sound && (
                  <span className="text-[10px] opacity-70">Selected</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </SettingSection>
    </div>
  )
}

function NetworkPane() {
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [connectedToWifi, setConnectedToWifi] = useState(true)
  const [networkName] = useState('Home Network')
  const [askToJoinNetworks, setAskToJoinNetworks] = useState(true)
  const [firewallEnabled, setFirewallEnabled] = useState(true)
  const [stealthMode, setStealthMode] = useState(false)

  return (
    <div>
      <SettingSection title="Wi-Fi">
        <SettingRow label="Wi-Fi" description={connectedToWifi ? `Connected to ${networkName}` : 'Off'}>
          <MacToggle checked={wifiEnabled} onCheckedChange={(v) => { setWifiEnabled(v); if (!v) setConnectedToWifi(false) }} />
        </SettingRow>
        {wifiEnabled && (
          <div className="py-2">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${connectedToWifi ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
              <Wifi className={`w-5 h-5 ${connectedToWifi ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-800">{networkName}</div>
                <div className="text-[11px] text-gray-500">
                  {connectedToWifi ? 'Connected • Excellent signal' : 'Not connected'}
                </div>
              </div>
              {connectedToWifi && (
                <div className="flex gap-0.5 items-end">
                  {[4, 6, 8, 10].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full ${i < 3 ? 'bg-blue-500' : 'bg-gray-300'}`}
                      style={{ height: h }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {['Neighbor WiFi', 'Coffee Shop', 'Guest Network'].map((name) => (
                <div key={name} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span className="text-[13px] text-gray-700">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </SettingSection>

      <SettingSection>
        <SettingRow label="Ask to join new networks" description="Automatically prompt to join available networks">
          <MacToggle checked={askToJoinNetworks} onCheckedChange={setAskToJoinNetworks} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Firewall">
        <SettingRow label="Firewall" description={firewallEnabled ? 'Enabled' : 'Disabled'}>
          <MacToggle checked={firewallEnabled} onCheckedChange={setFirewallEnabled} />
        </SettingRow>
        {firewallEnabled && (
          <SettingRow label="Stealth Mode" description="Don't respond to ping or connection attempts">
            <MacToggle checked={stealthMode} onCheckedChange={setStealthMode} />
          </SettingRow>
        )}
      </SettingSection>
    </div>
  )
}

function BatteryPane() {
  const [batteryLevel] = useState(87)
  const [powerSource] = useState<'battery' | 'adapter'>('adapter')
  const [lowPowerMode, setLowPowerMode] = useState(false)
  const [optimizedCharging, setOptimizedCharging] = useState(true)
  const [showInMenuBar, setShowInMenuBar] = useState(true)
  const [showPercentage, setShowPercentage] = useState(true)

  const timeRemaining = powerSource === 'adapter' ? 'Not charging' : '4:32 remaining'

  return (
    <div>
      <SettingSection title="Battery">
        <div className="py-3">
          {/* Battery visual */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-[60px] h-[28px]">
              <div className="absolute inset-0 rounded-md border-2 border-gray-400 overflow-hidden">
                <div
                  className={`h-full rounded-sm transition-all ${
                    batteryLevel > 20 ? 'bg-green-500' : batteryLevel > 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
              <div className="absolute -right-1.5 top-[7px] w-[4px] h-[10px] rounded-r-sm bg-gray-400" />
            </div>
            <div>
              <div className="text-[20px] font-semibold text-gray-800">{batteryLevel}%</div>
              <div className="text-[11px] text-gray-500">{timeRemaining}</div>
            </div>
          </div>

          {/* Power source indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <div className={`w-2 h-2 rounded-full ${powerSource === 'adapter' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-[12px] text-gray-600">
              Power Source: {powerSource === 'adapter' ? 'Power Adapter' : 'Battery'}
            </span>
          </div>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Low Power Mode" description="Reduces energy usage to extend battery life">
          <MacToggle checked={lowPowerMode} onCheckedChange={setLowPowerMode} />
        </SettingRow>
        <SettingRow label="Optimized Battery Charging" description="Reduces battery aging by reducing the time your battery spends fully charged">
          <MacToggle checked={optimizedCharging} onCheckedChange={setOptimizedCharging} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Options">
        <SettingRow label="Show battery in menu bar">
          <MacToggle checked={showInMenuBar} onCheckedChange={setShowInMenuBar} />
        </SettingRow>
        <SettingRow label="Show percentage">
          <MacToggle checked={showPercentage} onCheckedChange={setShowPercentage} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Battery Health">
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-gray-700">Battery Health</span>
            <span className="text-[13px] text-green-600 font-medium">Normal</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }} />
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Maximum Capacity: 92%</div>
        </div>
      </SettingSection>
    </div>
  )
}

function DockPane() {
  const [position, setPosition] = useState<'left' | 'bottom' | 'right'>('bottom')
  const [size, setSize] = useState([48])
  const [magnification, setMagnification] = useState(true)
  const [magnificationSize, setMagnificationSize] = useState([64])
  const [autoHide, setAutoHide] = useState(false)
  const [showRecentApps, setShowRecentApps] = useState(false)
  const [animateOpening, setAnimateOpening] = useState(true)
  const [minimizeEffect, setMinimizeEffect] = useState<'genie' | 'scale'>('genie')
  const [showIndicator, setShowIndicator] = useState(true)

  return (
    <div>
      <SettingSection title="Size & Magnification">
        <div className="py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] text-gray-700">Size</span>
            <span className="text-[11px] text-gray-500">{size[0]}px</span>
          </div>
          <Slider
            value={size}
            onValueChange={setSize}
            min={16}
            max={128}
            step={1}
          />
        </div>
        <div className="py-3">
          <SettingRow label="Magnification">
            <MacToggle checked={magnification} onCheckedChange={setMagnification} />
          </SettingRow>
          {magnification && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-gray-500">Magnification size</span>
                <span className="text-[11px] text-gray-500">{magnificationSize[0]}px</span>
              </div>
              <Slider
                value={magnificationSize}
                onValueChange={setMagnificationSize}
                min={16}
                max={128}
                step={1}
              />
            </div>
          )}
        </div>
      </SettingSection>

      <SettingSection title="Position on Screen">
        <div className="py-3">
          <RadioGroup
            value={position}
            onValueChange={(v) => setPosition(v as typeof position)}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="left" id="dock-left" />
              <Label htmlFor="dock-left" className="text-[13px] text-gray-700 cursor-pointer">Left</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="bottom" id="dock-bottom" />
              <Label htmlFor="dock-bottom" className="text-[13px] text-gray-700 cursor-pointer">Bottom</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="right" id="dock-right" />
              <Label htmlFor="dock-right" className="text-[13px] text-gray-700 cursor-pointer">Right</Label>
            </div>
          </RadioGroup>
        </div>
      </SettingSection>

      <SettingSection title="Minimize Windows Using">
        <div className="py-3">
          <RadioGroup
            value={minimizeEffect}
            onValueChange={(v) => setMinimizeEffect(v as typeof minimizeEffect)}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="genie" id="min-genie" />
              <Label htmlFor="min-genie" className="text-[13px] text-gray-700 cursor-pointer">Genie effect</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="scale" id="min-scale" />
              <Label htmlFor="min-scale" className="text-[13px] text-gray-700 cursor-pointer">Scale effect</Label>
            </div>
          </RadioGroup>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Automatically hide and show the Dock">
          <MacToggle checked={autoHide} onCheckedChange={setAutoHide} />
        </SettingRow>
        <SettingRow label="Animate opening applications">
          <MacToggle checked={animateOpening} onCheckedChange={setAnimateOpening} />
        </SettingRow>
        <SettingRow label="Show recent applications in Dock">
          <MacToggle checked={showRecentApps} onCheckedChange={setShowRecentApps} />
        </SettingRow>
        <SettingRow label="Show indicators for open applications">
          <MacToggle checked={showIndicator} onCheckedChange={setShowIndicator} />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

function NotificationsPane() {
  const [doNotDisturb, setDoNotDisturb] = useState(false)
  const [showPreviews, setShowPreviews] = useState<'always' | 'when_unlocked' | 'never'>('when_unlocked')
  const [allowNotifications, setAllowNotifications] = useState(true)

  const apps = [
    { name: 'Messages', enabled: true, badges: true, sounds: true },
    { name: 'Mail', enabled: true, badges: true, sounds: true },
    { name: 'Calendar', enabled: true, badges: true, sounds: false },
    { name: 'Reminders', enabled: true, badges: true, sounds: false },
    { name: 'Safari', enabled: false, badges: false, sounds: false },
    { name: 'Photos', enabled: false, badges: false, sounds: false },
  ]

  return (
    <div>
      <SettingSection>
        <SettingRow label="Do Not Disturb" description="Silence all notifications and calls">
          <MacToggle checked={doNotDisturb} onCheckedChange={setDoNotDisturb} />
        </SettingRow>
        <SettingRow label="Allow Notifications">
          <MacToggle checked={allowNotifications} onCheckedChange={setAllowNotifications} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Show Previews">
        <div className="py-3">
          <RadioGroup
            value={showPreviews}
            onValueChange={(v) => setShowPreviews(v as typeof showPreviews)}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="always" id="sp-always" />
              <Label htmlFor="sp-always" className="text-[13px] text-gray-700 cursor-pointer">Always</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="when_unlocked" id="sp-unlocked" />
              <Label htmlFor="sp-unlocked" className="text-[13px] text-gray-700 cursor-pointer">When Unlocked</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="never" id="sp-never" />
              <Label htmlFor="sp-never" className="text-[13px] text-gray-700 cursor-pointer">Never</Label>
            </div>
          </RadioGroup>
        </div>
      </SettingSection>

      <SettingSection title="Application Notifications">
        <div className="py-2">
          {apps.map((app, i) => (
            <div key={app.name} className={`flex items-center justify-between py-2 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[12px]">
                  {app.name[0]}
                </div>
                <span className="text-[13px] text-gray-700">{app.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {app.badges && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">Badges</span>
                )}
                {app.sounds && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">Sounds</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  )
}

function BluetoothPane() {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [discoverable, setDiscoverable] = useState(false)

  const devices = [
    { name: 'AirPods Pro', type: 'Headphones', connected: true, icon: '🎧' },
    { name: 'Magic Keyboard', type: 'Keyboard', connected: true, icon: '⌨️' },
    { name: 'Magic Mouse', type: 'Mouse', connected: false, icon: '🖱️' },
    { name: 'HomePod Mini', type: 'Speaker', connected: false, icon: '🔊' },
  ]

  return (
    <div>
      <SettingSection>
        <SettingRow label="Bluetooth" description={bluetoothEnabled ? 'On' : 'Off'}>
          <MacToggle checked={bluetoothEnabled} onCheckedChange={setBluetoothEnabled} />
        </SettingRow>
        {bluetoothEnabled && (
          <SettingRow label="Discoverable" description="Allow other devices to find this Mac">
            <MacToggle checked={discoverable} onCheckedChange={setDiscoverable} />
          </SettingRow>
        )}
      </SettingSection>

      {bluetoothEnabled && (
        <SettingSection title="Devices">
          <div className="py-2">
            {devices.map((device, i) => (
              <div key={device.name} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                <span className="text-xl">{device.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-gray-800">{device.name}</div>
                  <div className="text-[11px] text-gray-500">{device.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${device.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-[11px] text-gray-500">{device.connected ? 'Connected' : 'Not Connected'}</span>
                </div>
              </div>
            ))}
          </div>
        </SettingSection>
      )}
    </div>
  )
}

function PrivacyPane() {
  const [fileVault, setFileVault] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [locationServices, setLocationServices] = useState(true)
  const [adTracking, setAdTracking] = useState(false)

  return (
    <div>
      <SettingSection title="Privacy">
        <SettingRow label="Location Services" description="Allow apps to use your location">
          <MacToggle checked={locationServices} onCheckedChange={setLocationServices} />
        </SettingRow>
        <SettingRow label="Analytics & Improvements" description="Share usage data with Apple">
          <MacToggle checked={analytics} onCheckedChange={setAnalytics} />
        </SettingRow>
        <SettingRow label="Apple Advertising" description="Personalized ads">
          <MacToggle checked={adTracking} onCheckedChange={setAdTracking} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Security">
        <SettingRow label="FileVault" description={fileVault ? 'On — Disk is encrypted' : 'Off — Disk is not encrypted'}>
          <MacToggle checked={fileVault} onCheckedChange={setFileVault} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Permissions">
        <div className="py-2">
          {['Camera', 'Microphone', 'Files and Folders', 'Full Disk Access', 'Screen Recording', 'Accessibility'].map((perm, i) => (
            <div key={perm} className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <span className="text-[13px] text-gray-700">{perm}</span>
              <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  )
}

function UsersPane() {
  const [autoLogin, setAutoLogin] = useState(false)
  const [showFastUserSwitching, setShowFastUserSwitching] = useState(true)

  const users = [
    { name: 'User', role: 'Admin', icon: '👤', current: true },
    { name: 'Guest User', role: 'Guest', icon: '👥', current: false },
  ]

  return (
    <div>
      <SettingSection title="Current User">
        <div className="py-3">
          {users.map((user, i) => (
            <div key={user.name} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl">
                {user.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-800 flex items-center gap-2">
                  {user.name}
                  {user.current && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Current</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500">{user.role}</div>
              </div>
            </div>
          ))}
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Automatic Login" description="Log in automatically as the current user">
          <MacToggle checked={autoLogin} onCheckedChange={setAutoLogin} />
        </SettingRow>
        <SettingRow label="Show fast user switching menu" description="In menu bar">
          <MacToggle checked={showFastUserSwitching} onCheckedChange={setShowFastUserSwitching} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Login Options">
        <div className="py-2">
          {['Display login window as', 'Allow network users', 'Show password hints', 'Show input menu'].map((opt, i) => (
            <div key={opt} className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <span className="text-[13px] text-gray-700">{opt}</span>
              <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  )
}

function DesktopPane() {
  const [changeInterval, setChangeInterval] = useState('never')
  const [randomOrder, setRandomOrder] = useState(false)
  const [showDesktopFolders, setShowDesktopFolders] = useState(true)
  const [selectedScreenSaver, setSelectedScreenSaver] = useState('Flurry')
  const [screenSaverStartTime, setScreenSaverStartTime] = useState('5min')
  const [showScreenSaverClock, setShowScreenSaverClock] = useState(false)
  const { wallpaperIndex, setWallpaperIndex } = useMacOSStore()

  const screenSavers = [
    { name: 'Flurry', color: 'bg-gradient-to-br from-purple-400 to-pink-500' },
    { name: 'Nature Patterns', color: 'bg-gradient-to-br from-green-400 to-emerald-600' },
    { name: 'Cosmos', color: 'bg-gradient-to-br from-slate-800 to-indigo-900' },
    { name: 'Shell', color: 'bg-gradient-to-br from-amber-300 to-orange-500' },
    { name: 'Arabesque', color: 'bg-gradient-to-br from-rose-400 to-red-600' },
    { name: 'Message', color: 'bg-gradient-to-br from-sky-400 to-blue-600' },
    { name: 'iTunes Artwork', color: 'bg-gradient-to-br from-pink-500 to-violet-600' },
    { name: 'Photo Slideshow', color: 'bg-gradient-to-br from-teal-400 to-cyan-600' },
  ]

  return (
    <div>
      <SettingSection title="Desktop">
        <div className="py-3">
          <div className="text-[13px] text-gray-800 font-medium mb-3">Desktop Pictures</div>
          <div className="grid grid-cols-3 gap-2">
            {WALLPAPERS.map((wp, i) => (
              <div
                key={i}
                className="aspect-video rounded-lg cursor-pointer border-2 transition-colors relative overflow-hidden group"
                style={wp.style}
                onClick={() => setWallpaperIndex(i)}
              >
                <div className={`absolute inset-0 rounded-lg transition-colors ${
                  wallpaperIndex === i
                    ? 'border-2 border-blue-500 shadow-md shadow-blue-500/20'
                    : 'border-transparent hover:border-blue-400/60'
                }`} />
                <div className={`absolute bottom-1 left-1 right-1 text-[9px] font-medium text-white/80 bg-black/30 rounded px-1 py-0.5 text-center truncate ${
                  wallpaperIndex === i ? 'bg-blue-500/40' : ''
                }`}>
                  {wp.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Change picture">
          <select
            value={changeInterval}
            onChange={(e) => setChangeInterval(e.target.value)}
            className="text-[13px] bg-gray-100 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="never">Never</option>
            <option value="5sec">Every 5 seconds</option>
            <option value="1min">Every minute</option>
            <option value="5min">Every 5 minutes</option>
            <option value="30min">Every 30 minutes</option>
            <option value="1hr">Every hour</option>
            <option value="login">When logging in</option>
            <option value="wake">When waking from sleep</option>
          </select>
        </SettingRow>
        <SettingRow label="Random order">
          <MacToggle checked={randomOrder} onCheckedChange={setRandomOrder} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Screen Saver">
        <div className="py-3">
          <div className="flex gap-3">
            {/* Screen saver list */}
            <div className="w-[160px] max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {screenSavers.map((ss) => (
                <button
                  key={ss.name}
                  onClick={() => setSelectedScreenSaver(ss.name)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-left transition-colors ${
                    selectedScreenSaver === ss.name
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded ${ss.color} shrink-0`} />
                  <span className="truncate">{ss.name}</span>
                </button>
              ))}
            </div>
            {/* Preview */}
            <div className="flex-1 aspect-video rounded-lg border border-gray-200 overflow-hidden relative">
              <div className={`absolute inset-0 ${screenSavers.find(s => s.name === selectedScreenSaver)?.color ?? 'bg-gray-400'} animate-pulse`} style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/80 text-[11px] font-medium bg-black/30 px-2 py-1 rounded">{selectedScreenSaver}</span>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Start after">
          <select
            value={screenSaverStartTime}
            onChange={(e) => setScreenSaverStartTime(e.target.value)}
            className="text-[13px] bg-gray-100 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="1min">1 Minute</option>
            <option value="2min">2 Minutes</option>
            <option value="5min">5 Minutes</option>
            <option value="10min">10 Minutes</option>
            <option value="20min">20 Minutes</option>
            <option value="30min">30 Minutes</option>
            <option value="1hr">1 Hour</option>
            <option value="never">Never</option>
          </select>
        </SettingRow>
        <SettingRow label="Show with clock">
          <MacToggle checked={showScreenSaverClock} onCheckedChange={setShowScreenSaverClock} />
        </SettingRow>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Show folders on desktop">
          <MacToggle checked={showDesktopFolders} onCheckedChange={setShowDesktopFolders} />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

// ─── Wallpaper Pane (functional - actually changes desktop wallpaper) ─────────

function WallpaperPane() {
  const { wallpaperIndex, setWallpaperIndex } = useMacOSStore()
  const [changeInterval, setChangeInterval] = useState('never')
  const [randomOrder, setRandomOrder] = useState(false)

  return (
    <div>
      <SettingSection title="Current Wallpaper">
        <div className="py-3">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-[200px] h-[125px] rounded-lg border-2 border-blue-500 shadow-md shadow-blue-500/20 overflow-hidden shrink-0"
              style={WALLPAPERS[wallpaperIndex].style}
            />
            <div>
              <div className="text-[14px] font-semibold text-gray-800">{WALLPAPERS[wallpaperIndex].name}</div>
              <div className="text-[12px] text-gray-500 mt-1">Currently active</div>
              <button
                onClick={() => {
                  const next = (wallpaperIndex + 1) % WALLPAPERS.length
                  setWallpaperIndex(next)
                }}
                className="mt-2 px-3 py-1.5 text-[12px] bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Next Wallpaper
              </button>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Choose Wallpaper">
        <div className="py-3">
          <div className="grid grid-cols-3 gap-2">
            {WALLPAPERS.map((wp, i) => (
              <button
                key={i}
                className="aspect-video rounded-lg cursor-pointer border-2 transition-all relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98]"
                style={wp.style}
                onClick={() => setWallpaperIndex(i)}
              >
                <div className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                  wallpaperIndex === i
                    ? 'border-2 border-blue-500 shadow-md shadow-blue-500/20'
                    : 'border-transparent hover:border-blue-400/60'
                }`} />
                {/* Check mark for selected */}
                {wallpaperIndex === i && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className={`absolute bottom-1 left-1 right-1 text-[9px] font-medium text-white/80 bg-black/30 rounded px-1 py-0.5 text-center truncate transition-colors ${
                  wallpaperIndex === i ? 'bg-blue-500/50' : ''
                }`}>
                  {wp.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection>
        <SettingRow label="Change picture">
          <select
            value={changeInterval}
            onChange={(e) => setChangeInterval(e.target.value)}
            className="text-[13px] bg-gray-100 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="never">Never</option>
            <option value="5sec">Every 5 seconds</option>
            <option value="1min">Every minute</option>
            <option value="5min">Every 5 minutes</option>
            <option value="30min">Every 30 minutes</option>
            <option value="1hr">Every hour</option>
            <option value="login">When logging in</option>
            <option value="wake">When waking from sleep</option>
          </select>
        </SettingRow>
        <SettingRow label="Random order">
          <MacToggle checked={randomOrder} onCheckedChange={setRandomOrder} />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

// ─── About This Mac Pane ─────────────────────────────────────────────────────

function AboutThisMacPane() {
  return (
    <div>
      <SettingSection>
        <div className="py-4">
          <div className="flex flex-col items-center text-center mb-6">
            {/* Mac icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mb-4 shadow-lg">
              <Monitor className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900">macOS Sequoia</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">Version 15.2</p>
          </div>

          <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">Chip</span>
              <span className="text-[13px] font-medium text-gray-800">Apple M3 Pro</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">Memory</span>
              <span className="text-[13px] font-medium text-gray-800">18 GB</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">Startup Disk</span>
              <span className="text-[13px] font-medium text-gray-800">Macintosh HD</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">Serial Number</span>
              <span className="text-[13px] font-medium text-gray-800">C02XJ0JAMD6N</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">macOS</span>
              <span className="text-[13px] font-medium text-gray-800">Sequoia 15.2 (24C101)</span>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="System Report">
        <div className="py-3">
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-gray-500 mb-1">Processor</div>
              <div className="font-medium text-gray-800">14-Core CPU</div>
              <div className="text-gray-400 text-[11px]">18-Core GPU</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-gray-500 mb-1">Storage</div>
              <div className="font-medium text-gray-800">500 GB SSD</div>
              <div className="text-gray-400 text-[11px]">186.4 GB used</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-gray-500 mb-1">Display</div>
              <div className="font-medium text-gray-800">Built-in Retina</div>
              <div className="text-gray-400 text-[11px]">3024 × 1964</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-gray-500 mb-1">Graphics</div>
              <div className="font-medium text-gray-800">Apple M3 Pro</div>
              <div className="text-gray-400 text-[11px]">Hardware acceleration</div>
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  )
}

// ─── Placeholder for panes without a full detail view ────────────────────────

function PlaceholderPane({ name, color, icon }: { name: string; color: string; icon: React.ElementType }) {
  const IconComponent = icon
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-4`}>
        <IconComponent className="w-8 h-8 text-white" strokeWidth={1.5} />
      </div>
      <h2 className="text-[15px] font-semibold text-gray-800 mb-1">{name}</h2>
      <p className="text-[12px] text-gray-500 max-w-[240px]">
        Settings for {name.toLowerCase()} will appear here.
      </p>
    </div>
  )
}

// ─── Detail view router ─────────────────────────────────────────────────────

function DetailView({ paneId }: { paneId: PaneId }) {
  const pane = PREFERENCE_PANES.find((p) => p.id === paneId)

  switch (paneId) {
    case 'about':
      return <AboutThisMacPane />
    case 'general':
      return <GeneralPane />
    case 'appearance':
      return <AppearancePane />
    case 'wallpaper':
      return <WallpaperPane />
    case 'desktop':
      return <DesktopPane />
    case 'dock':
      return <DockPane />
    case 'display':
      return <DisplayPane />
    case 'battery':
      return <BatteryPane />
    case 'sound':
      return <SoundPane />
    case 'notifications':
      return <NotificationsPane />
    case 'network':
      return <NetworkPane />
    case 'bluetooth':
      return <BluetoothPane />
    case 'privacy':
      return <PrivacyPane />
    case 'users':
      return <UsersPane />
    default:
      return <PlaceholderPane name={pane?.name ?? ''} color={pane?.color ?? 'bg-gray-500'} icon={pane?.icon ?? Sun} />
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SystemPreferences() {
  const [selectedPane, setSelectedPane] = useState<PaneId>('about')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPanes = PREFERENCE_PANES.filter((pane) =>
    pane.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentPane = PREFERENCE_PANES.find((p) => p.id === selectedPane)

  return (
    <div className="flex h-full w-full bg-[#f5f5f7] overflow-hidden select-none">
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-[220px] shrink-0 bg-[#f5f5f7]/90 backdrop-blur-md border-r border-gray-200/60 flex flex-col">
        {/* Search bar */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[28px] pl-7 pr-2 text-[12px] bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-all"
            />
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Sidebar items */}
        <ScrollArea className="flex-1">
          <div className="px-2 pb-2">
            {filteredPanes.map((pane) => {
              const IconComponent = pane.icon
              const isActive = selectedPane === pane.id
              return (
                <button
                  key={pane.id}
                  onClick={() => setSelectedPane(pane.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 mb-0.5 ${
                    isActive
                      ? 'bg-blue-500 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200/60'
                  }`}
                >
                  <div
                    className={`w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20' : pane.color
                    }`}
                  >
                    <IconComponent
                      className={`w-[13px] h-[13px] ${isActive ? 'text-white' : 'text-white'}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="truncate">{pane.name}</span>
                </button>
              )
            })}
            {filteredPanes.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-[12px]">
                No results
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ─── Main Content Area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Title bar */}
        <div className="shrink-0 bg-[#f5f5f7] border-b border-gray-200/60 px-5 py-2.5 flex items-center gap-2">
          {currentPane && (
            <>
              <div
                className={`w-6 h-6 rounded-md ${currentPane.color} flex items-center justify-center shadow-sm`}
              >
                <currentPane.icon className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-[13px] font-semibold text-gray-800">
                {currentPane.name}
              </span>
            </>
          )}
        </div>

        {/* Detail content */}
        <ScrollArea className="flex-1">
          <div className="p-5 max-w-[600px] mx-auto transition-opacity duration-150">
            <DetailView paneId={selectedPane} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
