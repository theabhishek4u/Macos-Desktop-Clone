'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'

// --- Shared login state (module-level) ---
interface LoginState {
  isLoggedIn: boolean
}

const loginState: LoginState = { isLoggedIn: false }
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(l => l())
}

export function useLoginScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(loginState.isLoggedIn)

  useEffect(() => {
    const listener = () => setIsLoggedIn(loginState.isLoggedIn)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const login = useCallback(() => {
    loginState.isLoggedIn = true
    emitChange()
  }, [])

  return { isLoggedIn, login }
}

// --- Apple Logo SVG (same as MenuBar) ---
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 170 170"
      fill="currentColor"
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.75-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.04 3.69-6.27 8.6-11.23 14.76-14.88 6.15-3.65 12.8-5.51 19.97-5.63 3.92 0 9.06 1.21 15.43 3.6 6.36 2.4 10.44 3.62 12.24 3.62 1.34 0 5.87-1.43 13.56-4.28 7.27-2.64 13.41-3.74 18.44-3.32 13.63 1.1 23.87 6.47 30.68 16.15-12.2 7.39-18.22 17.73-18.1 31 0.12 10.33 3.86 18.93 11.19 25.77 3.33 3.17 7.05 5.62 11.18 7.37-.9 2.6-1.84 5.09-2.85 7.47zM119.1 7.01c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37a25.2 25.2 0 0 1-.19-3.07c0-7.78 3.39-16.1 9.4-22.9 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.75.13 1.11.17 2.22.17 3.28z" />
    </svg>
  )
}

// --- Boot Phase ---
function BootPhase({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 3000 // 3 seconds
    const interval = 30 // Update every 30ms for smooth animation
    const steps = duration / interval
    let current = 0

    const timer = setInterval(() => {
      current++
      // Ease-out progress for more natural feel
      const rawProgress = current / steps
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2)
      setProgress(Math.min(easedProgress * 100, 100))

      if (current >= steps) {
        clearInterval(timer)
        // Small delay after reaching 100% before transitioning
        setTimeout(onComplete, 300)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Apple Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <AppleLogo className="w-16 h-16 text-white" />
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="mt-8 w-48 h-[4px] bg-white/20 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          className="h-full bg-white rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.03 }}
        />
      </motion.div>
    </motion.div>
  )
}

// --- Login Phase ---
function LoginPhase({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Focus password input after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = useCallback(() => {
    setIsLoggingIn(true)
    // Small delay for visual feedback before transitioning
    setTimeout(onLogin, 200)
  }, [onLogin])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleLogin()
      }
    },
    [handleLogin]
  )

  // Format time as HH:MM
  const timeStr = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  // Stagger animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        background: [
          'radial-gradient(ellipse 120% 60% at 50% 100%, #d4a24e 0%, #c4883a 20%, #a06a2a 40%, transparent 70%)',
          'radial-gradient(ellipse 80% 40% at 30% 95%, #e8b84d 0%, #cc8c2e 50%, transparent 80%)',
          'radial-gradient(ellipse 80% 40% at 75% 98%, #d9a040 0%, #b87d2a 50%, transparent 80%)',
          'radial-gradient(ellipse 100% 50% at 50% 60%, #6b3a1f 0%, #4a2512 40%, transparent 80%)',
          'linear-gradient(180deg, #1a0a2e 0%, #2d1548 15%, #6b2f4a 30%, #a84832 50%, #cc7a2e 65%, #d4a24e 80%, #e8c86e 100%)',
        ].join(', '),
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoggingIn ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Blur overlay for readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Status bar (top-right) */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <span className="text-white/50 text-[11px]">Wi-Fi</span>
        <span className="text-white/50 text-[11px]">🔋</span>
        <span className="text-white/60 text-[12px] font-medium">{timeStr}</span>
      </div>

      {/* Current Time */}
      <motion.div
        className="relative z-10 text-center mb-auto mt-[18%]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-8xl font-thin text-white/90 tracking-wider"
          style={{ fontFeatureSettings: '"tnum"' }}
          variants={itemVariants}
        >
          {timeStr}
        </motion.div>
        <motion.div
          className="text-lg font-light text-white/60 mt-1"
          variants={itemVariants}
        >
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.div>
      </motion.div>

      {/* User Info & Password */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Avatar */}
        <motion.div variants={itemVariants}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-xl shadow-black/40 ring-1 ring-white/10">
            <User className="w-12 h-12 text-white/80" />
          </div>
        </motion.div>

        {/* Username */}
        <motion.div
          className="text-white text-lg font-medium tracking-wide"
          variants={itemVariants}
        >
          User
        </motion.div>

        {/* Password Input */}
        <motion.div variants={itemVariants}>
          <input
            ref={inputRef}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-60 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm placeholder:text-white/40 outline-none focus:border-white/50 focus:bg-white/20 transition-all text-center"
          />
        </motion.div>

        {/* Login hint */}
        <motion.div variants={itemVariants}>
          <button
            onClick={handleLogin}
            className="text-white/40 text-[11px] hover:text-white/70 transition-colors cursor-pointer"
          >
            Press Return to Login
          </button>
        </motion.div>

        {/* Bottom actions */}
        <motion.div className="flex items-center gap-6 mt-2" variants={itemVariants}>
          <button className="text-white/30 text-[11px] hover:text-white/60 transition-colors cursor-pointer">
            Sleep
          </button>
          <button className="text-white/30 text-[11px] hover:text-white/60 transition-colors cursor-pointer">
            Restart
          </button>
          <button className="text-white/30 text-[11px] hover:text-white/60 transition-colors cursor-pointer">
            Shut Down
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// --- Main LoginScreen Component ---
export default function LoginScreen() {
  const { isLoggedIn, login } = useLoginScreen()
  const [phase, setPhase] = useState<'boot' | 'login'>('boot')
  const [visible, setVisible] = useState(true)

  const handleBootComplete = useCallback(() => {
    setPhase('login')
  }, [])

  const handleLogin = useCallback(() => {
    // Start fade out
    setVisible(false)
    // Wait for animation to complete, then mark as logged in
    setTimeout(() => {
      login()
    }, 500)
  }, [login])

  // Don't render anything if already logged in
  if (isLoggedIn) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[999999]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {phase === 'boot' ? (
              <BootPhase key="boot" onComplete={handleBootComplete} />
            ) : (
              <LoginPhase key="login" onLogin={handleLogin} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
