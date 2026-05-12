'use client'

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMacOSStore, { APP_CONFIGS } from '@/store/macos-store'
import { useLaunchpad } from '@/components/macos/Launchpad'

// Magnification parameters
const ICON_SIZE = 52
const MAX_SCALE = 1.8
const MAGNIFICATION_RANGE = 150 // pixel range for magnification effect
const SIGMA = 70 // gaussian spread
const ICON_GAP = 6 // gap between icons (gap-1.5 = 6px)
const DOCK_PADDING_X = 16 // px-4 = 16px

// Shared squircle styles
const SQUIRCLE_RADIUS = '22.37%'

// Shared icon depth shadow
const ICON_DEPTH_SHADOW = {
  boxShadow: [
    'inset 0 1.5px 0 rgba(255,255,255,0.4)',
    'inset 0 -1px 0 rgba(0,0,0,0.15)',
    '0 2px 6px rgba(0,0,0,0.3)',
    '0 1px 2px rgba(0,0,0,0.2)',
  ].join(', '),
  border: '0.5px solid rgba(255,255,255,0.15)',
}

// Shine overlay gradient
const SHINE_OVERLAY = 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 45%, rgba(0,0,0,0.04) 100%)'

// --- Individual App Icon Components ---

function FinderIcon({ size }: { size: number }) {
  const eyeSize = Math.round(size * 0.09)
  const pupilSize = Math.round(size * 0.05)
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(135deg, #5AC8FA 0%, #4AA3DF 50%, #4A90D9 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Left/right split shading */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(90,200,250,0.6) 0%, rgba(90,200,250,0.6) 49.5%, rgba(74,144,217,0.6) 50.5%, rgba(74,144,217,0.6) 100%)', borderRadius: 'inherit' }} />
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Face */}
      <div className="relative z-10" style={{ width: size * 0.65, height: size * 0.6 }}>
        {/* Left eye */}
        <div className="absolute" style={{ left: '18%', top: '10%', width: eyeSize, height: eyeSize, borderRadius: '50%', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
          <div className="absolute" style={{ left: '30%', top: '25%', width: pupilSize, height: pupilSize, borderRadius: '50%', background: '#1a1a2e' }} />
        </div>
        {/* Right eye */}
        <div className="absolute" style={{ right: '18%', top: '10%', width: eyeSize, height: eyeSize, borderRadius: '50%', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
          <div className="absolute" style={{ left: '30%', top: '25%', width: pupilSize, height: pupilSize, borderRadius: '50%', background: '#1a1a2e' }} />
        </div>
        {/* Nose */}
        <div className="absolute" style={{ left: '50%', top: '35%', width: Math.round(size * 0.04), height: Math.round(size * 0.15), background: 'rgba(255,255,255,0.5)', transform: 'translateX(-50%)', borderRadius: '2px' }} />
        {/* Smile */}
        <div className="absolute" style={{ left: '50%', top: '55%', width: Math.round(size * 0.4), height: Math.round(size * 0.22), transform: 'translateX(-50%)', border: `${Math.round(size * 0.025)}px solid white`, borderTop: 'none', borderRadius: '0 0 50% 50%', borderColor: 'white', opacity: 0.9 }} />
      </div>
    </div>
  )
}

function SafariIcon({ size }: { size: number }) {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(135deg, #5CB8FF 0%, #4A9AE8 40%, #3678D8 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Compass ring */}
      <div className="relative z-10 rounded-full" style={{ width: size * 0.72, height: size * 0.72, border: `${Math.round(size * 0.03)}px solid rgba(255,255,255,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Tick marks at N, E, S, W */}
        {[0, 90, 180, 270].map((deg) => (
          <div key={deg} className="absolute" style={{ width: Math.round(size * 0.04), height: Math.round(size * 0.08), background: 'rgba(255,255,255,0.7)', transform: `rotate(${deg}deg) translateY(-${size * 0.3}px)`, borderRadius: '1px' }} />
        ))}
        {/* Red/white compass needle */}
        <div className="relative" style={{ width: size * 0.06, height: size * 0.4 }}>
          {/* North - red */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: 0, height: 0, borderLeft: `${Math.round(size * 0.04)}px solid transparent`, borderRight: `${Math.round(size * 0.04)}px solid transparent`, borderBottom: `${Math.round(size * 0.18)}px solid #FF3B30` }} />
          {/* South - white */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: 0, height: 0, borderLeft: `${Math.round(size * 0.04)}px solid transparent`, borderRight: `${Math.round(size * 0.04)}px solid transparent`, borderTop: `${Math.round(size * 0.18)}px solid white` }} />
        </div>
        {/* Center dot */}
        <div className="absolute rounded-full" style={{ width: Math.round(size * 0.06), height: Math.round(size * 0.06), background: 'white', boxShadow: '0 0 3px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  )
}

function NotesIcon({ size }: { size: number }) {
  const lineY = [0.32, 0.44, 0.56, 0.68]
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #FFD60A 0%, #FFC107 50%, #F5B800 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Top fold */}
      <div className="absolute" style={{ top: 0, left: 0, right: 0, height: size * 0.12, background: 'rgba(0,0,0,0.06)', borderRadius: 'inherit', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
      {/* Ruled lines */}
      <div className="relative z-10" style={{ width: size * 0.7, height: size * 0.7 }}>
        {lineY.map((y, i) => (
          <div key={i} className="absolute left-0 right-0" style={{ top: `${y * 100}%`, height: `${Math.max(1, Math.round(size * 0.02))}px`, background: i < 3 ? 'rgba(255,255,255,0.65)' : 'rgba(255,140,0,0.5)', borderRadius: '1px' }} />
        ))}
      </div>
    </div>
  )
}

function TerminalIcon({ size }: { size: number }) {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #2D2D2F 0%, #1D1D1F 50%, #141416 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Subtle top edge light */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%)', borderRadius: 'inherit' }} />
      {/* ">_" prompt */}
      <div className="relative z-10 flex items-baseline" style={{ fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace", fontSize: Math.round(size * 0.32), fontWeight: 700, color: '#00FF41', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>
        <span style={{ marginRight: Math.round(size * 0.02) }}>&gt;</span>
        <span style={{ opacity: 0.7, fontSize: Math.round(size * 0.28) }}>_</span>
      </div>
    </div>
  )
}

function CalculatorIcon({ size }: { size: number }) {
  const btnSize = Math.round(size * 0.14)
  const btnGap = Math.round(size * 0.05)
  const btnTop = Math.round(size * 0.38)
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #3a3a3e 0%, #333338 40%, #2c2c30 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Display area */}
      <div className="absolute" style={{ top: size * 0.06, left: size * 0.08, right: size * 0.08, height: size * 0.22, background: '#1a1a1e', borderRadius: Math.round(size * 0.04), display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: `0 ${Math.round(size * 0.06)}px` }}>
        <span style={{ fontFamily: "'SF Pro', 'Helvetica Neue', sans-serif", fontSize: Math.round(size * 0.22), fontWeight: 300, color: 'white', lineHeight: 1 }}>42</span>
      </div>
      {/* Button rows */}
      <div className="absolute" style={{ top: btnTop, left: size * 0.08, right: size * 0.08 }}>
        {/* Row 1: AC, +/-, %, ÷ */}
        <div className="flex" style={{ gap: btnGap, marginBottom: btnGap }}>
          {[{ bg: '#A5A5A5', text: 'AC' }, { bg: '#A5A5A5', text: '±' }, { bg: '#A5A5A5', text: '%' }, { bg: '#FF9500', text: '÷' }].map((btn, i) => (
            <div key={i} style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: btn.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: Math.round(size * 0.09), fontWeight: 600, color: btn.bg === '#A5A5A5' ? '#1c1c1e' : 'white' }}>{btn.text}</span>
            </div>
          ))}
        </div>
        {/* Row 2: 7, 8, 9, × */}
        <div className="flex" style={{ gap: btnGap, marginBottom: btnGap }}>
          {[{ bg: '#505050', text: '7' }, { bg: '#505050', text: '8' }, { bg: '#505050', text: '9' }, { bg: '#FF9500', text: '×' }].map((btn, i) => (
            <div key={i} style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: btn.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: Math.round(size * 0.09), fontWeight: 500, color: 'white' }}>{btn.text}</span>
            </div>
          ))}
        </div>
        {/* Row 3: 4, 5, 6, - */}
        <div className="flex" style={{ gap: btnGap, marginBottom: btnGap }}>
          {[{ bg: '#505050', text: '4' }, { bg: '#505050', text: '5' }, { bg: '#505050', text: '6' }, { bg: '#FF9500', text: '−' }].map((btn, i) => (
            <div key={i} style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: btn.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: Math.round(size * 0.09), fontWeight: 500, color: 'white' }}>{btn.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CalendarIcon({ size }: { size: number }) {
  const now = new Date()
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const dayName = dayNames[now.getDay()]
  const dayNum = now.getDate().toString()
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'white',
        ...ICON_DEPTH_SHADOW,
        border: '0.5px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Red top section */}
      <div className="absolute inset-x-0 top-0" style={{ height: size * 0.32, background: 'linear-gradient(180deg, #FF3B30 0%, #EF2B20 100%)', borderTopLeftRadius: SQUIRCLE_RADIUS, borderTopRightRadius: SQUIRCLE_RADIUS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'SF Pro', 'Helvetica Neue', sans-serif", fontSize: Math.round(size * 0.15), fontWeight: 700, color: 'white', letterSpacing: `${Math.round(size * 0.02)}px` }}>{dayName}</span>
      </div>
      {/* White bottom with day number */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: size * 0.68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'SF Pro', 'Helvetica Neue', sans-serif", fontSize: Math.round(size * 0.4), fontWeight: 300, color: '#1d1d1f', lineHeight: 1 }}>{dayNum}</span>
      </div>
      {/* Divider line */}
      <div className="absolute inset-x-0" style={{ top: size * 0.32, height: '0.5px', background: 'rgba(0,0,0,0.1)' }} />
    </div>
  )
}

function PhotosIcon({ size }: { size: number }) {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB347 20%, #FFE66D 40%, #4ECDC4 60%, #45B7D1 80%, #96E6A1 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Mountain silhouette */}
      <svg className="relative z-10" width={size * 0.75} height={size * 0.5} viewBox="0 0 100 60" fill="none">
        <path d="M5 55 L30 20 L45 35 L60 15 L80 40 L95 55 Z" fill="white" fillOpacity={0.85} />
        <path d="M5 55 L25 30 L35 40 L95 55 Z" fill="white" fillOpacity={0.5} />
      </svg>
      {/* Sun circle */}
      <div className="absolute" style={{ top: size * 0.12, right: size * 0.15, width: Math.round(size * 0.18), height: Math.round(size * 0.18), borderRadius: '50%', background: 'white', boxShadow: '0 0 6px rgba(255,255,255,0.6)' }} />
    </div>
  )
}

function MusicIcon({ size }: { size: number }) {
  const arcWidth = Math.round(size * 0.06)
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(135deg, #FC3C44 0%, #FF2D55 60%, #E02040 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Sound wave arcs */}
      <div className="absolute" style={{ top: '50%', left: '45%', transform: 'translate(-50%, -50%)' }}>
        {[0.25, 0.38, 0.5].map((s, i) => (
          <div key={i} className="absolute" style={{ width: size * s, height: size * s, borderRadius: '50%', border: `${arcWidth}px solid rgba(255,255,255,${0.15 + i * 0.05})`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', clipPath: 'inset(0 0 50% 50%)' }} />
        ))}
      </div>
      {/* Music note ♪ */}
      <div className="relative z-10" style={{ fontSize: Math.round(size * 0.42), color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.3)', lineHeight: 1 }}>
        ♪
      </div>
    </div>
  )
}

function SettingsIcon({ size }: { size: number }) {
  const gearSize = Math.round(size * 0.55)
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #8E8E93 0%, #727276 50%, #636366 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Gear icon using CSS */}
      <div className="relative z-10" style={{ width: gearSize, height: gearSize }}>
        {/* Outer gear teeth */}
        <svg width={gearSize} height={gearSize} viewBox="0 0 100 100" fill="none">
          <path
            d="M50 8 L56 20 L70 14 L68 28 L82 30 L74 42 L88 50 L74 58 L82 70 L68 72 L70 86 L56 80 L50 92 L44 80 L30 86 L32 72 L18 70 L26 58 L12 50 L26 42 L18 30 L32 28 L30 14 L44 20 Z"
            fill="rgba(255,255,255,0.9)"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1"
          />
          <circle cx="50" cy="50" r="18" fill="#8E8E93" />
          <circle cx="50" cy="50" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  )
}

function ClockIcon({ size }: { size: number }) {
  const now = new Date()
  const hours = now.getHours() % 12
  const minutes = now.getMinutes()
  const hourAngle = (hours * 30) + (minutes * 0.5) // 360/12 = 30 per hour
  const minuteAngle = minutes * 6 // 360/60 = 6 per minute
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #1c1c1e 0%, #000000 50%, #0a0a0a 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Subtle top light */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 30%)', borderRadius: 'inherit' }} />
      {/* Clock face */}
      <div className="relative z-10 rounded-full" style={{ width: size * 0.72, height: size * 0.72, background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
        {/* Hour markers at 12, 3, 6, 9 */}
        {[0, 90, 180, 270].map((deg) => (
          <div key={deg} className="absolute" style={{ width: Math.round(size * 0.025), height: Math.round(size * 0.07), background: '#1c1c1e', left: '50%', top: '8%', transformOrigin: `50% ${size * 0.36}px`, transform: `translateX(-50%) rotate(${deg}deg)` }} />
        ))}
        {/* Small tick marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = i * 30
          if (deg % 90 === 0) return null
          return (
            <div key={`tick-${i}`} className="absolute" style={{ width: Math.round(size * 0.012), height: Math.round(size * 0.04), background: '#666', left: '50%', top: '10%', transformOrigin: `50% ${size * 0.35}px`, transform: `translateX(-50%) rotate(${deg}deg)` }} />
          )
        })}
        {/* Hour hand */}
        <div className="absolute" style={{ left: '50%', bottom: '50%', width: Math.round(size * 0.04), height: size * 0.2, background: '#1c1c1e', borderRadius: '2px', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${hourAngle}deg)` }} />
        {/* Minute hand */}
        <div className="absolute" style={{ left: '50%', bottom: '50%', width: Math.round(size * 0.025), height: size * 0.27, background: '#1c1c1e', borderRadius: '2px', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${minuteAngle}deg)` }} />
        {/* Center dot */}
        <div className="absolute rounded-full" style={{ width: Math.round(size * 0.05), height: Math.round(size * 0.05), background: '#FF3B30', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>
    </div>
  )
}

function WeatherIcon({ size }: { size: number }) {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #4A90D9 0%, #3478B2 50%, #2A6A9E 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Sky gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #5BA0E8 0%, #4A90D9 40%, #3A7CC4 70%, #2A6A9E 100%)', borderRadius: 'inherit' }} />
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Sun in top-right */}
      <div className="absolute" style={{ top: size * 0.1, right: size * 0.12, width: Math.round(size * 0.28), height: Math.round(size * 0.28), borderRadius: '50%', background: 'radial-gradient(circle, #FFE066 0%, #FFD60A 40%, #FFC107 100%)', boxShadow: '0 0 8px rgba(255,214,10,0.5)' }} />
      {/* White cloud in bottom-left */}
      <div className="absolute" style={{ bottom: size * 0.1, left: size * 0.08 }}>
        <div className="relative" style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.28) }}>
          <div className="absolute rounded-full" style={{ width: Math.round(size * 0.28), height: Math.round(size * 0.28), background: 'white', left: '10%', bottom: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
          <div className="absolute rounded-full" style={{ width: Math.round(size * 0.22), height: Math.round(size * 0.22), background: 'white', left: '30%', bottom: '20%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
          <div className="absolute rounded-full" style={{ width: Math.round(size * 0.32), height: Math.round(size * 0.28), background: 'white', right: 0, bottom: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
          <div className="absolute" style={{ bottom: 0, left: '5%', right: 0, height: Math.round(size * 0.15), background: 'white', borderRadius: `0 0 ${Math.round(size * 0.05)}px ${Math.round(size * 0.05)}px` }} />
        </div>
      </div>
    </div>
  )
}

function MapsIcon({ size }: { size: number }) {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(135deg, #5ED87A 0%, #4CD964 40%, #34C759 70%, #2DB84D 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Road lines */}
      <div className="absolute" style={{ left: '50%', top: 0, bottom: 0, width: Math.round(size * 0.04), background: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }} />
      <div className="absolute" style={{ top: '50%', left: 0, right: 0, height: Math.round(size * 0.04), background: 'rgba(255,255,255,0.4)', transform: 'translateY(-50%)' }} />
      {/* Folded corner effect */}
      <div className="absolute" style={{ top: 0, right: 0, width: size * 0.3, height: size * 0.3 }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: `${Math.round(size * 0.3)}px solid rgba(255,255,255,0.25)`, borderLeft: `${Math.round(size * 0.3)}px solid transparent` }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderRight: `${Math.round(size * 0.22)}px solid rgba(0,0,0,0.08)`, borderBottom: `${Math.round(size * 0.22)}px solid transparent` }} />
      </div>
      {/* Blue water area */}
      <div className="absolute" style={{ bottom: size * 0.08, left: size * 0.08, width: size * 0.25, height: size * 0.2, background: 'rgba(90,170,230,0.5)', borderRadius: '30%', transform: 'rotate(-10deg)' }} />
    </div>
  )
}

function RemindersIcon({ size }: { size: number }) {
  const barH = Math.round(size * 0.1)
  const barGap = Math.round(size * 0.06)
  const barColors = ['#007AFF', '#FF9500', '#34C759']
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F2F2F7 50%, #E5E5EA 100%)',
        ...ICON_DEPTH_SHADOW,
        border: '0.5px solid rgba(0,0,0,0.1)',
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 40%)', borderRadius: 'inherit' }} />
      {/* Colored bars */}
      <div className="absolute" style={{ top: size * 0.18, left: size * 0.15, right: size * 0.15 }}>
        {barColors.map((color, i) => (
          <div key={i} className="flex items-center" style={{ marginBottom: barGap }}>
            {/* Checkbox circle */}
            <div style={{ width: Math.round(size * 0.08), height: Math.round(size * 0.08), borderRadius: '50%', border: `${Math.round(size * 0.015)}px solid ${color}`, marginRight: Math.round(size * 0.06), flexShrink: 0 }} />
            {/* Colored bar */}
            <div style={{ height: barH, background: color, borderRadius: Math.round(size * 0.02), flex: 1, opacity: 0.7 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TextEditIcon({ size }: { size: number }) {
  const lineY = [0.3, 0.42, 0.54, 0.66, 0.78]
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 50%, #E8E8E8 100%)',
        ...ICON_DEPTH_SHADOW,
        border: '0.5px solid rgba(0,0,0,0.1)',
      }}
    >
      {/* Top bar with "A" */}
      <div className="absolute" style={{ top: size * 0.06, left: size * 0.12 }}>
        <span style={{ fontFamily: "'SF Pro', 'Helvetica Neue', sans-serif", fontSize: Math.round(size * 0.18), fontWeight: 700, color: '#333' }}>A</span>
      </div>
      {/* Pencil */}
      <div className="absolute" style={{ top: size * 0.08, right: size * 0.1, width: Math.round(size * 0.06), height: Math.round(size * 0.2), background: '#FFCC02', borderRadius: '1px', transform: 'rotate(-30deg)', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '25%', background: '#FFD60A', borderRadius: '0 0 1px 1px' }} />
        <div style={{ position: 'absolute', top: '-3px', left: '20%', right: '20%', height: '20%', background: '#F5A623', clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
      </div>
      {/* Text lines */}
      <div className="absolute" style={{ top: size * 0.28, left: size * 0.12, right: size * 0.12 }}>
        {lineY.map((_, i) => (
          <div key={i} style={{ height: Math.max(1, Math.round(size * 0.018)), background: 'rgba(0,0,0,0.15)', borderRadius: '1px', marginBottom: Math.round(size * 0.05), width: i === 4 ? '60%' : '100%' }} />
        ))}
      </div>
    </div>
  )
}

function TrashIcon({ size }: { size: number }) {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(180deg, #9E9EA3 0%, #8E8E93 30%, #7C7C81 70%, #636366 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Shine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: SHINE_OVERLAY, borderRadius: 'inherit' }} />
      {/* Trash can body */}
      <div className="relative z-10" style={{ width: size * 0.48, height: size * 0.55 }}>
        {/* Lid */}
        <div style={{ position: 'absolute', top: 0, left: '-8%', right: '-8%', height: size * 0.12, background: 'linear-gradient(180deg, #C8C8CC 0%, #AEAEB2 100%)', borderRadius: `${Math.round(size * 0.03)}px ${Math.round(size * 0.03)}px 0 0`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }} />
        {/* Lid handle */}
        <div style={{ position: 'absolute', top: -size * 0.04, left: '30%', right: '30%', height: size * 0.05, background: 'linear-gradient(180deg, #C8C8CC 0%, #AEAEB2 100%)', borderRadius: `${Math.round(size * 0.02)}px ${Math.round(size * 0.02)}px 0 0` }} />
        {/* Can body */}
        <div style={{ position: 'absolute', top: size * 0.13, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #AEAEB2 0%, #8E8E93 50%, #7C7C81 100%)', borderRadius: `0 0 ${Math.round(size * 0.04)}px ${Math.round(size * 0.04)}px`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
          {/* Vertical lines on body */}
          {[0.25, 0.45, 0.65, 0.8].map((y, i) => (
            <div key={i} style={{ position: 'absolute', top: `${y * 100}%`, left: '10%', right: '10%', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LaunchpadIcon({ size }: { size: number }) {
  const dotSize = Math.round(size * 0.1)
  const gap = Math.round(size * 0.06)
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55', '#8E8E93']
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: SQUIRCLE_RADIUS,
        background: 'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 50%, #141416 100%)',
        ...ICON_DEPTH_SHADOW,
      }}
    >
      {/* Subtle top edge light */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 25%)', borderRadius: 'inherit' }} />
      {/* 3x3 grid of colored dots */}
      <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'grid', gridTemplateColumns: `repeat(3, ${dotSize}px)`, gap: `${gap}px` }}>
        {colors.map((color, i) => (
          <div key={i} style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: color, boxShadow: `0 0 ${Math.round(size * 0.02)}px ${color}40` }} />
        ))}
      </div>
    </div>
  )
}

// Icon rendering function — dispatches to app-specific components
function DockAppIcon({ appId, size }: { appId: string; size: number }) {
  switch (appId) {
    case 'finder':
      return <FinderIcon size={size} />
    case 'safari':
      return <SafariIcon size={size} />
    case 'notes':
      return <NotesIcon size={size} />
    case 'terminal':
      return <TerminalIcon size={size} />
    case 'calculator':
      return <CalculatorIcon size={size} />
    case 'calendar':
      return <CalendarIcon size={size} />
    case 'photos':
      return <PhotosIcon size={size} />
    case 'music':
      return <MusicIcon size={size} />
    case 'settings':
      return <SettingsIcon size={size} />
    case 'clock':
      return <ClockIcon size={size} />
    case 'weather':
      return <WeatherIcon size={size} />
    case 'maps':
      return <MapsIcon size={size} />
    case 'reminders':
      return <RemindersIcon size={size} />
    case 'textedit':
      return <TextEditIcon size={size} />
    case 'trash':
      return <TrashIcon size={size} />
    case 'launchpad':
      return <LaunchpadIcon size={size} />
    default:
      return (
        <div
          className="flex items-center justify-center"
          style={{
            width: size,
            height: size,
            borderRadius: SQUIRCLE_RADIUS,
            background: 'linear-gradient(135deg, #9E9E9E, #757575)',
            ...ICON_DEPTH_SHADOW,
          }}
        >
          <span className="text-white text-xs">?</span>
        </div>
      )
  }
}

// Trash config (not in APP_CONFIGS since it's not an app)
const TRASH_CONFIG = { id: 'trash', name: 'Trash', icon: 'trash' }

interface DockIconProps {
  appId: string
  icon: string
  name: string
  scale: number
  isRunning: boolean
  isBouncing: boolean
  onClick: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
  onContextMenu: (e: React.MouseEvent) => void
  isTrash?: boolean
}

function DockIcon({
  appId,
  scale,
  name,
  isRunning,
  isBouncing,
  onClick,
  onHoverStart,
  onHoverEnd,
  onContextMenu,
  isTrash = false,
}: DockIconProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const currentSize = ICON_SIZE * scale

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => {
        setShowTooltip(true)
        onHoverStart()
      }}
      onMouseLeave={() => {
        setShowTooltip(false)
        onHoverEnd()
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-gray-800/90 px-4 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md"
          >
            {name}
            {/* Caret/arrow pointing down to the icon */}
            <div className="absolute -bottom-[5px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-gray-800/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.button
        onClick={onClick}
        onContextMenu={onContextMenu}
        aria-label={name}
        animate={{
          width: currentSize,
          height: currentSize,
          scale: isBouncing ? [1, 1.1, 0.95, 1.05, 1] : 1,
        }}
        transition={
          isBouncing
            ? {
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }
            : {
                type: 'spring',
                stiffness: 500,
                damping: 18,
                mass: 0.6,
              }
        }
        className="flex items-center justify-center rounded-[12px] transition-shadow duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        style={{
          background: isTrash
            ? 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15)',
          padding: 0,
        }}
      >
        <DockAppIcon appId={appId} size={currentSize * 0.85} />
      </motion.button>

      {/* Running indicator dot with gentle glow pulse */}
      {isRunning && !isTrash && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            boxShadow: [
              '0 0 2px rgba(255,255,255,0.4)',
              '0 0 6px rgba(255,255,255,0.6)',
              '0 0 2px rgba(255,255,255,0.4)',
            ]
          }}
          transition={{
            scale: { type: 'spring', stiffness: 400, damping: 25 },
            boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="mt-0.5 h-[4px] w-[4px] rounded-full bg-white/80"
        />
      )}
    </div>
  )
}

// Dock Context Menu component
function DockContextMenu({
  x,
  y,
  appId,
  isTrash,
  onClose,
}: {
  x: number
  y: number
  appId: string
  isTrash: boolean
  onClose: () => void
}) {
  const openApp = useMacOSStore((s) => s.openApp)

  const appMenuItems = [
    { label: 'Options', disabled: true },
    { label: 'Keep in Dock', action: () => {} },
    { label: 'Open at Login', action: () => {} },
    { label: 'Show All Windows', action: () => {} },
    { separator: true, label: '' },
    { label: 'Open', action: () => { openApp(appId); onClose() } },
  ]

  const trashMenuItems = [
    { label: 'Open', action: () => { onClose() } },
    { label: 'Empty Trash', action: () => { onClose() } },
    { separator: true, label: '' },
    { label: 'Get Info', action: () => { onClose() } },
  ]

  const items = isTrash ? trashMenuItems : appMenuItems

  // Adjust position so menu doesn't go off-screen
  const menuWidth = 180
  const menuHeight = items.length * 28
  const adjustedX = Math.min(x - menuWidth / 2, window.innerWidth - menuWidth - 8)
  const adjustedY = Math.max(28, y - menuHeight - 8)

  return (
    <>
      {/* Backdrop to catch clicks outside */}
      <div className="fixed inset-0 z-[10001]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className="fixed z-[10002] w-[180px] bg-[#2a2a2e]/95 backdrop-blur-2xl rounded-md border border-white/[0.12] py-1 shadow-2xl"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {items.map((item, idx) => {
          if (item.separator) {
            return <div key={`sep-${idx}`} className="h-px bg-white/10 mx-2 my-1" />
          }
          return (
            <button
              key={item.label}
              className={`w-full text-left px-3 py-[3px] text-[13px] text-white/90 hover:bg-[#0060df] hover:text-white rounded-[4px] mx-1 flex items-center transition-colors ${
                item.disabled ? 'opacity-40 pointer-events-none' : ''
              }`}
              style={{ width: 'calc(100% - 8px)' }}
              onClick={item.action}
            >
              {item.label}
            </button>
          )
        })}
      </motion.div>
    </>
  )
}

export default function Dock() {
  const dockApps = useMacOSStore((s) => s.dockApps)
  const openApps = useMacOSStore((s) => s.openApps)
  const openApp = useMacOSStore((s) => s.openApp)
  const dockRef = useRef<HTMLDivElement>(null)

  // Mouse tracking state (updated via events, not ref access during render)
  const [mouseX, setMouseX] = useState<number | null>(null)
  const [dockRect, setDockRect] = useState<DOMRect | null>(null)
  const [bouncingApp, setBouncingApp] = useState<string | null>(null)
  const [dockContextMenu, setDockContextMenu] = useState<{ x: number; y: number; appId: string; isTrash: boolean } | null>(null)

  // All dock items: apps + trash
  const dockItems = useMemo(
    () => [
      ...dockApps
        .map((id) => {
          const config = APP_CONFIGS[id]
          return config ? { id: config.id, icon: config.icon, name: config.name, isTrash: false } : null
        })
        .filter(Boolean),
      { ...TRASH_CONFIG, isTrash: true },
    ],
    [dockApps]
  )

  // Calculate scales based on mouseX and dockRect from state
  const scales = useMemo(() => {
    if (mouseX === null || !dockRect) {
      return dockItems.map(() => 1)
    }

    return dockItems.map((_, index) => {
      const separatorWidth = dockItems[dockItems.length - 1]?.isTrash ? 1 + 8 : 0
      const itemsBeforeTrash = dockItems.length - 1

      let iconCenterX: number
      if (index < itemsBeforeTrash) {
        iconCenterX = dockRect.left + DOCK_PADDING_X + index * (ICON_SIZE + ICON_GAP) + ICON_SIZE / 2
      } else {
        const trashStartX =
          dockRect.left +
          DOCK_PADDING_X +
          itemsBeforeTrash * (ICON_SIZE + ICON_GAP) -
          ICON_GAP +
          separatorWidth +
          ICON_GAP
        iconCenterX = trashStartX + ICON_SIZE / 2
      }

      const distance = Math.abs(mouseX - iconCenterX)

      if (distance > MAGNIFICATION_RANGE) return 1

      const gaussian = Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA))
      return 1 + (MAX_SCALE - 1) * gaussian
    })
  }, [mouseX, dockRect, dockItems])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX)
    if (dockRef.current) {
      setDockRect(dockRef.current.getBoundingClientRect())
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseX(null)
  }, [])

  const { toggle: toggleLaunchpad } = useLaunchpad()

  const handleClick = useCallback(
    (appId: string, isTrash: boolean) => {
      if (isTrash) return
      if (appId === 'launchpad') {
        toggleLaunchpad()
        return
      }
      setBouncingApp(appId)
      setTimeout(() => setBouncingApp(null), 1200)
      openApp(appId)
    },
    [openApp, toggleLaunchpad]
  )

  // Keep dockRect updated on mount
  useEffect(() => {
    if (dockRef.current) {
      setDockRect(dockRef.current.getBoundingClientRect())
    }
    const handleResize = () => {
      if (dockRef.current) {
        setDockRect(dockRef.current.getBoundingClientRect())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="fixed bottom-3 left-1/2 z-[9999] -translate-x-1/2">
      <motion.div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-end gap-1.5 overflow-visible rounded-[18px] px-4 pb-2.5 pt-2 shadow-2xl shadow-black/20 backdrop-blur-3xl"
        style={{
          background: 'rgba(30, 30, 30, 0.35)',
          border: '0.5px solid rgba(255,255,255,0.15)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px',
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.3 }}
      >
        {/* Subtle top highlight/reflection shine */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 15%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.35) 85%, transparent)',
          }}
        />
        {/* Subtle gradient reflection below the highlight line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[1px] h-6"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)',
          }}
        />
        {/* Bottom reflection/shine gradient */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-5 rounded-b-[18px]"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06))',
          }}
        />

        {dockItems.map((item, index) => {
          if (!item) return null

          const isTrash = item.isTrash
          const scale = scales[index] ?? 1
          const isRunning = openApps.includes(item.id)

          return (
            <React.Fragment key={item.id}>
              {/* Separator before Trash */}
              {isTrash && (
                <div
                  className="mx-1.5 h-10 w-[1px] self-center"
                  style={{
                    background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.25) 20%, rgba(255,255,255,0.25) 80%, transparent)',
                    boxShadow: '0 0 6px rgba(255,255,255,0.08), 0 0 2px rgba(255,255,255,0.15)',
                  }}
                />
              )}
              <DockIcon
                appId={item.id}
                icon={item.icon}
                name={item.name}
                scale={scale}
                isRunning={isRunning}
                isBouncing={bouncingApp === item.id}
                onClick={() => handleClick(item.id, isTrash)}
                onHoverStart={() => {}}
                onHoverEnd={() => {}}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setDockContextMenu({ x: e.clientX, y: e.clientY, appId: item.id, isTrash })
                }}
                isTrash={isTrash}
              />
            </React.Fragment>
          )
        })}
      </motion.div>

      {/* Right-click context menu */}
      <AnimatePresence>
        {dockContextMenu && (
          <DockContextMenu
            x={dockContextMenu.x}
            y={dockContextMenu.y}
            appId={dockContextMenu.appId}
            isTrash={dockContextMenu.isTrash}
            onClose={() => setDockContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
