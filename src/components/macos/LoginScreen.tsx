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

// --- Apple Logo SVG (more detailed/realistic) ---
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 814 1000"
      fill="currentColor"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.8c-58.8-82.7-106.3-211.3-106.3-334.6 0-196.5 127.9-300.7 253.5-300.7 66.8 0 122.4 43.8 164.3 43.8 39.5 0 101.1-46.4 176.3-46.4 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8.6 15.6 1.3 18.2 2.6.6 6.4 1.3 10.2 1.3 45.4 0 102.5-30.4 139.5-71.4z" />
    </svg>
  )
}

// --- Boot Phase ---
function BootPhase({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 2500 // 2.5 seconds (slightly faster)
    const interval = 30
    const steps = duration / interval
    let current = 0

    const timer = setInterval(() => {
      current++
      // Ease-out progress for more natural feel
      const rawProgress = current / steps
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2.5)
      setProgress(Math.min(easedProgress * 100, 100))

      if (current >= steps) {
        clearInterval(timer)
        setTimeout(onComplete, 200)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Apple Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
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
  const hasInteracted = useRef(false)
  const autoLoginTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProgrammaticFocus = useRef(false)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = useCallback(() => {
    if (isLoggingIn) return
    setIsLoggingIn(true)
    if (autoLoginTimer.current) {
      clearTimeout(autoLoginTimer.current)
    }
    setTimeout(onLogin, 300)
  }, [onLogin, isLoggingIn])

  const handleInteraction = useCallback(() => {
    hasInteracted.current = true
    if (autoLoginTimer.current) {
      clearTimeout(autoLoginTimer.current)
    }
  }, [])

  // Focus password input after animation (without triggering handleInteraction)
  useEffect(() => {
    const timer = setTimeout(() => {
      isProgrammaticFocus.current = true
      inputRef.current?.focus()
      // Reset flag after focus event fires
      setTimeout(() => { isProgrammaticFocus.current = false }, 100)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Auto-login after 1.5 seconds if user hasn't interacted
  useEffect(() => {
    autoLoginTimer.current = setTimeout(() => {
      if (!hasInteracted.current) {
        handleLogin()
      }
    }, 1500)

    return () => {
      if (autoLoginTimer.current) {
        clearTimeout(autoLoginTimer.current)
      }
    }
  }, [handleLogin])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleInteraction()
      if (e.key === 'Enter') {
        e.preventDefault()
        handleLogin()
      }
    },
    [handleLogin, handleInteraction]
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
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
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
      transition={{ duration: 0.6, ease: 'easeInOut' }}
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-xl shadow-black/40 ring-1 ring-white/10 ring-offset-2 ring-offset-transparent">
            <User className="w-12 h-12 text-white/80" />
          </div>
        </motion.div>

        {/* User account name */}
        <motion.div
          className="text-white text-lg font-semibold tracking-wide"
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
            onChange={(e) => {
              handleInteraction()
              setPassword(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!isProgrammaticFocus.current) handleInteraction()
            }}
            className="w-60 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm placeholder:text-white/40 outline-none focus:border-white/50 focus:bg-white/20 transition-all text-center"
          />
        </motion.div>

        {/* Login hint */}
        <motion.div variants={itemVariants}>
          <button
            onClick={() => {
              handleInteraction()
              handleLogin()
            }}
            className="text-white/40 text-[11px] hover:text-white/70 transition-colors cursor-pointer"
          >
            Press Return to Login
          </button>
        </motion.div>

        {/* Bottom actions */}
        <motion.div className="flex items-center gap-6 mt-2" variants={itemVariants}>
          <button
            className="text-white/30 text-[11px] hover:text-white/60 transition-colors cursor-pointer"
            onClick={handleInteraction}
          >
            Sleep
          </button>
          <button
            className="text-white/30 text-[11px] hover:text-white/60 transition-colors cursor-pointer"
            onClick={handleInteraction}
          >
            Restart
          </button>
          <button
            className="text-white/30 text-[11px] hover:text-white/60 transition-colors cursor-pointer"
            onClick={handleInteraction}
          >
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
    setVisible(false)
    setTimeout(() => {
      login()
    }, 600)
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
          transition={{ duration: 0.6, ease: 'easeInOut' }}
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
