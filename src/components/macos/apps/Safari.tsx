'use client'

import React, { useState, useCallback, useRef, useMemo } from 'react'
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
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tab {
  id: string
  title: string
  url: string
  favicon: string
}

interface BookmarkItem {
  name: string
  url: string
  favicon: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BOOKMARKS: BookmarkItem[] = [
  { name: 'Apple', url: 'apple.com', favicon: '' },
  { name: 'Google', url: 'google.com', favicon: '' },
  { name: 'YouTube', url: 'youtube.com', favicon: '' },
  { name: 'GitHub', url: 'github.com', favicon: '' },
  { name: 'Wikipedia', url: 'wikipedia.org', favicon: '' },
]

const FAVICON_MAP: Record<string, string> = {
  'apple.com': '',
  'google.com': '',
  'youtube.com': '',
  'github.com': '',
  'wikipedia.org': '',
}

const PAGE_TITLES: Record<string, string> = {
  'apple.com': 'Apple',
  'google.com': 'Google',
  'youtube.com': 'YouTube',
  'github.com': 'GitHub',
  'wikipedia.org': 'Wikipedia',
  'localhost:3000': 'Safari Start Page',
}

let tabCounter = 0

function generateTabId(): string {
  tabCounter++
  return `tab-${tabCounter}-${Date.now()}`
}

function createTab(url: string = 'localhost:3000', title?: string): Tab {
  const resolvedTitle = title ?? PAGE_TITLES[url] ?? url
  return {
    id: generateTabId(),
    title: resolvedTitle,
    url,
    favicon: FAVICON_MAP[url] ?? '',
  }
}

// ─── Simulated Page Components ───────────────────────────────────────────────

function AppleStartPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-full bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-6xl mb-6"></div>
        <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3">
          Welcome to Safari
        </h1>
        <p className="text-lg text-gray-500 max-w-md">
          Your personal browsing experience starts here.
        </p>
      </div>

