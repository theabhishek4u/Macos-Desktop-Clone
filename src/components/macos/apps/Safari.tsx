'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Plus,
  X,
  Share2,
  LayoutGrid,
  Lock,
  Search,
  Star,
  Laptop,
  Smartphone,
  Watch,
  Headphones,
  Monitor,
  Cpu,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tab {
  id: string
  title: string
  url: string
  favicon: string
  isLoading: boolean
  loadingProgress: number
}

interface BookmarkItem {
  name: string
  url: string
  favicon: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BOOKMARKS: BookmarkItem[] = [
  { name: 'Apple', url: 'apple.com', favicon: '' },
  { name: 'GitHub', url: 'github.com', favicon: '' },
  { name: 'Wikipedia', url: 'wikipedia.org', favicon: '' },
  { name: 'Google', url: 'google.com', favicon: '' },
  { name: 'YouTube', url: 'youtube.com', favicon: '' },
  { name: 'Reddit', url: 'reddit.com', favicon: '' },
]

interface FaviconConfig {
  letter?: string
  bgColor: string
  textColor?: string
  borderColor?: string
  icon?: 'apple' | 'github'
}

const FAVICON_CONFIG: Record<string, FaviconConfig> = {
  'apple.com': { bgColor: '#A2AAAD', icon: 'apple' },
  'google.com': { letter: 'G', bgColor: '#4285F4' },
  'youtube.com': { letter: '▶', bgColor: '#FF0000' },
  'github.com': { bgColor: '#24292e', icon: 'github' },
  'wikipedia.org': { letter: 'W', bgColor: '#ffffff', textColor: '#333333', borderColor: '#cccccc' },
  'reddit.com': { letter: 'R', bgColor: '#FF4500' },
}

const FAVICON_MAP: Record<string, string> = {
  'apple.com': 'apple',
  'google.com': 'google',
  'youtube.com': 'youtube',
  'github.com': 'github',
  'wikipedia.org': 'wikipedia',
  'reddit.com': 'reddit',
}

const PAGE_TITLES: Record<string, string> = {
  'apple.com': 'Apple',
  'google.com': 'Google',
  'youtube.com': 'YouTube',
  'github.com': 'GitHub',
  'wikipedia.org': 'macOS — Wikipedia',
  'reddit.com': 'Reddit',
  'localhost:3000': 'Safari Start Page',
}

let tabCounter = 0

function generateTabId(): string {
  tabCounter++
  return `tab-${tabCounter}-${Date.now()}`
}

function FaviconIcon({ url, size = 'default' }: { url: string; size?: 'default' | 'small' }) {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  let config: FaviconConfig | undefined

  if (normalized.includes('apple')) config = FAVICON_CONFIG['apple.com']
  else if (normalized.includes('google')) config = FAVICON_CONFIG['google.com']
  else if (normalized.includes('youtube')) config = FAVICON_CONFIG['youtube.com']
  else if (normalized.includes('github')) config = FAVICON_CONFIG['github.com']
  else if (normalized.includes('wikipedia')) config = FAVICON_CONFIG['wikipedia.org']
  else if (normalized.includes('reddit')) config = FAVICON_CONFIG['reddit.com']

  if (!config) {
    return <Globe size={size === 'small' ? 12 : 16} className="text-gray-400" />
  }

  const dim = size === 'small' ? 16 : 28
  const fontSize = size === 'small' ? 9 : 14

  // SVG icons for Apple and GitHub
  const appleIcon = (
    <svg viewBox="0 0 170 170" fill="currentColor" style={{ width: dim * 0.6, height: dim * 0.6 }}>
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.75-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.04 3.69-6.27 8.6-11.23 14.76-14.88 6.15-3.65 12.8-5.51 19.97-5.63 3.92 0 9.06 1.21 15.43 3.6 6.36 2.4 10.44 3.62 12.24 3.62 1.34 0 5.87-1.43 13.56-4.28 7.27-2.64 13.41-3.74 18.44-3.32 13.63 1.1 23.87 6.47 30.68 16.15-12.2 7.39-18.22 17.73-18.1 31 0.12 10.33 3.86 18.93 11.19 25.77 3.33 3.17 7.05 5.62 11.18 7.37-.9 2.6-1.84 5.09-2.85 7.47zM119.1 7.01c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37a25.2 25.2 0 0 1-.19-3.07c0-7.78 3.39-16.1 9.4-22.9 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.75.13 1.11.17 2.22.17 3.28z" />
    </svg>
  )

  const githubIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: dim * 0.6, height: dim * 0.6 }}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )

  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-lg"
      style={{
        width: dim,
        height: dim,
        backgroundColor: config.bgColor,
        color: config.textColor ?? 'white',
        fontSize,
        fontWeight: 600,
        lineHeight: 1,
        border: config.borderColor ? `1px solid ${config.borderColor}` : undefined,
      }}
    >
      {config.icon === 'apple' ? appleIcon : config.icon === 'github' ? githubIcon : config.letter}
    </div>
  )
}

