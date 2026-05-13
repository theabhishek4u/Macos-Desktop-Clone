'use client'

import React, { useState } from 'react'
import {
  Search,
  Download,
  Star,
  Globe,
  Palette,
  Briefcase,
  Gamepad2,
  Code2,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Photo,
  Music,
  PenTool,
  Terminal,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppItem {
  id: string
  name: string
  category: string
  rating: number
  ratingCount: string
  price: string
  iconGradient: string
  iconLetter: string
  description: string
}

interface SidebarCategory {
  id: string
  name: string
  icon: React.ReactNode
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
  { id: 'discover', name: 'Discover', icon: <Sparkles size={16} /> },
  { id: 'create', name: 'Create', icon: <Palette size={16} /> },
  { id: 'work', name: 'Work', icon: <Briefcase size={16} /> },
  { id: 'play', name: 'Play', icon: <Gamepad2 size={16} /> },
  { id: 'develop', name: 'Develop', icon: <Code2 size={16} /> },
  { id: 'updates', name: 'Updates', icon: <RefreshCw size={16} /> },
]

const FEATURED_APP: AppItem = {
  id: 'featured',
  name: 'Notion',
  category: 'Productivity',
  rating: 4.8,
  ratingCount: '42.3K',
  price: 'Free',
  iconGradient: 'from-gray-800 to-gray-600',
  iconLetter: 'N',
  description: 'One workspace. Every team. All your notes, docs, and projects — beautifully organized.',
}

const APP_LIST: AppItem[] = [
  { id: '1', name: 'Figma', category: 'Design', rating: 4.9, ratingCount: '28.1K', price: 'Free', iconGradient: 'from-purple-500 to-pink-500', iconLetter: 'F', description: 'Collaborative design tool for teams' },
  { id: '2', name: 'Slack', category: 'Business', rating: 4.5, ratingCount: '156K', price: 'Free', iconGradient: 'from-purple-700 to-purple-500', iconLetter: 'S', description: 'Team communication made simple' },
  { id: '3', name: '1Password', category: 'Utilities', rating: 4.8, ratingCount: '89.2K', price: '$2.99/mo', iconGradient: 'from-blue-600 to-blue-400', iconLetter: '1', description: 'Password manager for all your accounts' },
  { id: '4', name: 'Bear', category: 'Productivity', rating: 4.7, ratingCount: '34.5K', price: 'Free', iconGradient: 'from-orange-600 to-amber-500', iconLetter: 'B', description: 'Beautiful, flexible writing app' },
  { id: '5', name: 'Pixelmator Pro', category: 'Photo & Video', rating: 4.6, ratingCount: '12.8K', price: '$49.99', iconGradient: 'from-violet-600 to-indigo-500', iconLetter: 'P', description: 'Professional image editing for everyone' },
  { id: '6', name: 'Fantastical', category: 'Productivity', rating: 4.8, ratingCount: '45.1K', price: '$4.99/mo', iconGradient: 'from-red-600 to-red-400', iconLetter: 'F', description: 'The calendar app you won\'t want to live without' },
  { id: '7', name: 'Things 3', category: 'Productivity', rating: 4.9, ratingCount: '67.3K', price: '$49.99', iconGradient: 'from-blue-700 to-blue-500', iconLetter: 'T', description: 'Award-winning personal task manager' },
  { id: '8', name: 'Affinity Photo', category: 'Photo & Video', rating: 4.7, ratingCount: '23.4K', price: '$69.99', iconGradient: 'from-indigo-700 to-purple-500', iconLetter: 'A', description: 'Professional photo editing without subscription' },
  { id: '9', name: 'iA Writer', category: 'Productivity', rating: 4.6, ratingCount: '19.7K', price: '$49.99', iconGradient: 'from-gray-700 to-gray-500', iconLetter: 'i', description: 'Focused writing with Markdown' },
  { id: '10', name: 'Spark', category: 'Email', rating: 4.5, ratingCount: '78.4K', price: 'Free', iconGradient: 'from-sky-600 to-blue-400', iconLetter: 'S', description: 'Smart email for teams and individuals' },
]

const TOP_CHARTS: AppItem[] = [
  { id: 'tc1', name: 'WhatsApp', category: 'Social Networking', rating: 4.2, ratingCount: '2.1M', price: 'Free', iconGradient: 'from-green-500 to-green-400', iconLetter: 'W', description: '' },
  { id: 'tc2', name: 'Telegram', category: 'Social Networking', rating: 4.5, ratingCount: '1.8M', price: 'Free', iconGradient: 'from-blue-500 to-cyan-400', iconLetter: 'T', description: '' },
  { id: 'tc3', name: 'Discord', category: 'Social Networking', rating: 4.4, ratingCount: '956K', price: 'Free', iconGradient: 'from-indigo-600 to-purple-500', iconLetter: 'D', description: '' },
  { id: 'tc4', name: 'Spotify', category: 'Music', rating: 4.7, ratingCount: '3.2M', price: 'Free', iconGradient: 'from-green-600 to-green-400', iconLetter: 'S', description: '' },
  { id: 'tc5', name: 'Zoom', category: 'Business', rating: 4.1, ratingCount: '1.5M', price: 'Free', iconGradient: 'from-blue-600 to-blue-400', iconLetter: 'Z', description: '' },
]

// ─── Components ──────────────────────────────────────────────────────────────

function AppIcon({ app, size = 'default' }: { app: AppItem; size?: 'default' | 'large' }) {
  const dim = size === 'large' ? 64 : 48
  const fontSize = size === 'large' ? 24 : 18
  return (
    <div
      className={`bg-gradient-to-br ${app.iconGradient} rounded-[22%] flex items-center justify-center text-white font-bold shrink-0`}
      style={{ width: dim, height: dim, fontSize }}
    >
      {app.iconLetter}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={10}
          className={star <= Math.round(rating) ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

function AppCard({ app }: { app: AppItem }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const handleGet = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDownloaded) return
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      setIsDownloaded(true)
    }, 1500)
  }

  return (
    <div className="flex items-center gap-3 py-3 group cursor-pointer">
      <AppIcon app={app} />
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-medium text-gray-900 truncate">{app.name}</h4>
        <p className="text-[11px] text-gray-500 truncate">{app.category}</p>
        <StarRating rating={app.rating} />
      </div>
      <div className="shrink-0">
        {isDownloading ? (
          <div className="w-[68px] h-[28px] bg-gray-200 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isDownloaded ? (
          <div className="w-[68px] h-[28px] bg-gray-100 rounded-full flex items-center justify-center">
            <Download size={14} className="text-gray-500" />
          </div>
        ) : (
          <button
            className="w-[68px] h-[28px] bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-bold rounded-full transition-colors"
            onClick={handleGet}
          >
            {app.price === 'Free' ? 'Get' : app.price}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main AppStore Component ─────────────────────────────────────────────────

export default function AppStore() {
  const [activeCategory, setActiveCategory] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredApps = searchQuery
    ? APP_LIST.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : APP_LIST

  return (
    <div className="flex w-full h-full bg-[#f5f5f7] text-gray-900 select-none overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <div className="shrink-0 w-[200px] bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col py-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-3 mb-3 shrink-0">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 text-[12px] outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="px-2 space-y-0.5">
          {SIDEBAR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeCategory === cat.id
                  ? 'bg-gray-200/80 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[800px] mx-auto px-6 py-5">
          {/* Featured Banner */}
          {!searchQuery && activeCategory === 'discover' && (
            <div className="mb-8">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 p-8 text-white shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                <div className="relative z-10 flex items-center gap-6">
                  <AppIcon app={FEATURED_APP} size="large" />
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1">Featured App</div>
                    <h2 className="text-2xl font-bold mb-1">{FEATURED_APP.name}</h2>
                    <p className="text-white/70 text-sm mb-3 max-w-md">{FEATURED_APP.description}</p>
                    <div className="flex items-center gap-3">
                      <button className="px-5 py-1.5 bg-white text-black rounded-full text-[13px] font-bold hover:bg-gray-100 transition-colors">
                        {FEATURED_APP.price === 'Free' ? 'Get' : FEATURED_APP.price}
                      </button>
                      <div className="flex items-center gap-1">
                        <StarRating rating={FEATURED_APP.rating} />
                        <span className="text-white/60 text-[11px] ml-1">{FEATURED_APP.ratingCount} Ratings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Results for &ldquo;{searchQuery}&rdquo;</h2>
              {filteredApps.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 px-4">
                  {filteredApps.map((app) => (
                    <AppCard key={app.id} app={app} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No results found</p>
                </div>
              )}
            </div>
          )}

          {/* Top Charts */}
          {!searchQuery && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Charts</h2>
                <button className="text-[13px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-0.5 transition-colors">
                  See All <ChevronRight size={14} />
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 px-4">
                {TOP_CHARTS.map((app, idx) => (
                  <div key={app.id} className="flex items-center gap-3 py-3">
                    <span className="text-gray-400 text-[14px] font-semibold w-6 text-center shrink-0">{idx + 1}</span>
                    <AppIcon app={app} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-medium text-gray-900 truncate">{app.name}</h4>
                      <p className="text-[11px] text-gray-500 truncate">{app.category}</p>
                    </div>
                    <button className="w-[68px] h-[28px] bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-bold rounded-full transition-colors shrink-0">
                      Get
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* App List */}
          {!searchQuery && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recommended Apps</h2>
                <button className="text-[13px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-0.5 transition-colors">
                  See All <ChevronRight size={14} />
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 px-4">
                {APP_LIST.slice(0, 6).map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </div>
          )}

          {/* Category sections */}
          {!searchQuery && activeCategory !== 'discover' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{activeCategory}</h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 px-4">
                {APP_LIST.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
