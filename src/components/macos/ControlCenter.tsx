'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wifi,
  Bluetooth,
  Share,
  Moon,
  Sun,
  Volume2,
  Music,
  Monitor,
  Keyboard,
  Airplay,
  Focus,
  Battery,
  ChevronDown,
  SunDim,
  SunMedium,
} from 'lucide-react'
import useDarkModeStore from '@/store/dark-mode-store'

// --- Shared control center state (module-level) ---
interface ControlCenterState {
  isOpen: boolean
}

const ccState: ControlCenterState = { isOpen: false }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useControlCenter() {
  const [isOpen, setIsOpen] = useState(ccState.isOpen)

  useEffect(() => {
    const listener = () => setIsOpen(ccState.isOpen)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const open = useCallback(() => {
    ccState.isOpen = true
    emitChange()
  }, [])

  const close = useCallback(() => {
    ccState.isOpen = false
    emitChange()
  }, [])

  const toggle = useCallback(() => {
    ccState.isOpen = !ccState.isOpen
    emitChange()
  }, [])

  return { isOpen, open, close, toggle }
}

// --- Toggle Tile Component ---
interface ToggleTileProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  active: boolean
  onClick: () => void
  color?: string
}

function ToggleTile({ icon, label, sublabel, active, onClick, color }: ToggleTileProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 p-2.5 rounded-[14px] transition-all duration-200 text-left w-full ${
        active
          ? `${color || 'bg-[#0a84ff]'} text-white`
          : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.12]'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          active ? 'bg-white/20' : 'bg-white/10'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium truncate leading-tight">{label}</div>
        {sublabel && (
          <div className={`text-[10px] truncate leading-tight mt-0.5 ${active ? 'text-white/70' : 'text-white/35'}`}>
            {sublabel}
          </div>
        )}
      </div>
    </button>
  )
}

// --- Slider Component with icons ---
interface SliderTileProps {
  iconLow: React.ReactNode
  iconHigh: React.ReactNode
  label: string
  value: number
  onChange: (value: number) => void
  color?: string
}