      {/* Favorites Grid */}
      <div className="w-full max-w-2xl px-8 pb-12">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 px-1">
          Favorites
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {BOOKMARKS.map((bm) => (
            <div
              key={bm.url}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-2xl group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                {bm.favicon}
              </div>
              <span className="text-[11px] text-gray-500 group-hover:text-gray-700 truncate w-full text-center transition-colors">
                {bm.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reading List */}
      <div className="w-full max-w-2xl px-8 pb-12">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 px-1">
          Reading List
        </h2>
        <div className="space-y-3">
          {[
            { title: 'The Future of Web Development', source: 'web.dev', time: '5 min read' },
            { title: 'Understanding SwiftUI Layouts', source: 'developer.apple.com', time: '8 min read' },
            { title: 'TypeScript Best Practices 2025', source: 'typescript-lang.org', time: '6 min read' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{item.title}</div>
                <div className="text-[11px] text-gray-400">
                  {item.source} · {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Report */}
      <div className="w-full max-w-2xl px-8 pb-16">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 px-1">
          Privacy Report
        </h2>
        <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={18} className="text-green-600" />
            <span className="text-sm font-medium text-gray-800">Safari blocked 14 trackers</span>
          </div>
          <p className="text-[11px] text-gray-400 ml-7">
            In the last seven days, Safari has prevented trackers from profiling you.
          </p>
        </div>
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
          <h2 class="text-lg font-semibold text-gray-100 mb-4">Trending Repositories</h2>
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

function GenericPage({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-white">
      <div className="text-center px-8">
        <Globe size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-medium text-gray-700 mb-2">{url}</h2>
        <p className="text-sm text-gray-400 max-w-sm">
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
  if (normalized.includes('google')) return <GooglePage />
  if (normalized.includes('youtube')) return <YouTubePage />
  if (normalized.includes('github')) return <GitHubPage />
  if (normalized.includes('wikipedia')) return <WikipediaPage />
  return <GenericPage url={url} />
}

function resolvePageTitle(url: string): string {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (normalized === 'localhost:3000' || normalized === '') return 'Safari Start Page'
  if (normalized.includes('google')) return 'Google'
  if (normalized.includes('youtube')) return 'YouTube'
  if (normalized.includes('youtube')) return 'YouTube'
  if (normalized.includes('github')) return 'GitHub'
  if (normalized.includes('wikipedia')) return 'macOS — Wikipedia'
  return normalized
}

function resolveFavicon(url: string): string {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (normalized.includes('google')) return ''
  if (normalized.includes('youtube')) return ''
  if (normalized.includes('github')) return ''
  if (normalized.includes('wikipedia')) return ''
  if (normalized.includes('apple')) return ''
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

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) ?? tabs[0], [tabs, activeTabId])

  const canGoBack = useMemo(() => {
    const hist = tabHistories[activeTabId]
    return hist ? hist.index > 0 : false
  }, [tabHistories, activeTabId])

  const canGoForward = useMemo(() => {
    const hist = tabHistories[activeTabId]
    return hist ? hist.index < hist.urls.length - 1 : false
  }, [tabHistories, activeTabId])

  // Navigate to URL (pushes history)
  const navigateToUrl = useCallback(
    (url: string) => {
      const normalizedUrl = url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') || 'localhost:3000'
      const displayUrl = normalizedUrl === 'localhost:3000' ? 'localhost:3000' : normalizedUrl
      const title = resolvePageTitle(displayUrl)
      const favicon = resolveFavicon(displayUrl)

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, url: displayUrl, title, favicon } : t
        )
      )

      setTabHistories((prev) => {
        const hist = prev[activeTabId] ?? { urls: ['localhost:3000'], index: 0 }
        const newUrls = [...hist.urls.slice(0, hist.index + 1), displayUrl]
        return {
          ...prev,
          [activeTabId]: { urls: newUrls, index: newUrls.length - 1 },
        }
      })
    },
    [activeTabId]
  )

  const goBack = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index <= 0) return
    const newIndex = hist.index - 1
    const url = hist.urls[newIndex]
    const title = resolvePageTitle(url)
    const favicon = resolveFavicon(url)

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, url, title, favicon } : t
      )
    )
    setTabHistories((prev) => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }))
  }, [activeTabId, tabHistories])

  const goForward = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index >= hist.urls.length - 1) return
    const newIndex = hist.index + 1
    const url = hist.urls[newIndex]
    const title = resolvePageTitle(url)
    const favicon = resolveFavicon(url)

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, url, title, favicon } : t
      )
    )
    setTabHistories((prev) => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }))
  }, [activeTabId, tabHistories])

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
      setTabs((prev) => {
        if (prev.length <= 1) return prev // Don't close last tab
        const idx = prev.findIndex((t) => t.id === tabId)
        const newTabs = prev.filter((t) => t.id !== tabId)
        if (tabId === activeTabId) {
          // Switch to adjacent tab
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

  return (
    <div className="flex flex-col w-full h-full bg-white text-gray-900 text-sm select-none overflow-hidden">
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

          {/* URL Bar */}
          <div className="flex-1 mx-2">
            <div
              className="flex items-center bg-white rounded-full shadow-sm border border-gray-200/60 px-3 py-[5px] hover:border-gray-300/80 focus-within:border-gray-300/80 focus-within:shadow transition-all cursor-text"
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
                />
              ) : (
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <Lock size={11} className="text-gray-400 shrink-0" />
                  <span className="text-[13px] text-gray-500 truncate">
                    {activeTab.url === 'localhost:3000'
                      ? 'Safari Start Page'
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

      {/* ─── Tab Bar ──────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#e8e8e8] border-b border-gray-300/50">
        <div className="flex items-end px-1 pt-0.5 gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <div
                key={tab.id}
                className={`group flex items-center gap-1.5 px-3 py-[5px] min-w-[140px] max-w-[220px] text-[12px] rounded-t-lg cursor-pointer transition-colors relative ${
                  isActive
                    ? 'bg-white text-gray-800'
                    : 'bg-[#e0e0e0] text-gray-500 hover:bg-[#eaeaea]'
                }`}
                onClick={() => {
                  setActiveTabId(tab.id)
                  setShowTabOverview(false)
                }}
              >
                {/* Tab connector to content */}
                {isActive && (
                  <>
                    <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-white" />
                    <div className="absolute -bottom-px -left-1 w-2 h-2 bg-[#e8e8e8]" style={{ borderRadius: '0 0 8px 0' }} />
                    <div className="absolute -bottom-px -right-1 w-2 h-2 bg-[#e8e8e8]" style={{ borderRadius: '0 0 0 8px' }} />
                  </>
                )}

                {/* Favicon */}
                <span className="text-[13px] shrink-0">{tab.favicon || ''}</span>

                {/* Title */}
                <span className="truncate flex-1 font-medium">{tab.title}</span>

                {/* Close button */}
                {tabs.length > 1 && (
                  <button
                    className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-300/60 transition-all"
                    onClick={(e) => closeTab(tab.id, e)}
                  >
                    <X size={10} className="text-gray-500" />
                  </button>
                )}
              </div>
            )
          })}

          {/* Add Tab Button */}
          <button
            className="shrink-0 p-1.5 rounded-md hover:bg-gray-300/40 text-gray-500 transition-colors mb-0.5"
            onClick={addTab}
            title="New Tab"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ─── Bookmarks Bar ────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1 px-3 py-1 bg-[#fafafa] border-b border-gray-200/80">
        {BOOKMARKS.map((bm) => (
          <button
            key={bm.url}
            className="flex items-center gap-1.5 px-2.5 py-[3px] rounded-md hover:bg-gray-200/60 text-[12px] text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => handleBookmarkClick(bm)}
          >
            <span className="text-[12px]">{bm.favicon}</span>
            <span className="truncate">{bm.name}</span>
          </button>
        ))}
      </div>

      {/* ─── Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0">
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
                  <span className="text-[10px]">{tab.favicon}</span>
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
