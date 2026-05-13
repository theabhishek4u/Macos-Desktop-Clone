'use client'

import React, { useState } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronLeft,
  Search,
  Tv,
  Film,
  Trophy,
  Baby,
  BookOpen,
  Heart,
  X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContentItem {
  id: string
  title: string
  subtitle: string
  gradient: string
  year?: string
  rating?: string
  duration?: string
  genre?: string
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'watchnow', name: 'Watch Now', icon: <Play size={16} /> },
  { id: 'movies', name: 'Movies', icon: <Film size={16} /> },
  { id: 'tvshows', name: 'TV Shows', icon: <Tv size={16} /> },
  { id: 'sports', name: 'Sports', icon: <Trophy size={16} /> },
  { id: 'kids', name: 'Kids', icon: <Baby size={16} /> },
  { id: 'library', name: 'Library', icon: <BookOpen size={16} /> },
]

const FEATURED: ContentItem[] = [
  { id: 'f1', title: 'Severance', subtitle: 'Season 2 Now Streaming', gradient: 'from-red-900 via-red-800 to-orange-900', year: '2025', rating: 'TV-MA', genre: 'Thriller' },
  { id: 'f2', title: 'Ted Lasso', subtitle: 'A Comedy About Coaching', gradient: 'from-blue-900 via-blue-800 to-cyan-900', year: '2024', rating: 'TV-14', genre: 'Comedy' },
  { id: 'f3', title: 'The Morning Show', subtitle: 'Season 4 Premiere', gradient: 'from-purple-900 via-purple-800 to-pink-900', year: '2025', rating: 'TV-MA', genre: 'Drama' },
]

const CONTENT_ROWS: { title: string; items: ContentItem[] }[] = [
  {
    title: 'Trending Now',
    items: [
      { id: 't1', title: 'Slow Horses', subtitle: 'Spy Thriller', gradient: 'from-gray-800 to-gray-600', genre: 'Thriller' },
      { id: 't2', title: 'Silo', subtitle: 'Sci-Fi Mystery', gradient: 'from-emerald-900 to-teal-800', genre: 'Sci-Fi' },
      { id: 't3', title: 'Shrinking', subtitle: 'Comedy Drama', gradient: 'from-yellow-800 to-amber-700', genre: 'Comedy' },
      { id: 't4', title: 'Pachinko', subtitle: 'Epic Drama', gradient: 'from-rose-900 to-pink-800', genre: 'Drama' },
      { id: 't5', title: 'Foundation', subtitle: 'Sci-Fi Epic', gradient: 'from-indigo-900 to-violet-800', genre: 'Sci-Fi' },
      { id: 't6', title: 'Monarch', subtitle: 'Monster Verse', gradient: 'from-gray-900 to-zinc-700', genre: 'Action' },
    ],
  },
  {
    title: 'New Releases',
    items: [
      { id: 'n1', title: 'Wolfs', subtitle: 'Action Comedy', gradient: 'from-slate-800 to-slate-600', year: '2024', genre: 'Action' },
      { id: 'n2', title: 'Fly Me to the Moon', subtitle: 'Romantic Comedy', gradient: 'from-pink-800 to-rose-600', year: '2024', genre: 'Romance' },
      { id: 'n3', title: 'The Instigators', subtitle: 'Heist Thriller', gradient: 'from-amber-900 to-orange-800', year: '2024', genre: 'Thriller' },
      { id: 'n4', title: 'Blink', subtitle: 'Documentary', gradient: 'from-cyan-900 to-teal-700', year: '2024', genre: 'Documentary' },
      { id: 'n5', title: 'Cuckoo', subtitle: 'Horror', gradient: 'from-gray-900 to-neutral-700', year: '2024', genre: 'Horror' },
      { id: 'n6', title: 'Alien: Romulus', subtitle: 'Sci-Fi Horror', gradient: 'from-zinc-900 to-gray-700', year: '2024', genre: 'Sci-Fi' },
    ],
  },
  {
    title: 'Action Movies',
    items: [
      { id: 'a1', title: 'John Wick: Chapter 4', subtitle: 'Action', gradient: 'from-red-900 to-red-700', year: '2023', genre: 'Action' },
      { id: 'a2', title: 'Mission Impossible', subtitle: 'Dead Reckoning', gradient: 'from-blue-900 to-blue-700', year: '2023', genre: 'Action' },
      { id: 'a3', title: 'Top Gun: Maverick', subtitle: 'Aerial Action', gradient: 'from-sky-900 to-sky-700', year: '2022', genre: 'Action' },
      { id: 'a4', title: 'Extraction 2', subtitle: 'Action Thriller', gradient: 'from-orange-900 to-amber-700', year: '2023', genre: 'Action' },
      { id: 'a5', title: 'The Gray Man', subtitle: 'Spy Action', gradient: 'from-slate-900 to-slate-700', year: '2022', genre: 'Action' },
      { id: 'a6', title: 'Bullet Train', subtitle: 'Action Comedy', gradient: 'from-violet-900 to-purple-700', year: '2022', genre: 'Action' },
    ],
  },
  {
    title: 'Comedy',
    items: [
      { id: 'c1', title: 'The Bear', subtitle: 'Kitchen Drama', gradient: 'from-orange-800 to-red-700', genre: 'Comedy' },
      { id: 'c2', title: 'Only Murders', subtitle: 'Mystery Comedy', gradient: 'from-teal-800 to-cyan-700', genre: 'Comedy' },
      { id: 'c3', title: 'Loot', subtitle: 'Workplace Comedy', gradient: 'from-emerald-800 to-green-700', genre: 'Comedy' },
      { id: 'c4', title: 'Platonic', subtitle: 'Friendship Comedy', gradient: 'from-pink-800 to-fuchsia-700', genre: 'Comedy' },
      { id: 'c5', title: 'Mythic Quest', subtitle: 'Gaming Comedy', gradient: 'from-blue-800 to-indigo-700', genre: 'Comedy' },
      { id: 'c6', title: 'Physical', subtitle: 'Dark Comedy', gradient: 'from-amber-800 to-yellow-700', genre: 'Comedy' },
    ],
  },
]

