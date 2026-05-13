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
  RotateCw,
  AlertCircle,
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

interface SearchResult {
  url: string
  name: string
  snippet: string
  host_name: string
  rank: number
  date: string
  favicon: string
}

interface PageReadResult {
  title: string
  url: string
  html: string
  publishedTime: string
}

type PageType = 'start' | 'simulated' | 'search-results' | 'youtube-video' | 'page-reader' | 'error' | 'loading'

interface PageState {
  type: PageType
  searchResults?: SearchResult[]
  searchQuery?: string
  youtubeVideoId?: string
  youtubeTitle?: string
  pageContent?: PageReadResult
  errorMessage?: string
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
  'youtube.com': { letter: '\u25B6', bgColor: '#FF0000' },
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

const SIMULATED_SITES = ['apple.com', 'github.com', 'wikipedia.org', 'reddit.com']

let tabCounter = 0

function generateTabId(): string {
  tabCounter++
  return `tab-${tabCounter}-${Date.now()}`
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function isUrl(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true
  // Check for domain-like patterns
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.(com|org|net|edu|gov|io|co|dev|app|me|us|uk|ca|de|fr|jp|cn|ru|br|au|in|it|es|nl|se|no|dk|ch|at|be|pl|kr|mx|ar|tr|za|sg|hk|tw|info|biz|xyz|top|online|site|tech|store|live)(\/|$)/i
  if (domainPattern.test(trimmed)) return true
  // Also match domains with paths
  if (/^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(\/\S*)?$/.test(trimmed)) return true
  return false
}

function normalizeUrl(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return 'https://' + trimmed
}

function getDisplayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function isSimulatedSite(url: string): boolean {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  return SIMULATED_SITES.some(site => normalized === site || normalized === site + '/' || normalized.startsWith(site + '/'))
}

function isYouTubeUrl(url: string): boolean {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '')
  return normalized.includes('youtube.com') || normalized.includes('youtu.be')
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

// ─── Favicon Component ───────────────────────────────────────────────────────

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
  const resolvedTitle = title ?? (url === 'localhost:3000' ? 'Safari Start Page' : url)
  return {
    id: generateTabId(),
    title: resolvedTitle,
    url,
    favicon: resolveFavicon(url),
    isLoading: false,
    loadingProgress: 0,
  }
}

// ─── Simulated Page Components (kept as-is) ─────────────────────────────────

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
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Explore the lineup.</h2>
        <div className="grid grid-cols-3 gap-5">
          {products.map((product) => {
            const Icon = product.icon
            return (
              <div key={product.name} className="group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
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
      <div className="bg-[#f5f5f7] px-8 py-6 border-t border-gray-200 shrink-0">
        <div className="flex flex-wrap justify-center gap-6 text-[11px] text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-gray-600 cursor-pointer">Terms of Use</span>
          <span className="hover:text-gray-600 cursor-pointer">Sales and Refunds</span>
          <span className="hover:text-gray-600 cursor-pointer">Legal</span>
          <span className="hover:text-gray-600 cursor-pointer">Site Map</span>
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-2">Copyright &copy; 2025 Apple Inc. All rights reserved.</p>
      </div>
    </div>
  )
}

function GitHubPage() {
  const repos = [
    { name: 'react', desc: 'The library for web and native user interfaces.', lang: 'JavaScript', langColor: '#f1e05a', stars: '230k', forks: '48.2k' },
    { name: 'next.js', desc: 'The React Framework \u2013 the perfect full-stack solution.', lang: 'TypeScript', langColor: '#3178c6', stars: '128k', forks: '26.8k' },
    { name: 'tailwindcss', desc: 'A utility-first CSS framework for rapid UI development.', lang: 'CSS', langColor: '#563d7c', stars: '84.3k', forks: '4.2k' },
    { name: 'prisma', desc: 'Next-generation Node.js and TypeScript ORM.', lang: 'TypeScript', langColor: '#3178c6', stars: '42.1k', forks: '1.6k' },
    { name: 'typescript', desc: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript.', lang: 'TypeScript', langColor: '#3178c6', stars: '103k', forks: '12.8k' },
    { name: 'bun', desc: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager.', lang: 'Zig', langColor: '#ec915c', stars: '75.2k', forks: '2.7k' },
  ]

  return (
    <div className="flex flex-col w-full min-h-full bg-[#0d1117] text-gray-200">
      <div className="flex items-center px-4 py-2 border-b border-gray-700/50 shrink-0">
        <span className="text-white text-lg mr-1"></span>
        <span className="font-semibold text-white text-base">GitHub</span>
        <div className="flex-1 max-w-md mx-auto">
          <div className="flex items-center bg-[#161b22] border border-gray-700 rounded-md px-3 py-1">
            <Search size={14} className="text-gray-500 mr-2" />
            <input type="text" placeholder="Type / to search" className="flex-1 text-sm outline-none bg-transparent text-gray-300 placeholder:text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="hover:text-gray-200 cursor-pointer">Pull requests</span>
          <span className="hover:text-gray-200 cursor-pointer">Issues</span>
          <span className="hover:text-gray-200 cursor-pointer">Marketplace</span>
          <span className="hover:text-gray-200 cursor-pointer">Explore</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Trending Repositories</h2>
          <div className="space-y-0 border border-gray-700/50 rounded-lg overflow-hidden">
            {repos.map((repo, i) => (
              <div key={repo.name} className={`flex items-start gap-4 p-4 hover:bg-[#161b22] transition-colors ${i < repos.length - 1 ? 'border-b border-gray-700/50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-blue-400 hover:underline cursor-pointer font-medium text-sm">{repo.name}</span>
                    <span className="text-[11px] border border-gray-600 rounded-full px-2 py-0.5 text-gray-400">Public</span>
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
                    <span className="text-[12px] text-gray-400">\u2009{repo.forks}</span>
                  </div>
                </div>
                <button className="shrink-0 px-3 py-1 text-[12px] bg-[#21262d] border border-gray-600 rounded-md text-gray-300 hover:bg-[#30363d] hover:border-gray-500 transition-colors">
                  \u2B50 Star
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
              <input type="text" placeholder="Search Wikipedia" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-serif font-normal text-gray-900 mb-1 border-b border-gray-200 pb-3">macOS</h1>
          <p className="text-[13px] text-gray-500 italic mb-4">From Wikipedia, the free encyclopedia</p>
          <div className="float-right ml-6 mb-4 w-[260px] border border-gray-200 bg-gray-50 rounded-lg overflow-hidden text-[13px]">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 text-center font-semibold border-b border-gray-200">macOS</div>
            <div className="p-3 space-y-2 text-gray-700">
              <div className="flex justify-between"><span className="text-gray-500">Developer</span><span>Apple Inc.</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Written in</span><span>C, C++, Swift</span></div>
              <div className="flex justify-between"><span className="text-gray-500">OS family</span><span>Unix-like</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Initial release</span><span>March 24, 2001</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Latest release</span><span>15.2 (2025)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Kernel</span><span>XNU (hybrid)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">License</span><span>Proprietary</span></div>
            </div>
          </div>
          <div className="text-[14px] text-gray-800 leading-relaxed space-y-4">
            <p><strong>macOS</strong> is a proprietary graphical operating system developed and marketed by <strong>Apple Inc.</strong> since 2001. It is the primary operating system for Apple&apos;s Mac computers.</p>
            <p>macOS succeeded the classic Mac OS, a Mac operating system with nine releases from 1984 to 1999.</p>
            <h2 className="text-xl font-serif font-semibold text-gray-900 mt-6 mb-2 border-b border-gray-200 pb-1">History</h2>
            <p>macOS is based on the Unix operating system and on technologies developed at NeXT from the 1980s until Apple purchased the company in early 1997.</p>
            <h2 className="text-xl font-serif font-semibold text-gray-900 mt-6 mb-2 border-b border-gray-200 pb-1">Features</h2>
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
    { subreddit: 'r/programming', title: 'Next.js 16 just dropped \u2014 here are the highlights', author: 'u/dev_master', upvotes: '12.4k', comments: '847', time: '3h' },
    { subreddit: 'r/webdev', title: 'I built a full-stack app in 2 hours with AI assistance', author: 'u/aicoder', upvotes: '8.9k', comments: '623', time: '5h' },
    { subreddit: 'r/react', title: 'React Server Components: A practical guide for 2025', author: 'u/reactfan', upvotes: '6.2k', comments: '412', time: '7h' },
    { subreddit: 'r/typescript', title: 'TypeScript 6.0 roadmap announced', author: 'u/ts_dev', upvotes: '15.1k', comments: '1.2k', time: '2h' },
  ]

  return (
    <div className="flex flex-col w-full min-h-full bg-[#dae0e6]">
      <div className="flex items-center px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <span className="text-2xl mr-2">🟠</span>
        <span className="font-bold text-gray-900 text-lg">reddit</span>
        <div className="flex-1 max-w-md mx-auto ml-6">
          <div className="flex items-center border border-gray-200 rounded-full px-4 py-1.5 bg-gray-50">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search Reddit" className="flex-1 text-sm outline-none bg-transparent" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {posts.map((post) => (
            <div key={post.title} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
              <div className="flex">
                <div className="flex flex-col items-center py-3 px-2 bg-gray-50 rounded-l-lg gap-1">
                  <button className="text-gray-400 hover:text-orange-500 transition-colors">▲</button>
                  <span className="text-xs font-bold text-gray-700">{post.upvotes}</span>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors">▼</button>
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">{post.subreddit}</span>
                    <span>·</span>
                    <span>Posted by {post.author}</span>
                    <span>·</span>
                    <span>{post.time} ago</span>
                  </div>
                  <h3 className="text-[15px] font-medium text-gray-900 mb-1 leading-snug">{post.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Real Browsing Page Components ───────────────────────────────────────────

function StartPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  return (
    <div
      className="flex flex-col items-center w-full min-h-full bg-gradient-to-b from-[#f5f5f7] to-[#e8e8ed]"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-xl px-6 pt-10 pb-6">
        <div className="flex items-center bg-white/90 rounded-xl px-4 py-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.1)] transition-shadow cursor-text">
          <Search size={16} className="text-gray-400 mr-2.5 shrink-0" />
          <span className="text-[14px] text-gray-400">Search or enter website name</span>
        </div>
      </div>
      <div className="w-full max-w-2xl px-10 pb-10">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-5 px-1">Favorites</h2>
        <div className="grid grid-cols-6 gap-6">
          {BOOKMARKS.map((bm) => (
            <div
              key={bm.url}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
              onClick={() => onNavigate(bm.url)}
            >
              <div className="w-[52px] h-[52px] rounded-xl bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04)] flex items-center justify-center group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-all duration-200">
                <FaviconIcon url={bm.url} />
              </div>
              <span className="text-[11px] text-gray-500 group-hover:text-gray-800 truncate w-full text-center transition-colors duration-150">{bm.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-2xl px-10 pb-8">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">Quick Links</h2>
        <div className="space-y-2">
          <div
            className="flex items-center gap-3.5 p-3 rounded-lg bg-white/70 hover:bg-white/90 border border-gray-200/40 hover:border-gray-200/60 cursor-pointer transition-all duration-150"
            onClick={() => onNavigate('youtube.com')}
          >
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-sm shrink-0">
              <FaviconIcon url="youtube.com" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-gray-800 truncate">YouTube</div>
              <div className="text-[11px] text-gray-400">Browse and watch videos</div>
            </div>
          </div>
          <div
            className="flex items-center gap-3.5 p-3 rounded-lg bg-white/70 hover:bg-white/90 border border-gray-200/40 hover:border-gray-200/60 cursor-pointer transition-all duration-150"
            onClick={() => onNavigate('google.com')}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-sm shrink-0">
              <FaviconIcon url="google.com" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-gray-800 truncate">Google Search</div>
              <div className="text-[11px] text-gray-400">Search the web</div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-2xl px-10 pb-12">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">Privacy Report</h2>
        <div className="p-3.5 rounded-lg bg-white/70 border border-gray-200/40">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Lock size={16} className="text-green-600" />
            <span className="text-[12.5px] font-medium text-gray-800">Safari blocked 14 trackers</span>
          </div>
          <p className="text-[11px] text-gray-400 ml-7">In the last seven days, Safari has prevented trackers from profiling you.</p>
        </div>
      </div>
    </div>
  )
}

function SearchResultsPage({
  results,
  query,
  onNavigate,
  onSearch,
}: {
  results: SearchResult[]
  query: string
  onNavigate: (url: string) => void
  onSearch: (q: string) => void
}) {
  const [searchInput, setSearchInput] = useState(query)

  return (
    <div className="flex flex-col w-full min-h-full bg-white">
      {/* Search header */}
      <div className="shrink-0 border-b border-gray-200 pb-4 pt-4 px-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Google logo */}
          <div className="text-2xl font-bold tracking-tight shrink-0 cursor-pointer" onClick={() => onNavigate('google.com')}>
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center border border-gray-200 rounded-full px-4 py-2.5 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchInput.trim()) {
                    onSearch(searchInput.trim())
                  }
                }}
                className="flex-1 text-base outline-none bg-transparent text-gray-800"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="ml-2">
                  <X size={18} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <button
                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => searchInput.trim() && onSearch(searchInput.trim())}
              >
                <Search size={18} className="text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="max-w-2xl">
          <p className="text-[13px] text-gray-500 mb-4">
            About {results.length} results for &quot;{query}&quot;
          </p>
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {result.favicon ? (
                      <img src={result.favicon} alt="" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <Globe size={10} className="text-gray-400" />
                    )}
                  </div>
                  <span className="text-[12px] text-gray-500 truncate">{result.host_name}</span>
                </div>
                <h3
                  className="text-[18px] text-[#1a0dab] leading-snug mb-1 cursor-pointer hover:underline group-hover:underline"
                  onClick={() => onNavigate(result.url)}
                >
                  {result.name}
                </h3>
                <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">{result.snippet}</p>
                <p className="text-[12px] text-green-700/70 mt-0.5 truncate">{result.url}</p>
              </div>
            ))}
          </div>
          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No results found</h3>
              <p className="text-sm text-gray-400">Try different keywords or check your spelling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function YouTubeVideoPage({
  videoId,
  title,
  onBack,
}: {
  videoId: string
  title?: string
  onBack: () => void
}) {
  return (
    <div className="flex flex-col w-full min-h-full bg-[#0f0f0f]">
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="w-full bg-black">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'YouTube video'}
            />
          </div>
        </div>

        {/* Video Info */}
        <div className="px-4 py-3 bg-[#0f0f0f]">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors"
            >
              <ArrowLeft size={14} />
              Back to results
            </button>
          </div>
          <h1 className="text-white text-lg font-medium leading-snug">
            {title || 'YouTube Video'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">youtube.com/watch?v={videoId}</p>
        </div>
      </div>
    </div>
  )
}

function PageReaderView({
  pageContent,
  onNavigate,
}: {
  pageContent: PageReadResult
  onNavigate: (url: string) => void
}) {
  // Sanitize HTML: remove scripts and dangerous elements but keep basic formatting
  const sanitizedHtml = useMemo(() => {
    if (!pageContent.html) return ''
    let html = pageContent.html
    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove iframe, object, embed tags
    html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    html = html.replace(/<embed\b[^>]*>/gi, '')
    // Remove event handlers
    html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    html = html.replace(/\son\w+\s*=\s*\S+/gi, '')
    // Remove javascript: URLs
    html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    return html
  }, [pageContent.html])

  // Handle link clicks within the rendered HTML
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const anchor = target.closest('a')
    if (anchor) {
      e.preventDefault()
      const href = anchor.getAttribute('href')
      if (href) {
        // Handle relative URLs
        if (href.startsWith('/') || href.startsWith('./')) {
          const baseUrl = pageContent.url || ''
          const fullUrl = new URL(href, baseUrl).toString()
          onNavigate(fullUrl)
        } else if (href.startsWith('http')) {
          onNavigate(href)
        }
      }
    }
  }, [onNavigate, pageContent.url])

  return (
    <div className="flex flex-col w-full min-h-full bg-white">
      {/* Page header */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={14} className="text-gray-400" />
          <span className="text-[12px] text-gray-500 truncate">{pageContent.url}</span>
          {pageContent.publishedTime && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-[12px] text-gray-400">{pageContent.publishedTime}</span>
            </>
          )}
        </div>
        <h1 className="text-lg font-semibold text-gray-900">{pageContent.title}</h1>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-gray-900
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-gray-900 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-2
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-900
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
              [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
              [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
              [&_pre]:bg-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4
              [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
              [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold
              [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2
            "
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </div>
      </div>
    </div>
  )
}

function ErrorPage({ message, url }: { message: string; url: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-white">
      <div className="text-center px-8 max-w-md">
        <AlertCircle size={48} className="mx-auto mb-4 text-orange-400" />
        <h2 className="text-lg font-medium text-gray-700 mb-2">Unable to Load Page</h2>
        <p className="text-sm text-gray-500 mb-1 font-medium">{url}</p>
        <p className="text-sm text-gray-400 mt-2">{message}</p>
      </div>
    </div>
  )
}

function GoogleHomePage({ onSearch }: { onSearch: (query: string) => void }) {
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue.trim()) {
                  onSearch(searchValue.trim())
                }
              }}
              className="flex-1 text-base outline-none bg-transparent text-gray-800"
              placeholder="Search Google or type a URL"
              autoFocus
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
          <button
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            onClick={() => searchValue.trim() && onSearch(searchValue.trim())}
          >
            Google Search
          </button>
          <button
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            onClick={() => onSearch("I'm Feeling Lucky")}
          >
            I&apos;m Feeling Lucky
          </button>
        </div>
      </div>
      {/* Footer */}
      <div className="w-full bg-gray-100 border-t border-gray-200 px-8 py-3">
        <div className="text-[12px] text-gray-500 text-center">
          &copy; 2025 Google &mdash; Privacy &mdash; Terms &mdash; Settings
        </div>
      </div>
    </div>
  )
}

// ─── Simulated Page Resolver ─────────────────────────────────────────────────

function getSimulatedPage(url: string, onNavigate?: (url: string) => void): React.ReactNode | null {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (normalized.includes('apple')) return <ApplePage />
  if (normalized.includes('github')) return <GitHubPage />
  if (normalized.includes('wikipedia')) return <WikipediaPage />
  if (normalized.includes('reddit')) return <RedditPage />
  if ((normalized === 'google.com' || normalized === 'www.google.com') && onNavigate) {
    return <GoogleHomePage onSearch={(q) => void onNavigate(q)} />
  }
  return null
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

  // Page data per tab (search results, page content, etc.)
  const [tabPageData, setTabPageData] = useState<Record<string, PageState>>({})

  const urlInputRef = useRef<HTMLInputElement>(null)
  const loadingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const loadingIntervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) ?? tabs[0], [tabs, activeTabId])
  const activePageData = tabPageData[activeTabId]

  const canGoBack = useMemo(() => {
    const hist = tabHistories[activeTabId]
    return hist ? hist.index > 0 : false
  }, [tabHistories, activeTabId])

  const canGoForward = useMemo(() => {
    const hist = tabHistories[activeTabId]
    return hist ? hist.index < hist.urls.length - 1 : false
  }, [tabHistories, activeTabId])

  // Simulate loading with progress bar
  const simulateLoading = useCallback((tabId: string, url: string, title?: string) => {
    if (loadingTimersRef.current[tabId]) {
      clearTimeout(loadingTimersRef.current[tabId])
    }
    if (loadingIntervalsRef.current[tabId]) {
      clearInterval(loadingIntervalsRef.current[tabId])
    }

    const displayTitle = title ?? (url === 'localhost:3000' ? 'Safari Start Page' : getDisplayUrl(url))

    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, isLoading: true, loadingProgress: 0, url, title: displayTitle, favicon: resolveFavicon(url) } : t
      )
    )

    let progress = 0
    const loadDuration = 800 + Math.random() * 800
    const intervalMs = 50
    const incrementPerTick = 80 / (loadDuration / intervalMs)

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

    loadingTimersRef.current[tabId] = setTimeout(() => {
      if (loadingIntervalsRef.current[tabId]) {
        clearInterval(loadingIntervalsRef.current[tabId])
      }
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, isLoading: false, loadingProgress: 100 } : t
        )
      )
      setTimeout(() => {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId ? { ...t, loadingProgress: 0 } : t
          )
        )
      }, 200)
    }, loadDuration)
  }, [])

  // Finish loading (set title etc)
  const finishLoading = useCallback((tabId: string, title: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, title, isLoading: false, loadingProgress: 100 } : t
      )
    )
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, loadingProgress: 0 } : t
        )
      )
    }, 200)
  }, [])

  // Resolve an input string to a canonical URL (search: prefix for queries, normalized for URLs)
  const resolveInputUrl = useCallback((inputUrl: string): string => {
    const trimmed = inputUrl.trim()
    if (!trimmed || trimmed === 'localhost:3000') return 'localhost:3000'
    if (!isUrl(trimmed) && !trimmed.startsWith('localhost')) return `search:${trimmed}`
    return normalizeUrl(trimmed)
  }, [])

  // Load content for a URL (no history push) - handles all API calls and page type determination
  const loadUrlContent = useCallback(
    async (displayUrl: string, tabId: string) => {
      // Handle start page
      if (displayUrl === 'localhost:3000') {
        setTabPageData((prev) => ({ ...prev, [tabId]: { type: 'start' } }))
        simulateLoading(tabId, 'localhost:3000', 'Safari Start Page')
        return
      }

      // Handle search query
      if (displayUrl.startsWith('search:')) {
        const query = displayUrl.replace('search:', '')
        simulateLoading(tabId, displayUrl, `${query} - Google Search`)
        setTabPageData((prev) => ({ ...prev, [tabId]: { type: 'loading', searchQuery: query } }))

        try {
          const response = await fetch(`/api/browser/search?q=${encodeURIComponent(query)}&num=10`)
          const data = await response.json()

          if (data.error) {
            setTabPageData((prev) => ({ ...prev, [tabId]: { type: 'error', errorMessage: data.error } }))
            finishLoading(tabId, 'Error')
            return
          }

          const results: SearchResult[] = data.results || []
          setTabPageData((prev) => ({
            ...prev,
            [tabId]: { type: 'search-results', searchResults: results, searchQuery: query },
          }))
          finishLoading(tabId, `${query} - Google Search`)
        } catch {
          setTabPageData((prev) => ({
            ...prev,
            [tabId]: { type: 'error', errorMessage: 'Failed to search. Please check your connection.' },
          }))
          finishLoading(tabId, 'Error')
        }
        return
      }

      // Check if it's a simulated site first
      if (isSimulatedSite(displayUrl)) {
        setTabPageData((prev) => ({ ...prev, [tabId]: { type: 'simulated' } }))
        const normalized = displayUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
        const title = normalized.includes('apple') ? 'Apple' : normalized.includes('github') ? 'GitHub' : normalized.includes('wikipedia') ? 'macOS \u2014 Wikipedia' : normalized.includes('reddit') ? 'Reddit' : normalized
        simulateLoading(tabId, displayUrl, title)
        return
      }

      // Check if it's a YouTube video URL
      const youtubeVideoId = extractYouTubeVideoId(displayUrl)
      if (youtubeVideoId) {
        setTabPageData((prev) => ({
          ...prev,
          [tabId]: { type: 'youtube-video', youtubeVideoId, youtubeTitle: 'YouTube Video' },
        }))
        simulateLoading(tabId, displayUrl, 'YouTube Video')
        return
      }

      // Check if it's YouTube homepage or search - redirect to search
      if (isYouTubeUrl(displayUrl) && !youtubeVideoId) {
        const searchQuery = 'site:youtube.com'
        simulateLoading(tabId, displayUrl, 'YouTube')
        setTabPageData((prev) => ({ ...prev, [tabId]: { type: 'loading' } }))

        try {
          const response = await fetch(`/api/browser/search?q=${encodeURIComponent(searchQuery)}&num=10`)
          const data = await response.json()
          const results: SearchResult[] = data.results || []
          setTabPageData((prev) => ({
            ...prev,
            [tabId]: { type: 'search-results', searchResults: results, searchQuery: 'YouTube' },
          }))
          finishLoading(tabId, 'YouTube')
        } catch {
          setTabPageData((prev) => ({
            ...prev,
            [tabId]: { type: 'error', errorMessage: 'Failed to load YouTube.' },
          }))
          finishLoading(tabId, 'Error')
        }
        return
      }

      // Check if it's Google homepage
      const normalized = displayUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
      if (normalized === 'google.com' || normalized === 'www.google.com') {
        setTabPageData((prev) => ({ ...prev, [tabId]: { type: 'simulated' } }))
        simulateLoading(tabId, displayUrl, 'Google')
        return
      }

      // For all other URLs, use the page reader API
      simulateLoading(tabId, displayUrl, getDisplayUrl(displayUrl))
      setTabPageData((prev) => ({ ...prev, [tabId]: { type: 'loading' } }))

      try {
        const response = await fetch(`/api/browser/read?url=${encodeURIComponent(displayUrl)}`)
        const data = await response.json()

        if (data.error) {
          setTabPageData((prev) => ({
            ...prev,
            [tabId]: { type: 'error', errorMessage: data.error },
          }))
          finishLoading(tabId, 'Error')
          return
        }

        const pageContent: PageReadResult = data.data || { title: '', url: displayUrl, html: '', publishedTime: '' }

        // Check if the read page is actually a YouTube video
        const readYoutubeId = extractYouTubeVideoId(pageContent.url || displayUrl)
        if (readYoutubeId) {
          setTabPageData((prev) => ({
            ...prev,
            [tabId]: { type: 'youtube-video', youtubeVideoId: readYoutubeId, youtubeTitle: pageContent.title },
          }))
          finishLoading(tabId, pageContent.title || 'YouTube Video')
          return
        }

        setTabPageData((prev) => ({
          ...prev,
          [tabId]: { type: 'page-reader', pageContent },
        }))
        finishLoading(tabId, pageContent.title || getDisplayUrl(displayUrl))
      } catch {
        setTabPageData((prev) => ({
          ...prev,
          [tabId]: { type: 'error', errorMessage: 'Failed to load page. Please check your connection.' },
        }))
        finishLoading(tabId, 'Error')
      }
    },
    [simulateLoading, finishLoading]
  )

  // Navigate to URL (resolves input + pushes history + loads content)
  const navigateToUrl = useCallback(
    async (inputUrl: string) => {
      const displayUrl = resolveInputUrl(inputUrl)
      if (!displayUrl) return

      // Push to history
      setTabHistories((prev) => {
        const hist = prev[activeTabId] ?? { urls: ['localhost:3000'], index: 0 }
        const newUrls = [...hist.urls.slice(0, hist.index + 1), displayUrl]
        return {
          ...prev,
          [activeTabId]: { urls: newUrls, index: newUrls.length - 1 },
        }
      })

      await loadUrlContent(displayUrl, activeTabId)
    },
    [activeTabId, resolveInputUrl, loadUrlContent]
  )

  const goBack = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index <= 0) return
    const newIndex = hist.index - 1
    const url = hist.urls[newIndex]

    setTabHistories((prev) => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }))

    void loadUrlContent(url, activeTabId)
  }, [activeTabId, tabHistories, loadUrlContent])

  const goForward = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index >= hist.urls.length - 1) return
    const newIndex = hist.index + 1
    const url = hist.urls[newIndex]

    setTabHistories((prev) => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }))

    void loadUrlContent(url, activeTabId)
  }, [activeTabId, tabHistories, loadUrlContent])

  const addTab = useCallback(() => {
    const newTab = createTab('localhost:3000', 'Safari Start Page')
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
    setTabHistories((prev) => ({
      ...prev,
      [newTab.id]: { urls: ['localhost:3000'], index: 0 },
    }))
    setTabPageData((prev) => ({ ...prev, [newTab.id]: { type: 'start' } }))
    setIsEditingUrl(false)
  }, [])

  const closeTab = useCallback(
    (tabId: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (loadingTimersRef.current[tabId]) {
        clearTimeout(loadingTimersRef.current[tabId])
      }
      if (loadingIntervalsRef.current[tabId]) {
        clearInterval(loadingIntervalsRef.current[tabId])
      }
      setTabs((prev) => {
        if (prev.length <= 1) return prev
        const idx = prev.findIndex((t) => t.id === tabId)
        const newTabs = prev.filter((t) => t.id !== tabId)
        if (tabId === activeTabId) {
          const newIdx = Math.min(idx, newTabs.length - 1)
          setActiveTabId(newTabs[newIdx].id)
        }
        return newTabs
      })
      // Clean up page data
      setTabPageData((prev) => {
        const next = { ...prev }
        delete next[tabId]
        return next
      })
    },
    [activeTabId]
  )

  const handleUrlClick = useCallback(() => {
    const currentUrl = activeTab.url
    const displayUrl = currentUrl === 'localhost:3000'
      ? ''
      : currentUrl.startsWith('search:')
        ? currentUrl.replace('search:', '')
        : getDisplayUrl(currentUrl)
    setEditUrl(displayUrl)
    setIsEditingUrl(true)
    setTimeout(() => urlInputRef.current?.select(), 0)
  }, [activeTab.url])

  const handleUrlSubmit = useCallback(() => {
    setIsEditingUrl(false)
    if (editUrl.trim()) {
      void navigateToUrl(editUrl.trim())
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
      void navigateToUrl(bookmark.url)
    },
    [navigateToUrl]
  )

  const handleReload = useCallback(() => {
    const currentUrl = activeTab.url
    if (currentUrl) {
      void loadUrlContent(currentUrl, activeTabId)
    }
  }, [activeTab.url, activeTabId, loadUrlContent])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(loadingTimersRef.current).forEach(clearTimeout)
      Object.values(loadingIntervalsRef.current).forEach(clearInterval)
    }
  }, [])

  // Determine what to render in the content area
  const renderContent = () => {
    const url = activeTab.url
    const pageData = activePageData

    // Start page
    if (url === 'localhost:3000' || (!pageData && url === 'localhost:3000')) {
      return <StartPage onNavigate={(u) => void navigateToUrl(u)} />
    }

    // If page data exists, use it
    if (pageData) {
      switch (pageData.type) {
        case 'start':
          return <StartPage onNavigate={(u) => void navigateToUrl(u)} />

        case 'simulated':
          return getSimulatedPage(url, (u) => void navigateToUrl(u)) || <ErrorPage message="Page not available" url={url} />

        case 'search-results':
          return (
            <SearchResultsPage
              results={pageData.searchResults || []}
              query={pageData.searchQuery || ''}
              onNavigate={(u) => void navigateToUrl(u)}
              onSearch={(q) => void navigateToUrl(q)}
            />
          )

        case 'youtube-video':
          return (
            <YouTubeVideoPage
              videoId={pageData.youtubeVideoId || ''}
              title={pageData.youtubeTitle}
              onBack={goBack}
            />
          )

        case 'page-reader':
          if (pageData.pageContent) {
            return (
              <PageReaderView
                pageContent={pageData.pageContent}
                onNavigate={(u) => void navigateToUrl(u)}
              />
            )
          }
          break

        case 'error':
          return <ErrorPage message={pageData.errorMessage || 'Unknown error'} url={url} />

        case 'loading':
          // Loading state is handled below
          break
      }
    }

    // Fallback: check if it's a simulated site without page data
    if (isSimulatedSite(url)) {
      return getSimulatedPage(url, (u) => void navigateToUrl(u)) || <ErrorPage message="Page not available" url={url} />
    }

    // Fallback: Google homepage
    if (url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').includes('google.com')) {
      return <StartPage onNavigate={(u) => void navigateToUrl(u)} />
    }

    // No content available
    return <ErrorPage message="Page data not available. Try reloading." url={url} />
  }

  // Get display URL for the URL bar
  const getUrlBarDisplay = () => {
    if (activeTab.url === 'localhost:3000') return 'Search or enter website name'
    if (activeTab.url.startsWith('search:')) return activeTab.url.replace('search:', '')
    return getDisplayUrl(activeTab.url)
  }

  return (
    <div className="flex flex-col w-full h-full bg-white text-gray-900 text-sm select-none overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* ─── Tab Bar ─────────────────────────────────────────────── */}
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
                <span className="shrink-0">
                  {tab.isLoading ? (
                    <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <FaviconIcon url={tab.url} size="small" />
                  )}
                </span>
                <span className="truncate flex-1" style={{ fontWeight: isActive ? 500 : 400, fontSize: '11.5px' }}>{tab.title}</span>
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

          <button
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#c8c8c8]/70 text-gray-500 transition-colors duration-100"
            onClick={addTab}
            title="New Tab"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ─── Toolbar ─────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#f6f6f6] border-b border-gray-200/80">
        <div className="flex items-center gap-1.5 px-3 py-1.5">
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

          {/* URL Bar */}
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
                    {getUrlBarDisplay()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reload */}
          <button
            className="p-1.5 rounded-md hover:bg-gray-200/80 text-gray-500 active:bg-gray-300/60 transition-colors"
            onClick={handleReload}
            title="Reload"
          >
            <RotateCw size={14} />
          </button>

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

      {/* ─── Bookmarks Bar ───────────────────────────────────────── */}
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

      {/* ─── Loading Progress Bar ────────────────────────────────── */}
      {activeTab.isLoading && (
        <div className="relative h-[2px] bg-transparent shrink-0 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100 ease-out"
            style={{ width: `${activeTab.loadingProgress}%` }}
          />
        </div>
      )}

      {/* ─── Content Area ────────────────────────────────────────── */}
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
        ) : activeTab.isLoading && (!activePageData || activePageData.type === 'loading') ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          </div>
        ) : (
          // eslint-disable-next-line react-hooks/refs -- renderContent creates click handlers that may access refs, but ref access only occurs on user interaction
          renderContent()
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