function createTab(url: string = 'localhost:3000', title?: string): Tab {
  const resolvedTitle = title ?? PAGE_TITLES[url] ?? url
  return {
    id: generateTabId(),
    title: resolvedTitle,
    url,
    favicon: FAVICON_MAP[url] ?? '',
    isLoading: false,
    loadingProgress: 0,
  }
}

// ─── Simulated Page Components ───────────────────────────────────────────────

function AppleStartPage() {
  return (
    <div
      className="flex flex-col items-center w-full min-h-full bg-gradient-to-b from-[#f5f5f7] to-[#e8e8ed]"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Search/URL Bar at top */}
      <div className="w-full max-w-xl px-6 pt-10 pb-6">
        <div className="flex items-center bg-white/90 rounded-xl px-4 py-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.1)] transition-shadow cursor-text">
          <Search size={16} className="text-gray-400 mr-2.5 shrink-0" />
          <span className="text-[14px] text-gray-400">Search or enter website name</span>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="w-full max-w-2xl px-10 pb-10">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-5 px-1">
          Favorites
        </h2>
        <div className="grid grid-cols-6 gap-6">
          {BOOKMARKS.map((bm) => (
            <div
              key={bm.url}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-[52px] h-[52px] rounded-xl bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04)] flex items-center justify-center group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-all duration-200">
                <FaviconIcon url={bm.url} />
              </div>
              <span className="text-[11px] text-gray-500 group-hover:text-gray-800 truncate w-full text-center transition-colors duration-150">
                {bm.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reading List */}
      <div className="w-full max-w-2xl px-10 pb-8">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
          Reading List
        </h2>
        <div className="space-y-2">
          {[
            { title: 'The Future of Web Development', source: 'web.dev', time: '5 min read' },
            { title: 'Understanding SwiftUI Layouts', source: 'developer.apple.com', time: '8 min read' },
            { title: 'TypeScript Best Practices 2025', source: 'typescript-lang.org', time: '6 min read' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3.5 p-3 rounded-lg bg-white/70 hover:bg-white/90 border border-gray-200/40 hover:border-gray-200/60 cursor-pointer transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm shrink-0">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-gray-800 truncate">{item.title}</div>
                <div className="text-[11px] text-gray-400">
                  {item.source} · {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Report */}
      <div className="w-full max-w-2xl px-10 pb-12">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
          Privacy Report
        </h2>
        <div className="p-3.5 rounded-lg bg-white/70 border border-gray-200/40">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Lock size={16} className="text-green-600" />
            <span className="text-[12.5px] font-medium text-gray-800">Safari blocked 14 trackers</span>
          </div>
          <p className="text-[11px] text-gray-400 ml-7">
            In the last seven days, Safari has prevented trackers from profiling you.
          </p>
        </div>
      </div>
    </div>
  )
}

function ApplePage() {
  const products = [
    { name: 'MacBook Air', tagline: 'Lean. Mean. M3 machine.', icon: Laptop, color: 'from-gray-800 to-gray-600', price: 'From $1,099' },
    { name: 'iPhone 16 Pro', tagline: 'Hello, Apple Intelligence.', icon: Smartphone, color: 'from-blue-900 to-blue-700', price: 'From $999' },
    { name: 'Apple Watch Ultra 2', tagline: 'New finish. Tough as ever.', icon: Watch, color: 'from-orange-700 to-amber-600', price: 'From $799' },
    { name: 'AirPods Pro 2', tagline: 'Intelligent noise cancellation.', icon: Headphones, color: 'from-gray-100 to-gray-300', price: 'From $249' },
    { name: 'iMac', tagline: 'All-in-one. All in M3.', icon: Monitor, color: 'from-green-600 to-emerald-500', price: 'From $1,299' },
    { name: 'Mac Studio', tagline: 'Supercharged by M4 Max and M4 Ultra.', icon: Cpu, color: 'from-gray-700 to-gray-500', price: 'From $1,999' },
  ]

  return (
    <div className="flex flex-col w-full min-h-full bg-white">
      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-3 bg-[#fbfbfd] border-b border-gray-200/80 shrink-0">
        <span className="text-xl">🍎</span>
        <nav className="flex items-center gap-6 text-[12px] text-gray-500 font-medium">
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Store</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Mac</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">iPad</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">iPhone</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Watch</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">AirPods</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">TV & Home</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Support</span>
        </nav>
        <div className="flex items-center gap-4">
          <Search size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          <span className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors text-sm">👜</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-black text-white text-center py-16 px-6 shrink-0">
        <h1 className="text-5xl font-semibold tracking-tight mb-3">iPhone 16 Pro</h1>
        <p className="text-xl text-gray-300 mb-6">Hello, Apple Intelligence.</p>
        <div className="flex items-center justify-center gap-4">
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors">
            Learn more
          </button>
          <button className="px-5 py-2 border border-blue-500 text-blue-400 hover:border-blue-400 rounded-full text-sm font-medium transition-colors">
            Buy
          </button>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="w-48 h-80 rounded-[2.5rem] bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700 flex items-center justify-center">
            <Smartphone size={60} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Explore the lineup.</h2>
        <div className="grid grid-cols-3 gap-5">
          {products.map((product) => {
            const Icon = product.icon
            return (
              <div
                key={product.name}
                className="group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${product.color} p-8 flex items-center justify-center min-h-[160px]`}>
                  <Icon size={56} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.tagline}</p>
                  <p className="text-sm text-gray-700 font-medium">{product.price}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">Learn more</span>
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">Buy</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#f5f5f7] px-8 py-6 border-t border-gray-200 shrink-0">
        <div className="flex flex-wrap justify-center gap-6 text-[11px] text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-gray-600 cursor-pointer">Terms of Use</span>
          <span className="hover:text-gray-600 cursor-pointer">Sales and Refunds</span>
          <span className="hover:text-gray-600 cursor-pointer">Legal</span>
          <span className="hover:text-gray-600 cursor-pointer">Site Map</span>
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-2">Copyright © 2025 Apple Inc. All rights reserved.</p>
      </div>
    </div>
  )
}

function GooglePage() {
  const [searchValue, setSearchValue] = useState('')
  return (
    <div className="flex flex-col items-center w-full min-h-full bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        {/* Google Logo */}
        <div className="text-5xl font-bold mb-8 tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>
        {/* Search Bar */}
        <div className="w-full max-w-[584px] relative">
          <div className="flex items-center border border-gray-200 rounded-full px-5 py-3 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow">
            <Search size={18} className="text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 text-base outline-none bg-transparent text-gray-800"
              placeholder="Search Google or type a URL"
            />
            {searchValue && (
              <button onClick={() => setSearchValue('')} className="ml-2">
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            Google Search
          </button>
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            I&apos;m Feeling Lucky
          </button>
        </div>
      </div>
      {/* Footer */}
      <div className="w-full bg-gray-100 border-t border-gray-200 px-8 py-3">
        <div className="text-[12px] text-gray-500 text-center">
          © 2025 Google — Privacy — Terms — Settings
        </div>
      </div>
    </div>
  )
}

function YouTubePage() {
  const videos = [
    { title: 'Building a Full Stack App with Next.js', channel: 'Tech Academy', views: '1.2M', time: '18:42', color: 'from-red-400 to-orange-400' },
    { title: 'The Art of Minimalist Design', channel: 'Design Daily', views: '856K', time: '12:05', color: 'from-purple-400 to-pink-400' },
    { title: 'Cooking Italian Pasta Like a Pro', channel: 'Chef Masters', views: '2.1M', time: '24:18', color: 'from-yellow-400 to-red-400' },
    { title: 'Understanding Quantum Computing', channel: 'Science Hub', views: '4.3M', time: '31:55', color: 'from-cyan-400 to-blue-400' },
    { title: 'Mountain Biking Adventures', channel: 'Outdoor Life', views: '567K', time: '15:22', color: 'from-green-400 to-emerald-400' },
    { title: 'How AI is Changing Everything', channel: 'Future Tech', views: '3.8M', time: '22:10', color: 'from-indigo-400 to-violet-400' },
    { title: 'Photography Tips for Beginners', channel: 'Lens & Light', views: '945K', time: '16:33', color: 'from-amber-400 to-yellow-400' },
    { title: 'Space Exploration 2025', channel: 'Cosmic Voyages', views: '1.7M', time: '28:47', color: 'from-slate-400 to-gray-500' },
  ]

  return (
    <div className="flex flex-col w-full min-h-full bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 shrink-0">
        <div className="text-xl font-bold text-red-600 tracking-tight mr-6">
          <span className="bg-red-600 text-white rounded-lg px-1.5 py-0.5 text-sm mr-1">▶</span>
          YouTube
        </div>
        <div className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
            <input
              type="text"
              placeholder="Search"
              className="flex-1 px-4 py-1.5 text-sm outline-none bg-transparent"
            />
            <button className="px-4 py-1.5 bg-gray-50 border-l border-gray-200 hover:bg-gray-100 transition-colors">
              <Search size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div key={video.title} className="group cursor-pointer">
              {/* Thumbnail */}
              <div className="relative rounded-xl overflow-hidden aspect-video mb-2">
                <div className={`w-full h-full bg-gradient-to-br ${video.color} group-hover:opacity-90 transition-opacity`} />
                <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded font-medium">
                  {video.time}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg ml-0.5">▶</span>
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shrink-0 flex items-center justify-center text-xs">
                  {video.channel[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">{video.channel}</p>
                  <p className="text-[12px] text-gray-500">{video.views} views</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GitHubPage() {
  const repos = [
    { name: 'react', desc: 'The library for web and native user interfaces.', lang: 'JavaScript', langColor: '#f1e05a', stars: '230k', forks: '48.2k' },
    { name: 'next.js', desc: 'The React Framework – the perfect full-stack solution.', lang: 'TypeScript', langColor: '#3178c6', stars: '128k', forks: '26.8k' },
    { name: 'tailwindcss', desc: 'A utility-first CSS framework for rapid UI development.', lang: 'CSS', langColor: '#563d7c', stars: '84.3k', forks: '4.2k' },
    { name: 'prisma', desc: 'Next-generation Node.js and TypeScript ORM.', lang: 'TypeScript', langColor: '#3178c6', stars: '42.1k', forks: '1.6k' },
    { name: 'typescript', desc: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript.', lang: 'TypeScript', langColor: '#3178c6', stars: '103k', forks: '12.8k' },
    { name: 'bun', desc: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager.', lang: 'Zig', langColor: '#ec915c', stars: '75.2k', forks: '2.7k' },
  ]

  return (
    <div className="flex flex-col w-full min-h-full bg-[#0d1117] text-gray-200">
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-700/50 shrink-0">
        <span className="text-white text-lg mr-1"></span>
        <span className="font-semibold text-white text-base">GitHub</span>
        <div className="flex-1 max-w-md mx-auto">
          <div className="flex items-center bg-[#161b22] border border-gray-700 rounded-md px-3 py-1">
            <Search size={14} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Type / to search"
              className="flex-1 text-sm outline-none bg-transparent text-gray-300 placeholder:text-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="hover:text-gray-200 cursor-pointer">Pull requests</span>
          <span className="hover:text-gray-200 cursor-pointer">Issues</span>
          <span className="hover:text-gray-200 cursor-pointer">Marketplace</span>
          <span className="hover:text-gray-200 cursor-pointer">Explore</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Trending Repositories</h2>
          <div className="space-y-0 border border-gray-700/50 rounded-lg overflow-hidden">
            {repos.map((repo, i) => (
              <div
                key={repo.name}
                className={`flex items-start gap-4 p-4 hover:bg-[#161b22] transition-colors ${
                  i < repos.length - 1 ? 'border-b border-gray-700/50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-blue-400 hover:underline cursor-pointer font-medium text-sm">
                      {repo.name}
                    </span>
                    <span className="text-[11px] border border-gray-600 rounded-full px-2 py-0.5 text-gray-400">
                      Public
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-400 leading-snug">{repo.desc}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-[12px] text-gray-400">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: repo.langColor }} />
                      {repo.lang}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-gray-400">
                      <Star size={12} /> {repo.stars}
                    </span>
                    <span className="text-[12px] text-gray-400">
                      🄯 {repo.forks}
                    </span>
                  </div>
                </div>
                <button className="shrink-0 px-3 py-1 text-[12px] bg-[#21262d] border border-gray-600 rounded-md text-gray-300 hover:bg-[#30363d] hover:border-gray-500 transition-colors">
                  ⭐ Star
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WikipediaPage() {
  return (
    <div className="flex flex-col w-full min-h-full bg-white">
      {/* Wikipedia Header */}
      <div className="border-b border-gray-200 px-6 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl"></span>
          <div>
            <h1 className="text-lg font-serif text-gray-900">Wikipedia</h1>
            <p className="text-[11px] text-gray-400">The Free Encyclopedia</p>
          </div>
          <div className="flex-1 max-w-sm ml-8">
            <div className="flex items-center border border-gray-300 rounded px-3 py-1">
              <Search size={14} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search Wikipedia"
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Article Title */}
          <h1 className="text-3xl font-serif font-normal text-gray-900 mb-1 border-b border-gray-200 pb-3">
            macOS
          </h1>
          <p className="text-[13px] text-gray-500 italic mb-4">
            From Wikipedia, the free encyclopedia
          </p>

          {/* Infobox */}
          <div className="float-right ml-6 mb-4 w-[260px] border border-gray-200 bg-gray-50 rounded-lg overflow-hidden text-[13px]">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 text-center font-semibold border-b border-gray-200">
              macOS
            </div>
            <div className="p-3 space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Developer</span>
                <span>Apple Inc.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Written in</span>
                <span>C, C++, Swift</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">OS family</span>
                <span>Unix-like</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Initial release</span>
                <span>March 24, 2001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Latest release</span>
                <span>15.2 (2025)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kernel</span>
                <span>XNU (hybrid)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License</span>
                <span>Proprietary</span>
              </div>
            </div>
          </div>

          {/* Article Text */}
          <div className="text-[14px] text-gray-800 leading-relaxed space-y-4">
            <p>
              <strong>macOS</strong> is a proprietary graphical operating system developed and
              marketed by <strong>Apple Inc.</strong> since 2001. It is the primary operating system
              for Apple&apos;s Mac computers. Within the market of desktop and laptop computers, it is
              the second most widely used desktop OS, after Microsoft Windows and ahead of
              Linux distributions.
            </p>
            <p>
              macOS succeeded the classic Mac OS, a Mac operating system with nine releases from
              1984 to 1999. During this time, Apple co-founder Steve Jobs had left Apple and started
              another company, NeXT, developing the NeXTSTEP platform that would later be acquired
              by Apple to form the basis of macOS.
            </p>
            <h2 className="text-xl font-serif font-semibold text-gray-900 mt-6 mb-2 border-b border-gray-200 pb-1">
              History
            </h2>
            <p>
              macOS is based on the Unix operating system and on technologies developed at NeXT from
              the 1980s until Apple purchased the company in early 1997. The first version,
              Mac OS X Server 1.0, was released in 1999, with the first desktop version,
              Mac OS X 10.0, following in March 2001.
            </p>
            <p>
              Since its release, macOS has been updated with new features and improvements. Notable
              releases include Mac OS X Tiger (10.4), which introduced Spotlight search and
              Dashboard widgets; Mac OS X Leopard (10.5), which added Time Machine backup;
              and OS X Yosemite (10.10), which introduced a major visual overhaul.
            </p>
            <h2 className="text-xl font-serif font-semibold text-gray-900 mt-6 mb-2 border-b border-gray-200 pb-1">
              Features
            </h2>
            <p>
              macOS includes several key features that distinguish it from other operating systems:
              a consistent graphical user interface, integration with Apple&apos;s ecosystem (including
              iCloud, iMessage, and Continuity), built-in apps like Safari, Mail, and Calendar,
              and support for professional creative tools.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Aqua user interface with translucent menus and window effects</li>
              <li>Spotlight desktop search technology</li>
              <li>Time Machine automated backup system</li>
              <li>Metal graphics and compute API</li>
              <li>Continuity features across Apple devices</li>
              <li>Support for Universal applications on Apple Silicon</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function RedditPage() {
  const posts = [
    { subreddit: 'r/programming', title: 'Next.js 16 just dropped — here are the highlights', author: 'u/dev_master', upvotes: '12.4k', comments: '847', time: '3h' },
    { subreddit: 'r/webdev', title: 'I built a full-stack app in 2 hours with AI assistance', author: 'u/aicoder', upvotes: '8.9k', comments: '623', time: '5h' },
    { subreddit: 'r/react', title: 'React Server Components: A practical guide for 2025', author: 'u/reactfan', upvotes: '6.2k', comments: '412', time: '7h' },
    { subreddit: 'r/typescript', title: 'TypeScript 6.0 roadmap announced', author: 'u/ts_dev', upvotes: '15.1k', comments: '1.2k', time: '2h' },
    { subreddit: 'r/technology', title: 'Apple announces M5 chip with groundbreaking performance', author: 'u/technews', upvotes: '23.7k', comments: '2.4k', time: '1h' },
    { subreddit: 'r/design', title: 'The death of flat design? New trends emerging for 2025', author: 'u/designpro', upvotes: '5.8k', comments: '329', time: '9h' },
  ]

  return (
    <div className="flex flex-col w-full min-h-full bg-[#dae0e6]">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <span className="text-2xl mr-2">🟠</span>
        <span className="font-bold text-gray-900 text-lg">reddit</span>
        <div className="flex-1 max-w-md mx-auto ml-6">
          <div className="flex items-center border border-gray-200 rounded-full px-4 py-1.5 bg-gray-50">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search Reddit"
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors">
            Log In
          </button>
          <button className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-full text-sm font-medium text-white transition-colors">
            Sign Up
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {posts.map((post) => (
            <div
              key={post.title}
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <div className="flex">
                {/* Vote column */}
                <div className="flex flex-col items-center py-3 px-2 bg-gray-50 rounded-l-lg gap-1">
                  <button className="text-gray-400 hover:text-orange-500 transition-colors">▲</button>
                  <span className="text-xs font-bold text-gray-700">{post.upvotes}</span>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors">▼</button>
                </div>
                {/* Post content */}
                <div className="flex-1 p-3">
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">{post.subreddit}</span>
                    <span>·</span>
                    <span>Posted by {post.author}</span>
                    <span>·</span>
                    <span>{post.time} ago</span>
                  </div>
                  <h3 className="text-[15px] font-medium text-gray-900 mb-1 leading-snug">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[12px] text-gray-500 mt-2">
                    <span className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                      💬 {post.comments} Comments
                    </span>
                    <span className="hover:text-gray-700 cursor-pointer">Share</span>
                    <span className="hover:text-gray-700 cursor-pointer">Save</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GenericPage({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-white">
      <div className="text-center px-8">
        <Globe size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-medium text-gray-700 mb-2">Page Loaded</h2>
        <p className="text-sm text-gray-500 mb-1 font-medium">{url}</p>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          This page is a simulated version of {url}. In a real browser, this would load the actual website content.
        </p>
      </div>
    </div>
  )
}

// ─── Page Resolver ───────────────────────────────────────────────────────────

function resolvePageContent(url: string) {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (normalized === 'localhost:3000' || normalized === '') return <AppleStartPage />
  if (normalized.includes('apple')) return <ApplePage />
  if (normalized.includes('google')) return <GooglePage />
  if (normalized.includes('youtube')) return <YouTubePage />
  if (normalized.includes('github')) return <GitHubPage />
  if (normalized.includes('wikipedia')) return <WikipediaPage />
  if (normalized.includes('reddit')) return <RedditPage />
  return <GenericPage url={url} />
}

function resolvePageTitle(url: string): string {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (normalized === 'localhost:3000' || normalized === '') return 'Safari Start Page'
  if (normalized.includes('apple')) return 'Apple'
  if (normalized.includes('google')) return 'Google'
  if (normalized.includes('youtube')) return 'YouTube'
  if (normalized.includes('github')) return 'GitHub'
  if (normalized.includes('wikipedia')) return 'macOS — Wikipedia'
  if (normalized.includes('reddit')) return 'Reddit'
  return normalized
}

function resolveFavicon(url: string): string {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (normalized.includes('google')) return 'google'
  if (normalized.includes('youtube')) return 'youtube'
  if (normalized.includes('github')) return 'github'
  if (normalized.includes('wikipedia')) return 'wikipedia'
  if (normalized.includes('apple')) return 'apple'
  if (normalized.includes('reddit')) return 'reddit'
  return ''
}

// ─── Main Safari Component ───────────────────────────────────────────────────

export default function Safari() {
  const [tabs, setTabs] = useState<Tab[]>([createTab('localhost:3000', 'Safari Start Page')])
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [editUrl, setEditUrl] = useState('')
  const [showTabOverview, setShowTabOverview] = useState(false)

  // Navigation history per tab
  const [tabHistories, setTabHistories] = useState<Record<string, { urls: string[]; index: number }>>({
    [tabs[0].id]: { urls: ['localhost:3000'], index: 0 },
  })

  const urlInputRef = useRef<HTMLInputElement>(null)
  const loadingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const loadingIntervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) ?? tabs[0], [tabs, activeTabId])

  const canGoBack = useMemo(() => {
    const hist = tabHistories[activeTabId]
    return hist ? hist.index > 0 : false
  }, [tabHistories, activeTabId])

  const canGoForward = useMemo(() => {
    const hist = tabHistories[activeTabId]
    return hist ? hist.index < hist.urls.length - 1 : false
  }, [tabHistories, activeTabId])

  // Simulate loading with progress bar
  const simulateLoading = useCallback((tabId: string, url: string) => {
    // Clear any existing timers for this tab
    if (loadingTimersRef.current[tabId]) {
      clearTimeout(loadingTimersRef.current[tabId])
    }
    if (loadingIntervalsRef.current[tabId]) {
      clearInterval(loadingIntervalsRef.current[tabId])
    }

    // Start loading
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, isLoading: true, loadingProgress: 0, url, title: resolvePageTitle(url), favicon: resolveFavicon(url) } : t
      )
    )

    // Animate progress bar
    let progress = 0
    const loadDuration = 1000 + Math.random() * 1000 // 1-2 seconds
    const intervalMs = 50
    const incrementPerTick = 80 / (loadDuration / intervalMs) // Reach ~80% gradually

    loadingIntervalsRef.current[tabId] = setInterval(() => {
      progress += incrementPerTick + Math.random() * 2
      if (progress >= 85) {
        progress = 85
        if (loadingIntervalsRef.current[tabId]) {
          clearInterval(loadingIntervalsRef.current[tabId])
        }
      }
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, loadingProgress: Math.min(progress, 85) } : t
        )
      )
    }, intervalMs)

    // Complete loading after duration
    loadingTimersRef.current[tabId] = setTimeout(() => {
      if (loadingIntervalsRef.current[tabId]) {
        clearInterval(loadingIntervalsRef.current[tabId])
      }
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, isLoading: false, loadingProgress: 100 } : t
        )
      )
      // Reset progress after animation
      setTimeout(() => {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId ? { ...t, loadingProgress: 0 } : t
          )
        )
      }, 200)
    }, loadDuration)
  }, [])

  // Navigate to URL (pushes history)
  const navigateToUrl = useCallback(
    (url: string) => {
      const normalizedUrl = url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') || 'localhost:3000'
      const displayUrl = normalizedUrl === 'localhost:3000' ? 'localhost:3000' : normalizedUrl

      // Only show loading animation if actually changing URL
      const currentTab = tabs.find((t) => t.id === activeTabId)
      if (currentTab?.url !== displayUrl) {
        simulateLoading(activeTabId, displayUrl)
      }

      setTabHistories((prev) => {
        const hist = prev[activeTabId] ?? { urls: ['localhost:3000'], index: 0 }
        const newUrls = [...hist.urls.slice(0, hist.index + 1), displayUrl]
        return {
          ...prev,
          [activeTabId]: { urls: newUrls, index: newUrls.length - 1 },
        }
      })
    },
    [activeTabId, tabs, simulateLoading]
  )

  const goBack = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index <= 0) return
    const newIndex = hist.index - 1
    const url = hist.urls[newIndex]
    simulateLoading(activeTabId, url)

    setTabHistories((prev) => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }))
  }, [activeTabId, tabHistories, simulateLoading])

  const goForward = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index >= hist.urls.length - 1) return
    const newIndex = hist.index + 1
    const url = hist.urls[newIndex]
    simulateLoading(activeTabId, url)

    setTabHistories((prev) => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }))
  }, [activeTabId, tabHistories, simulateLoading])

  const addTab = useCallback(() => {
    const newTab = createTab('localhost:3000', 'Safari Start Page')
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
    setTabHistories((prev) => ({
      ...prev,
      [newTab.id]: { urls: ['localhost:3000'], index: 0 },
    }))
    setIsEditingUrl(false)
  }, [])

  const closeTab = useCallback(
    (tabId: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      // Clear loading timers
      if (loadingTimersRef.current[tabId]) {
        clearTimeout(loadingTimersRef.current[tabId])
      }
      if (loadingIntervalsRef.current[tabId]) {
        clearInterval(loadingIntervalsRef.current[tabId])
      }
      setTabs((prev) => {
        if (prev.length <= 1) return prev // Don't close last tab
        const idx = prev.findIndex((t) => t.id === tabId)
        const newTabs = prev.filter((t) => t.id !== tabId)
        if (tabId === activeTabId) {
          const newIdx = Math.min(idx, newTabs.length - 1)
          setActiveTabId(newTabs[newIdx].id)
        }
        return newTabs
      })
    },
    [activeTabId]
  )

  const handleUrlClick = useCallback(() => {
    setEditUrl(activeTab.url === 'localhost:3000' ? '' : activeTab.url)
    setIsEditingUrl(true)
    setTimeout(() => urlInputRef.current?.select(), 0)
  }, [activeTab.url])

  const handleUrlSubmit = useCallback(() => {
    setIsEditingUrl(false)
    if (editUrl.trim()) {
      navigateToUrl(editUrl.trim())
    }
    setEditUrl('')
  }, [editUrl, navigateToUrl])

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleUrlSubmit()
      } else if (e.key === 'Escape') {
        setIsEditingUrl(false)
        setEditUrl('')
      }
    },
    [handleUrlSubmit]
  )

  const handleBookmarkClick = useCallback(
    (bookmark: BookmarkItem) => {
      navigateToUrl(bookmark.url)
    },
    [navigateToUrl]
  )

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(loadingTimersRef.current).forEach(clearTimeout)
      Object.values(loadingIntervalsRef.current).forEach(clearInterval)
    }
  }, [])

  return (
    <div className="flex flex-col w-full h-full bg-white text-gray-900 text-sm select-none overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* ─── Tab Bar (pill-shaped, macOS Safari style) ────────────── */}
      <div className="shrink-0 bg-[#ddd]" style={{ paddingTop: '6px', paddingBottom: '0' }}>
        <div className="flex items-center gap-[3px] px-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <div
                key={tab.id}
                className={`group flex items-center gap-1.5 pl-2.5 pr-1.5 py-[4px] min-w-[120px] max-w-[200px] text-[11.5px] cursor-pointer transition-all duration-150 relative ${
                  isActive
                    ? 'bg-white text-gray-800 rounded-lg shadow-sm'
                    : 'bg-[#c8c8c8]/60 text-gray-600 hover:bg-[#c8c8c8]/90 rounded-lg'
                }`}
                onClick={() => {
                  setActiveTabId(tab.id)
                  setShowTabOverview(false)
                }}
              >
                {/* Favicon / Loading spinner */}
                <span className="shrink-0">
                  {tab.isLoading ? (
                    <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <FaviconIcon url={tab.url} size="small" />
                  )}
                </span>

                {/* Title */}
                <span className="truncate flex-1" style={{ fontWeight: isActive ? 500 : 400, fontSize: '11.5px' }}>{tab.title}</span>

                {/* Close button - small circle on hover */}
                {tabs.length > 1 && (
                  <button
                    className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-100 hover:bg-gray-300/70"
                    onClick={(e) => closeTab(tab.id, e)}
                  >
                    <X size={9} className="text-gray-500" />
                  </button>
                )}
              </div>
            )
          })}

          {/* Add Tab Button - pill-shaped */}
          <button
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#c8c8c8]/70 text-gray-500 transition-colors duration-100"
            onClick={addTab}
            title="New Tab"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ─── Toolbar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#f6f6f6] border-b border-gray-200/80">
        {/* Navigation row */}
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          {/* Back */}
          <button
            className={`p-1.5 rounded-md transition-colors ${
              canGoBack
                ? 'hover:bg-gray-200/80 text-gray-600 active:bg-gray-300/60'
                : 'text-gray-300 cursor-default'
            }`}
            onClick={goBack}
            disabled={!canGoBack}
            title="Go Back"
          >
            <ArrowLeft size={15} />
          </button>

          {/* Forward */}
          <button
            className={`p-1.5 rounded-md transition-colors ${
              canGoForward
                ? 'hover:bg-gray-200/80 text-gray-600 active:bg-gray-300/60'
                : 'text-gray-300 cursor-default'
            }`}
            onClick={goForward}
            disabled={!canGoForward}
            title="Go Forward"
          >
            <ArrowRight size={15} />
          </button>

          {/* URL Bar - more prominent */}
          <div className="flex-1 mx-2">
            <div
              className="flex items-center bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.08)] px-3 py-[6px] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.12)] focus-within:shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_0_1.5px_rgba(0,122,255,0.3)] transition-all cursor-text"
              onClick={handleUrlClick}
            >
              {isEditingUrl ? (
                <input
                  ref={urlInputRef}
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  onKeyDown={handleUrlKeyDown}
                  onBlur={handleUrlSubmit}
                  className="flex-1 text-[13px] text-center outline-none bg-transparent text-gray-800"
                  autoFocus
                  placeholder="Search or enter website name"
                />
              ) : (
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <Lock size={11} className="text-gray-400 shrink-0" />
                  <span className="text-[13px] text-gray-500 truncate">
                    {activeTab.url === 'localhost:3000'
                      ? 'Search or enter website name'
                      : activeTab.url}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Share */}
          <button
            className="p-1.5 rounded-md hover:bg-gray-200/80 text-gray-500 active:bg-gray-300/60 transition-colors"
            title="Share"
          >
            <Share2 size={15} />
          </button>

          {/* Tab Overview */}
          <button
            className={`p-1.5 rounded-md transition-colors ${
              showTabOverview
                ? 'bg-gray-200/80 text-gray-700'
                : 'hover:bg-gray-200/80 text-gray-500 active:bg-gray-300/60'
            }`}
            onClick={() => setShowTabOverview(!showTabOverview)}
            title="Tab Overview"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* ─── Bookmarks Bar ────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-0.5 px-3 py-[3px] bg-[#fafafa] border-b border-gray-200/80">
        {BOOKMARKS.map((bm) => (
          <button
            key={bm.url}
            className="flex items-center gap-1.5 px-2.5 py-[3px] rounded-full hover:bg-gray-200/60 text-[11.5px] text-gray-600 hover:text-gray-800 transition-colors duration-100"
            onClick={() => handleBookmarkClick(bm)}
          >
            <FaviconIcon url={bm.url} size="small" />
            <span className="truncate">{bm.name}</span>
          </button>
        ))}
      </div>

      {/* ─── Loading Progress Bar ──────────────────────────────────────── */}
      {activeTab.isLoading && (
        <div className="relative h-[2px] bg-transparent shrink-0 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100 ease-out"
            style={{ width: `${activeTab.loadingProgress}%` }}
          />
        </div>
      )}

      {/* ─── Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0 relative">
        {showTabOverview ? (
          <TabOverview
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={(id) => {
              setActiveTabId(id)
              setShowTabOverview(false)
            }}
            onCloseTab={closeTab}
            onAddTab={addTab}
          />
        ) : activeTab.isLoading ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading {activeTab.url}...</p>
            </div>
          </div>
        ) : (
          resolvePageContent(activeTab.url)
        )}
      </div>
    </div>
  )
}

// ─── Tab Overview Component ──────────────────────────────────────────────────

function TabOverview({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
}: {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onCloseTab: (id: string, e?: React.MouseEvent) => void
  onAddTab: () => void
}) {
  return (
    <div className="flex flex-col items-center w-full min-h-full bg-[#f2f2f7] p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        {tabs.length} Tab{tabs.length !== 1 ? 's' : ''}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              className={`group relative rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-200 ${
                isActive ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:shadow-lg'
              }`}
              onClick={() => onSelectTab(tab.id)}
            >
              {/* Simulated preview */}
              <div className="bg-white aspect-[4/3] relative">
                <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-2">
                  <FaviconIcon url={tab.url} size="small" />
                  <span className="text-[10px] text-gray-500 truncate ml-1">{tab.title}</span>
                </div>
                <div className="p-2 space-y-1.5">
                  <div className="h-2 bg-gray-100 rounded w-3/4" />
                  <div className="h-2 bg-gray-50 rounded w-1/2" />
                  <div className="h-2 bg-gray-50 rounded w-2/3" />
                </div>
              </div>

              {/* Close */}
              {tabs.length > 1 && (
                <button
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => onCloseTab(tab.id, e)}
                >
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>
          )
        })}

        {/* Add tab card */}
        <div
          className="rounded-xl border-2 border-dashed border-gray-300 aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
          onClick={onAddTab}
        >
          <Plus size={28} className="text-gray-300" />
        </div>
      </div>
    </div>
  )
}