function SliderTile({ iconLow, iconHigh, label, value, onChange, color }: SliderTileProps) {
  const isActive = value > 0
  return (
    <div className={`p-2.5 rounded-[14px] transition-colors duration-200 ${isActive ? (color || 'bg-white/[0.12]') : 'bg-white/[0.08]'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white/15' : 'bg-white/10'}`}>
          {iconLow}
        </div>
        <div className="text-[12px] font-medium text-white/80">{label}</div>
      </div>
      <div className="flex items-center gap-1.5 px-1">
        <div className="shrink-0">{iconLow}</div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 appearance-none rounded-full outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.5) ${value}%, rgba(255,255,255,0.15) ${value}%)`,
          }}
        />
        <div className="shrink-0">{iconHigh}</div>
      </div>
    </div>
  )
}

// --- Sound Output Selector ---
interface SoundOutputSelectorProps {
  selected: string
  onSelect: (value: string) => void
}

const AUDIO_OUTPUTS = [
  { id: 'internal', name: 'Internal Speakers', icon: <Volume2 className="w-3.5 h-3.5" /> },
  { id: 'airpods', name: 'AirPods Pro', icon: <Music className="w-3.5 h-3.5" /> },
]

function SoundOutputSelector({ selected, onSelect }: SoundOutputSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-left"
      >
        {AUDIO_OUTPUTS.find(o => o.id === selected)?.icon}
        <span className="text-[11px] text-white/60 flex-1 truncate">
          {AUDIO_OUTPUTS.find(o => o.id === selected)?.name}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full left-0 right-0 mb-1 bg-[#3a3a3c]/95 backdrop-blur-xl rounded-lg border border-white/[0.08] overflow-hidden z-10"
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {AUDIO_OUTPUTS.map(output => (
              <button
                key={output.id}
                onClick={() => {
                  onSelect(output.id)
                  setIsOpen(false)
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-white/[0.08] transition-colors ${
                  selected === output.id ? 'bg-white/[0.06]' : ''
                }`}
              >
                {output.icon}
                <span className="text-[11px] text-white/80 flex-1">{output.name}</span>
                {selected === output.id && (
                  <span className="text-[#007AFF] text-[10px]">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ControlCenter() {
  const { isOpen, close } = useControlCenter()
  const { isDarkMode, toggle: toggleDarkMode } = useDarkModeStore()
  const panelRef = useRef<HTMLDivElement>(null)

  // Toggle states
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)
  const [airdrop, setAirdrop] = useState(false)
  const [focus, setFocus] = useState(false)
  const [screenMirroring, setScreenMirroring] = useState(false)

  // Slider states
  const [brightness, setBrightness] = useState(80)
  const [volume, setVolume] = useState(65)
  const [keyboardBrightness, setKeyboardBrightness] = useState(60)

  // Sound output
  const [audioOutput, setAudioOutput] = useState('internal')

  // Now playing state (simulated)
  const [nowPlaying] = useState({
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    playing: true,
  })

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close()
      }
    }

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 50)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, close])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ccState.isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          className="fixed top-[32px] right-2 w-[320px] z-[99998] select-none"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="bg-[#2a2a2e]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.08] p-3 flex flex-col gap-2">
            {/* Toggle tiles - 2 column grid */}
            <div className="grid grid-cols-2 gap-2">
              <ToggleTile
                icon={<Wifi className="w-3.5 h-3.5" />}
                label="Wi-Fi"
                sublabel={wifi ? 'Home Network' : 'Off'}
                active={wifi}
                onClick={() => setWifi(!wifi)}
                color="bg-[#007AFF]"
              />
              <ToggleTile
                icon={<Bluetooth className="w-3.5 h-3.5" />}
                label="Bluetooth"
                sublabel={bluetooth ? 'On' : 'Off'}
                active={bluetooth}
                onClick={() => setBluetooth(!bluetooth)}
                color="bg-[#007AFF]"
              />
              <ToggleTile
                icon={<Share className="w-3.5 h-3.5" />}
                label="AirDrop"
                sublabel={airdrop ? 'Everyone' : 'Off'}
                active={airdrop}
                onClick={() => setAirdrop(!airdrop)}
                color="bg-[#007AFF]"
              />
              <ToggleTile
                icon={<Focus className="w-3.5 h-3.5" />}
                label="Focus"
                sublabel={focus ? 'Do Not Disturb' : 'Off'}
                active={focus}
                onClick={() => setFocus(!focus)}
                color="bg-[#5e5ce6]"
              />
              <ToggleTile
                icon={<Airplay className="w-3.5 h-3.5" />}
                label="Screen Mirroring"
                sublabel={screenMirroring ? 'On' : 'Off'}
                active={screenMirroring}
                onClick={() => setScreenMirroring(!screenMirroring)}
                color="bg-[#007AFF]"
              />
              <ToggleTile
                icon={isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                label="Dark Mode"
                sublabel={isDarkMode ? 'On' : 'Off'}
                active={isDarkMode}
                onClick={toggleDarkMode}
                color="bg-[#5e5ce6]"
              />
            </div>

            {/* Display brightness with sun icons */}
            <SliderTile
              iconLow={<SunDim className="w-3 h-3 text-white/60" />}
              iconHigh={<Sun className="w-3.5 h-3.5 text-white/80" />}
              label="Display"
              value={brightness}
              onChange={setBrightness}
            />

            {/* Keyboard brightness */}
            <SliderTile
              iconLow={<Keyboard className="w-3 h-3 text-white/60" />}
              iconHigh={<Keyboard className="w-3.5 h-3.5 text-white/80" />}
              label="Keyboard Brightness"
              value={keyboardBrightness}
              onChange={setKeyboardBrightness}
            />

            {/* Sound volume with output selector */}
            <div className="p-2.5 rounded-[14px] bg-white/[0.08]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Volume2 className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div className="text-[12px] font-medium text-white/80">Sound</div>
              </div>
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <Volume2 className="w-3 h-3 text-white/40 shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full outline-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3.5
                    [&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
                  style={{
                    background: `linear-gradient(to right, rgba(255,255,255,0.5) ${volume}%, rgba(255,255,255,0.15) ${volume}%)`,
                  }}
                />
                <Volume2 className="w-3.5 h-3.5 text-white/60 shrink-0" />
              </div>
              <SoundOutputSelector
                selected={audioOutput}
                onSelect={setAudioOutput}
              />
            </div>

            {/* Now Playing */}
            {nowPlaying.playing && (
              <div className="p-2.5 rounded-[14px] bg-white/[0.08] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-white/90 truncate">
                    {nowPlaying.title}
                  </div>
                  <div className="text-[10px] text-white/35 truncate">
                    {nowPlaying.artist}
                  </div>
                </div>
                {/* Mini play bars animation */}
                <div className="flex items-end gap-[2px] h-4 shrink-0">
                  {[3, 5, 2, 4].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-[2.5px] bg-[#007AFF] rounded-full"
                      animate={{
                        height: [h, h + 4, h, h + 2, h],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
