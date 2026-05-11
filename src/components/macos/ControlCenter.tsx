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
} from 'lucide-react'

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
      className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left w-full ${
        active
          ? `${color || 'bg-[#0a84ff]'} text-white`
          : 'bg-white/10 text-white/80 hover:bg-white/15'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          active ? 'bg-white/20' : 'bg-white/10'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium truncate">{label}</div>
        {sublabel && (
          <div className={`text-[11px] truncate ${active ? 'text-white/70' : 'text-white/40'}`}>
            {sublabel}
          </div>
        )}
      </div>
    </button>
  )
}

// --- Slider Component ---
interface SliderTileProps {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (value: number) => void
}

function SliderTile({ icon, label, value, onChange }: SliderTileProps) {
  return (
    <div className="p-3 bg-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="text-[13px] font-medium text-white/80">{label}</div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 appearance-none rounded-full bg-white/20 outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <span className="text-[11px] text-white/50 w-8 text-right">{value}%</span>
      </div>
    </div>
  )
}

export default function ControlCenter() {
  const { isOpen, close } = useControlCenter()
  const panelRef = useRef<HTMLDivElement>(null)

  // Toggle states
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)
  const [airdrop, setAirdrop] = useState(false)
  const [focus, setFocus] = useState(false)

  // Slider states
  const [brightness, setBrightness] = useState(80)
  const [volume, setVolume] = useState(65)

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
      // Delay to avoid the same click that opened it
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
                icon={<Wifi className="w-4 h-4" />}
                label="Wi-Fi"
                sublabel={wifi ? 'Connected' : 'Off'}
                active={wifi}
                onClick={() => setWifi(!wifi)}
              />
              <ToggleTile
                icon={<Bluetooth className="w-4 h-4" />}
                label="Bluetooth"
                sublabel={bluetooth ? 'On' : 'Off'}
                active={bluetooth}
                onClick={() => setBluetooth(!bluetooth)}
              />
              <ToggleTile
                icon={<Share className="w-4 h-4" />}
                label="AirDrop"
                sublabel={airdrop ? 'Everyone' : 'Off'}
                active={airdrop}
                onClick={() => setAirdrop(!airdrop)}
              />
              <ToggleTile
                icon={focus ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                label="Focus"
                sublabel={focus ? 'On' : 'Off'}
                active={focus}
                onClick={() => setFocus(!focus)}
                color="bg-[#5e5ce6]"
              />
            </div>

            {/* Display brightness */}
            <SliderTile
              icon={<Monitor className="w-4 h-4 text-white/80" />}
              label="Display"
              value={brightness}
              onChange={setBrightness}
            />

            {/* Sound volume */}
            <SliderTile
              icon={<Volume2 className="w-4 h-4 text-white/80" />}
              label="Sound"
              value={volume}
              onChange={setVolume}
            />

            {/* Now Playing */}
            {nowPlaying.playing && (
              <div className="p-3 bg-white/10 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-white/90 truncate">
                    {nowPlaying.title}
                  </div>
                  <div className="text-[11px] text-white/40 truncate">
                    {nowPlaying.artist}
                  </div>
                </div>
                {/* Mini play bars animation */}
                <div className="flex items-end gap-[2px] h-4 shrink-0">
                  {[3, 5, 2, 4].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] bg-[#0a84ff] rounded-full"
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
