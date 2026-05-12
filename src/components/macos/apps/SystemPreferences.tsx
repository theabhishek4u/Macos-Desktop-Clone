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
  emoji: string
  color: string
  icon: React.ElementType
}

// ─── Pane definitions ────────────────────────────────────────────────────────

const PREFERENCE_PANES: PreferencePane[] = [
  { id: 'general', name: 'General', emoji: '⚙️', color: 'bg-gray-500', icon: Palette },
  { id: 'appearance', name: 'Appearance', emoji: '🎨', color: 'bg-blue-500', icon: Sun },
  { id: 'desktop', name: 'Desktop & Screen Saver', emoji: '🖥️', color: 'bg-purple-500', icon: Monitor },
  { id: 'dock', name: 'Dock & Menu Bar', emoji: '📋', color: 'bg-slate-500', icon: Layout },
  { id: 'display', name: 'Display', emoji: '🖥', color: 'bg-sky-500', icon: Monitor },
  { id: 'battery', name: 'Battery', emoji: '🔋', color: 'bg-green-500', icon: Battery },
  { id: 'sound', name: 'Sound', emoji: '🔊', color: 'bg-rose-500', icon: Volume2 },
  { id: 'notifications', name: 'Notifications', emoji: '🔔', color: 'bg-red-500', icon: Bell },
  { id: 'network', name: 'Network', emoji: '📶', color: 'bg-blue-600', icon: Wifi },
  { id: 'bluetooth', name: 'Bluetooth', emoji: '🔷', color: 'bg-blue-400', icon: Bluetooth },
  { id: 'privacy', name: 'Privacy & Security', emoji: '🔒', color: 'bg-blue-700', icon: Shield },
  { id: 'users', name: 'Users & Groups', emoji: '👥', color: 'bg-cyan-600', icon: Users },
  { id: 'wallpaper', name: 'Wallpaper', emoji: '🌄', color: 'bg-teal-500', icon: Image },
  { id: 'storage', name: 'Storage', emoji: '💾', color: 'bg-indigo-500', icon: HardDrive },
  { id: 'keyboard', name: 'Keyboard', emoji: '⌨️', color: 'bg-gray-600', icon: Keyboard },
  { id: 'mouse', name: 'Mouse', emoji: '🖱️', color: 'bg-violet-500', icon: Mouse },
  { id: 'printers', name: 'Printers & Scanners', emoji: '🖨️', color: 'bg-gray-500', icon: Printer },
  { id: 'language', name: 'Language & Region', emoji: '🌍', color: 'bg-emerald-500', icon: Globe },
  { id: 'accessibility', name: 'Accessibility', emoji: '♿', color: 'bg-blue-500', icon: Accessibility },
  { id: 'datetime', name: 'Date & Time', emoji: '🕐', color: 'bg-amber-500', icon: Timer },
  { id: 'profiles', name: 'Profiles', emoji: '📁', color: 'bg-orange-500', icon: Lock },
]

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
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'auto'>('auto')
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
                onClick={() => setAppearance(mode)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-[64px] h-[44px] rounded-lg border-2 transition-all ${
                    appearance === mode
                      ? 'border-blue-500 shadow-md shadow-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${mode === 'light' ? 'bg-white' : mode === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'}`}
                />
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
  const [outputMuted, setOutputMuted] = useState(false)
  const [playSoundOnStartup, setPlaySoundOnStartup] = useState(true)
  const [playUserInterfaceSoundEffects, setPlayUserInterfaceSoundEffects] = useState(true)
  const [selectedAlertSound, setSelectedAlertSound] = useState('Basso')

  const alertSounds = [
    'Basso', 'Blow', 'Bottle', 'Frog', 'Funk', 'Glass', 'Hero',
    'Morse', 'Ping', 'Pop', 'Purr', 'Sosumi', 'Submarine', 'Tink',
  ]

  return (
    <div>
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

      <SettingSection title="Alert Sound">
        <div className="py-2">
          <div className="max-h-40 overflow-y-auto">
            {alertSounds.map((sound) => (
              <button
                key={sound}
                onClick={() => setSelectedAlertSound(sound)}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                  selectedAlertSound === sound
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {sound}
              </button>
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
  const { wallpaperIndex, setWallpaperIndex } = useMacOSStore()

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

      <SettingSection>
        <SettingRow label="Show folders on desktop">
          <MacToggle checked={showDesktopFolders} onCheckedChange={setShowDesktopFolders} />
        </SettingRow>
      </SettingSection>
    </div>
  )
}

// ─── Placeholder for panes without a full detail view ────────────────────────

function PlaceholderPane({ name, emoji, color, icon }: { name: string; emoji: string; color: string; icon: React.ElementType }) {
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
    case 'general':
      return <GeneralPane />
    case 'appearance':
      return <AppearancePane />
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
      return <PlaceholderPane name={pane?.name ?? ''} emoji={pane?.emoji ?? '⚙️'} color={pane?.color ?? 'bg-gray-500'} icon={pane?.icon ?? Sun} />
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SystemPreferences() {
  const [selectedPane, setSelectedPane] = useState<PaneId | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPanes = PREFERENCE_PANES.filter((pane) =>
    pane.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group panes into rows of 3 for consistent layout
  const rows: PreferencePane[][] = []
  for (let i = 0; i < filteredPanes.length; i += 3) {
    rows.push(filteredPanes.slice(i, i + 3))
  }

  const currentPane = selectedPane
    ? PREFERENCE_PANES.find((p) => p.id === selectedPane)
    : null

  return (
    <div className="flex flex-col h-full w-full bg-[#f5f5f7] overflow-hidden select-none">
      {/* Toolbar / Title Bar Area */}
      <div className="shrink-0 bg-[#f5f5f7]/90 backdrop-blur-md border-b border-gray-200/60 px-4 py-2.5 flex items-center gap-3">
        {selectedPane ? (
          <>
            <button
              onClick={() => setSelectedPane(null)}
              className="flex items-center gap-1 text-[13px] text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Show All</span>
            </button>
            <Separator orientation="vertical" className="h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-md ${currentPane?.color ?? 'bg-gray-500'} flex items-center justify-center shadow-sm`}
              >
                {currentPane && <currentPane.icon className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />}
              </div>
              <span className="text-[13px] font-semibold text-gray-800">
                {currentPane?.name}
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="text-[13px] font-semibold text-gray-800">
              System Preferences
            </span>
            <div className="flex-1" />
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[160px] h-[26px] pl-7 pr-2 text-[12px] bg-white/80 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              />
              <svg
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
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
          </>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {selectedPane ? (
          <div className="p-5 max-w-[560px] mx-auto">
            <DetailView paneId={selectedPane} />
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 max-w-[600px] mx-auto">
              {filteredPanes.map((pane) => (
                <button
                  key={pane.id}
                  onClick={() => setSelectedPane(pane.id)}
                  className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 cursor-pointer shadow-sm border border-gray-100 transition-all duration-150 active:scale-[0.97]"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${pane.color} flex items-center justify-center shadow-md`}
                  >
                    <pane.icon className="w-[28px] h-[28px] text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] text-gray-700 font-medium text-center leading-tight line-clamp-2">
                    {pane.name}
                  </span>
                </button>
              ))}
            </div>
            {filteredPanes.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-[13px]">
                No preferences found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