// ─── Components ──────────────────────────────────────────────────────────────

function ContentRow({ title, items, onSelect }: { title: string; items: ContentItem[]; onSelect: (item: ContentItem) => void }) {
  return (
    <div className="mb-6">
      <h3 className="text-white text-lg font-semibold mb-3 px-1">{title}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="shrink-0 w-[160px] cursor-pointer group"
            onClick={() => onSelect(item)}
          >
            <div className={`w-[160px] h-[90px] rounded-lg bg-gradient-to-br ${item.gradient} mb-2 flex items-end p-2 group-hover:scale-105 transition-transform duration-200 shadow-lg`}>
              <span className="text-white/60 text-[10px] font-medium">{item.genre}</span>
            </div>
            <h4 className="text-white text-[13px] font-medium truncate">{item.title}</h4>
            <p className="text-gray-400 text-[11px] truncate">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailView({ item, onBack, onPlay }: { item: ContentItem; onBack: () => void; onPlay: (item: ContentItem) => void }) {
  return (
    <div className="flex flex-col h-full">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors mb-4 shrink-0">
        <ChevronLeft size={18} />
        <span className="text-sm">Back</span>
      </button>
      <div className={`w-full aspect-video max-h-[280px] rounded-xl bg-gradient-to-br ${item.gradient} mb-6 flex items-center justify-center shadow-2xl`}>
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">{item.title}</h1>
          <p className="text-white/70 text-sm">{item.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button
          onClick={() => onPlay(item)}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          <Play size={16} fill="black" /> Play
        </button>
        <button className="p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
          <Volume2 size={18} className="text-white" />
        </button>
        <button className="p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
          <Heart size={18} className="text-white" />
        </button>
      </div>
      <div className="flex items-center gap-3 text-[12px] text-gray-400 mb-4 shrink-0">
        {item.year && <span>{item.year}</span>}
        {item.rating && <span className="border border-gray-600 px-1.5 py-0.5 rounded text-[10px]">{item.rating}</span>}
        {item.genre && <span>{item.genre}</span>}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed flex-1 overflow-y-auto">
        Experience the captivating world of {item.title}. {item.subtitle} takes you on an unforgettable journey through stunning visuals and compelling storytelling that will keep you on the edge of your seat.
      </p>
    </div>
  )
}

function VideoPlayer({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [progress, setProgress] = useState(0)

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 0.2, 100))
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  React.useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [showControls])

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {/* Simulated video content */}
      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-30`} />
      <div className="absolute inset-0 bg-black/50" />

      {!isPlaying && (
        <div className="relative z-10 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Play size={40} className="text-white ml-1" fill="white" />
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute inset-0 flex flex-col justify-end z-20" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); setProgress((e.nativeEvent.offsetX / (e.currentTarget as HTMLElement).offsetWidth) * 100) }}>
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-white hover:text-gray-300 transition-colors" onClick={(e) => { e.stopPropagation(); onClose() }}>
                  <X size={20} />
                </button>
                <button className="text-white hover:text-gray-300 transition-colors" onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying) }}>
                  {isPlaying ? <Pause size={22} /> : <Play size={22} fill="white" />}
                </button>
                <button className="text-white hover:text-gray-300 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <SkipBack size={18} />
                </button>
                <button className="text-white hover:text-gray-300 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <SkipForward size={18} />
                </button>
                <span className="text-white/80 text-sm ml-2">{item.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-white hover:text-gray-300 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Volume2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main AppleTV Component ──────────────────────────────────────────────────

export default function AppleTV() {
  const [activeCategory, setActiveCategory] = useState('watchnow')
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [playingItem, setPlayingItem] = useState<ContentItem | null>(null)
  const [featuredIndex, setFeaturedIndex] = useState(0)

  if (playingItem) {
    return (
      <div className="w-full h-full">
        <VideoPlayer item={playingItem} onClose={() => setPlayingItem(null)} />
      </div>
    )
  }

  return (
    <div className="flex w-full h-full bg-[#111111] text-white select-none overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <div className="shrink-0 w-[180px] bg-[#1c1c1e] border-r border-white/5 flex flex-col py-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.5 2h-13A2.5 2.5 0 003 4.5v15A2.5 2.5 0 005.5 22h13a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0018.5 2zM9 17H7v-5h2v5zm4 0h-2V7h2v10zm4 0h-2v-3h2v3z" />
            </svg>
            <span className="text-sm font-semibold">Apple TV+</span>
          </div>
        </div>

        <div className="px-2 space-y-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeCategory === cat.id
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => { setActiveCategory(cat.id); setSelectedItem(null) }}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto px-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-gray-500 text-[11px]">
            <Search size={12} />
            <span>Search</span>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="p-6">
          {selectedItem ? (
            <DetailView
              item={selectedItem}
              onBack={() => setSelectedItem(null)}
              onPlay={(item) => setPlayingItem(item)}
            />
          ) : (
            <>
              {/* Featured Carousel */}
              <div className="mb-8">
                <div className="relative rounded-xl overflow-hidden">
                  <div
                    className={`w-full h-[280px] bg-gradient-to-br ${FEATURED[featuredIndex].gradient} flex items-end p-8 cursor-pointer`}
                    onClick={() => setSelectedItem(FEATURED[featuredIndex])}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-1 drop-shadow-lg">{FEATURED[featuredIndex].title}</h2>
                      <p className="text-white/70 text-sm mb-3">{FEATURED[featuredIndex].subtitle}</p>
                      <button
                        className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setPlayingItem(FEATURED[featuredIndex]) }}
                      >
                        <Play size={14} fill="black" /> Play
                      </button>
                    </div>
                  </div>
                  {/* Carousel dots */}
                  <div className="absolute bottom-4 right-6 flex gap-1.5">
                    {FEATURED.map((_, i) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === featuredIndex ? 'bg-white w-5' : 'bg-white/40'}`}
                        onClick={() => setFeaturedIndex(i)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Rows */}
              {CONTENT_ROWS.map((row) => (
                <ContentRow key={row.title} title={row.title} items={row.items} onSelect={setSelectedItem} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
