'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Plus,
  X,
  Share2,
  Search,
  Star,
  Lock,
  RotateCw,
  AlertCircle,
  Loader2,
  Play,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tab {
  id: string
  title: string
  url: string
  favicon: string
  isLoading: boolean
  loadingProgress: number
  contentType?: 'newtab' | 'search' | 'youtube-browse' | 'youtube' | 'webpage' | 'simulated' | 'error'
  searchResults?: SearchResult[]
  youtubeResults?: YouTubeSearchResult[]
  youtubeSearchQuery?: string
  pageContent?: PageReadResult
  errorMessage?: string
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

interface YouTubeSearchResult {
  videoId: string
  url: string
  title: string
  snippet: string
  hostName: string
  rank: number
  date: string
  thumbnail: string
  channelName: string
}

interface PageReadResult {
  title: string
  url: string
  html: string
  publishedTime: string
}

interface BookmarkItem {
  name: string
  url: string
  favicon: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BOOKMARKS: BookmarkItem[] = [
  { name: 'Google', url: 'google.com', favicon: '' },
  { name: 'YouTube', url: 'youtube.com', favicon: '' },
  { name: 'Gmail', url: 'mail.google.com', favicon: '' },
  { name: 'GitHub', url: 'github.com', favicon: '' },
  { name: 'Wikipedia', url: 'wikipedia.org', favicon: '' },
  { name: 'Reddit', url: 'reddit.com', favicon: '' },
  { name: 'Twitter', url: 'x.com', favicon: '' },
  { name: 'Stack Overflow', url: 'stackoverflow.com', favicon: '' },
]

interface FaviconConfig {
  letter?: string
  bgColor: string
  textColor?: string
  borderColor?: string
  icon?: 'github'
}

const FAVICON_CONFIG: Record<string, FaviconConfig> = {
  'google.com': { letter: 'G', bgColor: '#4285F4' },
  'mail.google.com': { letter: 'M', bgColor: '#EA4335' },
  'youtube.com': { letter: '\u25B6', bgColor: '#FF0000' },
  'github.com': { bgColor: '#24292e', icon: 'github' },
  'wikipedia.org': { letter: 'W', bgColor: '#ffffff', textColor: '#333333', borderColor: '#cccccc' },
  'reddit.com': { letter: 'R', bgColor: '#FF4500' },
  'x.com': { letter: 'X', bgColor: '#000000' },
  'stackoverflow.com': { letter: 'S', bgColor: '#F48024' },
}

const FAVICON_MAP: Record<string, string> = {
  'google.com': 'google',
  'youtube.com': 'youtube',
  'github.com': 'github',
  'wikipedia.org': 'wikipedia',
  'reddit.com': 'reddit',
  'x.com': 'x',
  'stackoverflow.com': 'stackoverflow',
}

let tabCounter = 0

function generateTabId(): string {
  tabCounter++
  return `chrome-tab-${tabCounter}-${Date.now()}`
}

function FaviconIcon({ url, size = 'default' }: { url: string; size?: 'default' | 'small' }) {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  let config: FaviconConfig | undefined

  if (normalized.includes('google') && normalized.includes('mail')) config = FAVICON_CONFIG['mail.google.com']
  else if (normalized.includes('google')) config = FAVICON_CONFIG['google.com']
  else if (normalized.includes('youtube')) config = FAVICON_CONFIG['youtube.com']
  else if (normalized.includes('github')) config = FAVICON_CONFIG['github.com']
  else if (normalized.includes('wikipedia')) config = FAVICON_CONFIG['wikipedia.org']
  else if (normalized.includes('reddit')) config = FAVICON_CONFIG['reddit.com']
  else if (normalized.includes('x.com') || normalized.includes('twitter')) config = FAVICON_CONFIG['x.com']
  else if (normalized.includes('stackoverflow')) config = FAVICON_CONFIG['stackoverflow.com']

  if (!config) {
    return <Globe size={size === 'small' ? 12 : 16} className="text-gray-400" />
  }

  const dim = size === 'small' ? 16 : 28
  const fontSize = size === 'small' ? 9 : 14

  const githubIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: dim * 0.6, height: dim * 0.6 }}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )

  return (
    <div
      className="flex items-center justify-center shrink-0 rounded"
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
      {config.icon === 'github' ? githubIcon : config.letter}
    </div>
  )
}

function createTab(url: string = 'localhost:3000', title?: string): Tab {
  return {
    id: generateTabId(),
    title: title ?? 'New Tab',
    url,
    favicon: FAVICON_MAP[url] ?? '',
    isLoading: false,
    loadingProgress: 0,
    contentType: 'newtab',
  }
}

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
  const trimmed = text.trim().toLowerCase()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    const tld = trimmed.split('.').pop()?.split('/')[0]
    if (tld && tld.length >= 2) return true
  }
  return false
}

function isYouTubeUrl(url: string): boolean {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '')
  return normalized.includes('youtube.com') || normalized.includes('youtu.be')
}

function getDisplayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

// ─── Chrome New Tab Page ─────────────────────────────────────────────────────

function ChromeNewTabPage({ onNavigate, onSearch }: { onNavigate: (url: string) => void; onSearch: (query: string) => void }) {
  const [searchValue, setSearchValue] = useState('')
  const onNavigateRef = useRef(onNavigate)
  const onSearchRef = useRef(onSearch)
  useEffect(() => { onNavigateRef.current = onNavigate }, [onNavigate])
  useEffect(() => { onSearchRef.current = onSearch }, [onSearch])

  const handleSearch = () => {
    if (searchValue.trim()) {
      if (isUrl(searchValue.trim())) {
        onNavigateRef.current(searchValue.trim())
      } else {
        onSearchRef.current(searchValue.trim())
      }
    }
  }

  return (
    <div className="flex flex-col items-center w-full min-h-full bg-[#202124] text-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
        <div className="text-6xl font-bold mb-8 tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>
        <div className="w-full max-w-[584px] relative">
          <div className="flex items-center bg-[#303134] rounded-full px-5 py-3 hover:bg-[#3c4043] focus-within:bg-[#3c4043] transition-colors shadow-lg">
            <Search size={18} className="text-[#9aa0a6] mr-3 shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-base outline-none bg-transparent text-white placeholder:text-[#9aa0a6]"
              placeholder="Search Google or type a URL"
            />
            {searchValue && (
              <button onClick={() => setSearchValue('')} className="ml-2">
                <X size={18} className="text-[#9aa0a6] hover:text-white" />
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-10">
          {BOOKMARKS.map((bm) => (
            <div
              key={bm.url}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onClick={() => onNavigateRef.current(bm.url)}
            >
              <div className="w-12 h-12 rounded-full bg-[#303134] flex items-center justify-center group-hover:bg-[#3c4043] transition-colors">
                <FaviconIcon url={bm.url} size="small" />
              </div>
              <span className="text-[12px] text-[#bdc1c6] group-hover:text-white truncate max-w-[80px] text-center transition-colors">
                {bm.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Search Results Page ──────────────────────────────────────────────────────

function SearchResultsPage({ query, results, onNavigate, onSearch }: {
  query: string
  results: SearchResult[]
  onNavigate: (url: string) => void
  onSearch: (q: string) => void
}) {
  const [searchInput, setSearchInput] = useState(query)

  return (
    <div className="flex flex-col w-full min-h-full bg-white">
      <div className="border-b border-gray-200 px-6 py-3 shrink-0">
        <div className="flex items-center gap-3 max-w-[692px]">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
          <div className="flex-1 flex items-center border border-gray-200 rounded-full px-4 py-2 focus-within:shadow-sm transition-shadow">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchInput.trim()) {
                  onSearch(searchInput.trim())
                }
              }}
              className="flex-1 text-sm outline-none bg-transparent text-gray-800"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="ml-2">
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <button
              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => searchInput.trim() && onSearch(searchInput.trim())}
            >
              <Search size={16} className="text-blue-500" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-3">
        <div className="max-w-[600px]">
          <p className="text-[12px] text-gray-500 mb-4">
            About {results.length} results
          </p>
          {results.map((result, i) => {
            const isYtVideo = extractYouTubeVideoId(result.url)
            return (
              <div key={i} className="mb-6">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#f1f3f4' }}>
                    {isYtVideo ? (
                      <div className="w-4 h-4 rounded-sm bg-red-500 flex items-center justify-center">
                        <Play size={8} className="text-white fill-white" />
                      </div>
                    ) : (
                      <Globe size={10} className="text-gray-500" />
                    )}
                  </div>
                  <span className="text-[12px] text-gray-600">{result.host_name}</span>
                </div>
                <button
                  className="text-[#1a0dab] text-[18px] font-normal hover:underline text-left leading-snug mb-0.5 block"
                  onClick={() => onNavigate(result.url)}
                >
                  {result.name}
                </button>
                <p className="text-[13px] text-[#4d5156] leading-snug">{result.snippet}</p>
              </div>
            )
          })}
          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No results found</h3>
              <p className="text-sm text-gray-400">Try different keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── YouTube Browse View ─────────────────────────────────────────────────────

function YouTubeBrowseView({
  results,
  searchQuery,
  onPlayVideo,
  onSearch,
}: {
  results: YouTubeSearchResult[]
  searchQuery?: string
  onPlayVideo: (videoId: string, title: string) => void
  onSearch: (query: string) => void
}) {
  const [searchInput, setSearchInput] = useState(searchQuery || '')

  return (
    <div className="flex flex-col w-full min-h-full bg-[#0f0f0f]">
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-[#0f0f0f] border-b border-white/10">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 bg-red-600 rounded-sm flex items-center justify-center">
            <Play size={12} className="text-white fill-white ml-0.5" />
          </div>
          <span className="text-white font-bold text-[15px]">YouTube</span>
        </div>
        <div className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center bg-[#121212] border border-[#303030] rounded-full overflow-hidden">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchInput.trim()) {
                  onSearch(searchInput.trim())
                }
              }}
              className="flex-1 px-4 py-1.5 text-sm outline-none bg-transparent text-white placeholder:text-gray-500"
              placeholder="Search YouTube"
            />
            <button
              className="px-4 py-1.5 bg-[#222222] hover:bg-[#303030] border-l border-[#303030] transition-colors"
              onClick={() => searchInput.trim() && onSearch(searchInput.trim())}
            >
              <Search size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {results.length === 0 && !searchQuery && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
              <Play size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Search for videos</h3>
            <p className="text-sm text-gray-500">Type a search query to find YouTube videos</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((video) => (
            <div
              key={video.videoId || video.url}
              className="group cursor-pointer rounded-xl overflow-hidden bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
              onClick={() => video.videoId && onPlayVideo(video.videoId, video.title)}
            >
              <div className="relative aspect-video bg-[#222] overflow-hidden">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={32} className="text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={20} className="text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-[14px] font-medium text-white leading-snug line-clamp-2 mb-1">{video.title}</h3>
                <p className="text-[12px] text-gray-400 truncate">{video.channelName || video.hostName}</p>
                {video.snippet && (
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{video.snippet}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {results.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-16">
            <Search size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No videos found</h3>
            <p className="text-sm text-gray-500">Try different keywords</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── YouTube Video Player ────────────────────────────────────────────────────

function YouTubeVideoPlayer({ videoId, onBack }: { videoId: string; onBack?: () => void }) {
  return (
    <div className="flex flex-col w-full min-h-full bg-[#0f0f0f]">
      {onBack && (
        <button
          onClick={onBack}
          className="self-start m-3 px-3 py-1.5 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          &#8592; Back
        </button>
      )}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[900px] aspect-video rounded-xl overflow-hidden shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Web Page Content Viewer ─────────────────────────────────────────────────

function WebPageContent({ content }: { content: PageReadResult }) {
  const sanitizedHtml = useMemo(() => {
    if (!content.html) return ''
    let html = content.html
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    html = html.replace(/<embed\b[^>]*>/gi, '')
    html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    html = html.replace(/\son\w+\s*=\s*\S+/gi, '')
    html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    return html
  }, [content.html])

  return (
    <div className="flex flex-col w-full min-h-full bg-white">
      <div className="border-b border-gray-200 px-6 py-3 shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">{content.title}</h1>
        <div className="flex items-center gap-3 mt-1">
          <Globe size={12} className="text-gray-400" />
          <span className="text-[12px] text-gray-500 truncate">{content.url}</span>
          {content.publishedTime && (
            <span className="text-[11px] text-gray-400">&#183; {new Date(content.publishedTime).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div
          className="prose prose-sm max-w-none text-gray-800 leading-relaxed
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-gray-900
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-gray-900
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-900
            [&_p]:mb-4 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
            [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
            [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
            [&_pre]:bg-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4
            [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
          "
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  )
}

// ─── Error Page ──────────────────────────────────────────────────────────────

function ErrorPage({ message, url }: { message: string; url: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-[#202124] text-white">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-lg font-medium mb-2">This site can&apos;t be reached</h2>
      <p className="text-sm text-gray-400 mb-1">{getDisplayUrl(url)}</p>
      <p className="text-sm text-gray-500 max-w-sm text-center">{message}</p>
    </div>
  )
}

// ─── Loading Page ────────────────────────────────────────────────────────────

function LoadingPage() {
  return (
    <div className="flex items-center justify-center w-full min-h-full bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="text-[#4285F4] animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

// ─── Main Chrome Component ───────────────────────────────────────────────────

export default function Chrome() {
  const [tabs, setTabs] = useState<Tab[]>([createTab('localhost:3000', 'New Tab')])
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [editUrl, setEditUrl] = useState('')

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

  const simulateLoading = useCallback((tabId: string, url: string) => {
    const favicon = FAVICON_MAP[url] ?? resolveFaviconChrome(url)
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, isLoading: true, loadingProgress: 0, url, favicon } : t
      )
    )

    if (loadingIntervalsRef.current[tabId]) clearInterval(loadingIntervalsRef.current[tabId])
    if (loadingTimersRef.current[tabId]) clearTimeout(loadingTimersRef.current[tabId])

    loadingIntervalsRef.current[tabId] = setInterval(() => {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== tabId || !t.isLoading) return t
          const newProgress = Math.min(t.loadingProgress + Math.random() * 15 + 5, 95)
          return { ...t, loadingProgress: newProgress }
        })
      )
    }, 80)

    loadingTimersRef.current[tabId] = setTimeout(() => {
      if (loadingIntervalsRef.current[tabId]) clearInterval(loadingIntervalsRef.current[tabId])
    }, 2000)
  }, [])

  const loadUrlContent = useCallback(async (tabId: string, displayUrl: string) => {
    // Check for YouTube video
    const youtubeVideoId = extractYouTubeVideoId(displayUrl)
    if (youtubeVideoId) {
      setTabs(prev => prev.map(t =>
        t.id === tabId ? {
          ...t,
          isLoading: false,
          loadingProgress: 100,
          title: 'YouTube Video',
          contentType: 'youtube' as const,
          favicon: 'youtube',
        } : t
      ))
      return
    }

    // Check if it's YouTube homepage
    if (isYouTubeUrl(displayUrl) && !youtubeVideoId) {
      setTabs(prev => prev.map(t =>
        t.id === tabId ? { ...t, title: 'YouTube' } : t
      ))
      try {
        const searchQuery = 'trending popular videos'
        const response = await fetch(`/api/safari/youtube-search?q=${encodeURIComponent(searchQuery)}&num=12`)
        const data = await response.json()
        if (data.results) {
          setTabs(prev => prev.map(t =>
            t.id === tabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              title: 'YouTube',
              contentType: 'youtube-browse' as const,
              youtubeResults: data.results,
              youtubeSearchQuery: '',
              favicon: 'youtube',
            } : t
          ))
        } else {
          setTabs(prev => prev.map(t =>
            t.id === tabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              contentType: 'error' as const,
              errorMessage: 'Failed to load YouTube.',
            } : t
          ))
        }
      } catch {
        setTabs(prev => prev.map(t =>
          t.id === tabId ? {
            ...t,
            isLoading: false,
            loadingProgress: 100,
            contentType: 'error' as const,
            errorMessage: 'Network error.',
          } : t
        ))
      }
      return
    }

    // Check if it's a search query or URL
    const isSearchQuery = !isUrl(displayUrl)

    if (isSearchQuery) {
      // Check if search query is YouTube-related
      const isYoutubeSearch = displayUrl.toLowerCase().includes('youtube') || displayUrl.toLowerCase().includes('video')

      if (isYoutubeSearch) {
        setTabs(prev => prev.map(t =>
          t.id === tabId ? { ...t, title: `${displayUrl} - YouTube` } : t
        ))
        try {
          const searchQuery = displayUrl.replace(/\byoutube\b/i, '').replace(/\bvideos?\b/i, '').trim() || 'trending'
          const response = await fetch(`/api/safari/youtube-search?q=${encodeURIComponent(searchQuery)}&num=12`)
          const data = await response.json()

          if (data.results) {
            setTabs(prev => prev.map(t =>
              t.id === tabId ? {
                ...t,
                isLoading: false,
                loadingProgress: 100,
                title: `${searchQuery} - YouTube`,
                contentType: 'youtube-browse' as const,
                youtubeResults: data.results,
                youtubeSearchQuery: searchQuery,
                favicon: 'youtube',
              } : t
            ))
          } else {
            setTabs(prev => prev.map(t =>
              t.id === tabId ? {
                ...t,
                isLoading: false,
                loadingProgress: 100,
                contentType: 'error' as const,
                errorMessage: 'Search failed. Please try again.',
              } : t
            ))
          }
        } catch {
          setTabs(prev => prev.map(t =>
            t.id === tabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              contentType: 'error' as const,
              errorMessage: 'Network error.',
            } : t
          ))
        }
        return
      }

      // Regular web search
      try {
        setTabs(prev => prev.map(t =>
          t.id === tabId ? { ...t, title: `${displayUrl} - Google Search` } : t
        ))
        const response = await fetch(`/api/browser/search?q=${encodeURIComponent(displayUrl)}&num=10`)
        const data = await response.json()

        if (data.success && data.results) {
          setTabs(prev => prev.map(t =>
            t.id === tabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              title: `${displayUrl} - Google Search`,
              contentType: 'search' as const,
              searchResults: data.results,
              favicon: 'google',
            } : t
          ))
        } else {
          setTabs(prev => prev.map(t =>
            t.id === tabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              contentType: 'error' as const,
              errorMessage: 'Search failed. Please try again.',
            } : t
          ))
        }
      } catch {
        setTabs(prev => prev.map(t =>
          t.id === tabId ? {
            ...t,
            isLoading: false,
            loadingProgress: 100,
            contentType: 'error' as const,
            errorMessage: 'Network error.',
          } : t
        ))
      }
    } else {
      // Load web page
      try {
        const fullUrl = displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`
        setTabs(prev => prev.map(t =>
          t.id === tabId ? { ...t, title: displayUrl } : t
        ))

        const response = await fetch(`/api/browser/read?url=${encodeURIComponent(fullUrl)}`)
        const data = await response.json()

        if (data.success && data.data) {
          const pageContent: PageReadResult = data.data || { title: displayUrl, url: fullUrl, html: '', publishedTime: '' }

          const readYoutubeId = extractYouTubeVideoId(pageContent.url || fullUrl)
          if (readYoutubeId) {
            setTabs(prev => prev.map(t =>
              t.id === tabId ? {
                ...t,
                isLoading: false,
                loadingProgress: 100,
                title: 'YouTube Video',
                contentType: 'youtube' as const,
                favicon: 'youtube',
              } : t
            ))
            return
          }

          setTabs(prev => prev.map(t =>
            t.id === tabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              title: pageContent.title || displayUrl,
              contentType: 'webpage' as const,
              pageContent,
            } : t
          ))
        } else {
          setTabs(prev => prev.map(t =>
            t.id === tabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              contentType: 'error' as const,
              errorMessage: 'Failed to load page. The site may not allow reading.',
            } : t
          ))
        }
      } catch {
        setTabs(prev => prev.map(t =>
          t.id === tabId ? {
            ...t,
            isLoading: false,
            loadingProgress: 100,
            contentType: 'error' as const,
            errorMessage: 'Network error.',
          } : t
        ))
      }
    }
  }, [])

  const navigateToUrl = useCallback(
    (url: string) => {
      const displayUrl = url.trim() || 'localhost:3000'
      const currentTab = tabs.find((t) => t.id === activeTabId)
      if (currentTab?.url === displayUrl) return

      simulateLoading(activeTabId, displayUrl)
      setTabHistories((prev) => {
        const hist = prev[activeTabId] ?? { urls: ['localhost:3000'], index: 0 }
        const newUrls = [...hist.urls.slice(0, hist.index + 1), displayUrl]
        return { ...prev, [activeTabId]: { urls: newUrls, index: newUrls.length - 1 } }
      })

      if (displayUrl === 'localhost:3000') {
        setTabs(prev => prev.map(t =>
          t.id === activeTabId ? {
            ...t,
            isLoading: false,
            loadingProgress: 100,
            title: 'New Tab',
            contentType: 'newtab' as const,
            favicon: '',
          } : t
        ))
        return
      }

      loadUrlContent(activeTabId, displayUrl)
    },
    [activeTabId, tabs, simulateLoading, loadUrlContent]
  )

  // Search from new tab page or search bar
  const handleSearch = useCallback(
    (query: string) => {
      navigateToUrl(query)
    },
    [navigateToUrl]
  )

  const goBack = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index <= 0) return
    const newIndex = hist.index - 1
    const prevUrl = hist.urls[newIndex]

    simulateLoading(activeTabId, prevUrl)
    setTabHistories((prev) => ({ ...prev, [activeTabId]: { ...prev[activeTabId], index: newIndex } }))

    if (prevUrl === 'localhost:3000') {
      setTabs(prev => prev.map(t =>
        t.id === activeTabId ? {
          ...t,
          isLoading: false,
          loadingProgress: 100,
          title: 'New Tab',
          contentType: 'newtab' as const,
        } : t
      ))
    } else {
      loadUrlContent(activeTabId, prevUrl)
    }
  }, [activeTabId, tabHistories, simulateLoading, loadUrlContent])

  const goForward = useCallback(() => {
    const hist = tabHistories[activeTabId]
    if (!hist || hist.index >= hist.urls.length - 1) return
    const newIndex = hist.index + 1
    const nextUrl = hist.urls[newIndex]

    simulateLoading(activeTabId, nextUrl)
    setTabHistories((prev) => ({ ...prev, [activeTabId]: { ...prev[activeTabId], index: newIndex } }))

    if (nextUrl === 'localhost:3000') {
      setTabs(prev => prev.map(t =>
        t.id === activeTabId ? {
          ...t,
          isLoading: false,
          loadingProgress: 100,
          title: 'New Tab',
          contentType: 'newtab' as const,
        } : t
      ))
    } else {
      loadUrlContent(activeTabId, nextUrl)
    }
  }, [activeTabId, tabHistories, simulateLoading, loadUrlContent])

  const handleReload = useCallback(() => {
    const currentUrl = activeTab.url
    if (currentUrl === 'localhost:3000') return
    simulateLoading(activeTabId, currentUrl)
    loadUrlContent(activeTabId, currentUrl)
  }, [activeTab, activeTabId, simulateLoading, loadUrlContent])

  const addTab = useCallback(() => {
    const newTab = createTab('localhost:3000', 'New Tab')
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
    setTabHistories((prev) => ({ ...prev, [newTab.id]: { urls: ['localhost:3000'], index: 0 } }))
    setIsEditingUrl(false)
  }, [])

  const closeTab = useCallback(
    (tabId: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (loadingTimersRef.current[tabId]) clearTimeout(loadingTimersRef.current[tabId])
      if (loadingIntervalsRef.current[tabId]) clearInterval(loadingIntervalsRef.current[tabId])
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
      if (e.key === 'Enter') handleUrlSubmit()
      else if (e.key === 'Escape') { setIsEditingUrl(false); setEditUrl('') }
    },
    [handleUrlSubmit]
  )

  // Play YouTube video from browse view
  const handlePlayYouTubeVideo = useCallback(
    (videoId: string, title: string) => {
      const url = `https://www.youtube.com/watch?v=${videoId}`
      setTabHistories((prev) => {
        const hist = prev[activeTabId] ?? { urls: ['localhost:3000'], index: 0 }
        const newUrls = [...hist.urls.slice(0, hist.index + 1), url]
        return { ...prev, [activeTabId]: { urls: newUrls, index: newUrls.length - 1 } }
      })
      setTabs(prev => prev.map(t =>
        t.id === activeTabId ? {
          ...t,
          url,
          title: title || 'YouTube Video',
          contentType: 'youtube' as const,
          favicon: 'youtube',
          isLoading: false,
          loadingProgress: 100,
        } : t
      ))
    },
    [activeTabId]
  )

  // YouTube search from browse view
  const handleYouTubeSearch = useCallback(
    (query: string) => {
      simulateLoading(activeTabId, `yt:search:${query}`)
      setTabs(prev => prev.map(t =>
        t.id === activeTabId ? { ...t, title: `${query} - YouTube` } : t
      ))
      void (async () => {
        try {
          const response = await fetch(`/api/safari/youtube-search?q=${encodeURIComponent(query)}&num=12`)
          const data = await response.json()
          if (data.results) {
            setTabs(prev => prev.map(t =>
              t.id === activeTabId ? {
                ...t,
                isLoading: false,
                loadingProgress: 100,
                title: `${query} - YouTube`,
                contentType: 'youtube-browse' as const,
                youtubeResults: data.results,
                youtubeSearchQuery: query,
                favicon: 'youtube',
              } : t
            ))
          }
        } catch {
          setTabs(prev => prev.map(t =>
            t.id === activeTabId ? {
              ...t,
              isLoading: false,
              loadingProgress: 100,
              contentType: 'error' as const,
              errorMessage: 'YouTube search failed.',
            } : t
          ))
        }
      })()
    },
    [activeTabId, simulateLoading]
  )

  useEffect(() => {
    return () => {
      Object.values(loadingTimersRef.current).forEach(clearTimeout)
      Object.values(loadingIntervalsRef.current).forEach(clearInterval)
    }
  }, [])

  // Render content based on tab contentType
  const renderContent = () => {
    const tab = activeTab

    if (tab.isLoading) return <LoadingPage />

    switch (tab.contentType) {
      case 'newtab':
        return <ChromeNewTabPage onNavigate={navigateToUrl} onSearch={handleSearch} />
      case 'youtube':
        return <YouTubeVideoPlayer videoId={extractYouTubeVideoId(tab.url) || ''} onBack={canGoBack ? goBack : undefined} />
      case 'youtube-browse':
        return tab.youtubeResults ? (
          <YouTubeBrowseView
            results={tab.youtubeResults}
            searchQuery={tab.youtubeSearchQuery}
            onPlayVideo={handlePlayYouTubeVideo}
            onSearch={handleYouTubeSearch}
          />
        ) : <LoadingPage />
      case 'search':
        return tab.searchResults ? (
          <SearchResultsPage
            query={tab.title.replace(' - Google Search', '')}
            results={tab.searchResults}
            onNavigate={navigateToUrl}
            onSearch={handleSearch}
          />
        ) : <LoadingPage />
      case 'webpage':
        return tab.pageContent ? <WebPageContent content={tab.pageContent} /> : <LoadingPage />
      case 'error':
        return <ErrorPage message={tab.errorMessage || 'Unknown error'} url={tab.url} />
      default:
        return <ChromeNewTabPage onNavigate={navigateToUrl} onSearch={handleSearch} />
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-white text-gray-900 text-sm select-none overflow-hidden" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Chrome Tab Bar */}
      <div className="shrink-0 bg-[#202124] pt-2" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
        <div className="flex items-end gap-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <div
                key={tab.id}
                className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-[6px] min-w-[100px] max-w-[240px] text-[12px] cursor-pointer transition-all duration-150 relative ${
                  isActive
                    ? 'bg-white text-gray-800 rounded-t-lg'
                    : 'bg-[#35363a] text-[#e8eaed] hover:bg-[#3c4043] rounded-t-lg'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className="shrink-0">
                  {tab.isLoading ? (
                    <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                    <FaviconIcon url={tab.url} size="small" />
                  )}
                </span>
                <span className="truncate flex-1" style={{ fontWeight: isActive ? 500 : 400, fontSize: '12px' }}>{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-100 hover:bg-gray-300/70"
                    onClick={(e) => closeTab(tab.id, e)}
                  >
                    <X size={9} className={isActive ? 'text-gray-600' : 'text-gray-400'} />
                  </button>
                )}
              </div>
            )
          })}
          <button
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#35363a] text-[#9aa0a6] transition-colors duration-100 mb-0.5 ml-1"
            onClick={addTab}
            title="New Tab"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Chrome Toolbar */}
      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <button
            className={`p-1.5 rounded-full transition-colors ${canGoBack ? 'hover:bg-gray-200 text-gray-600' : 'text-gray-300 cursor-default'}`}
            onClick={goBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className={`p-1.5 rounded-full transition-colors ${canGoForward ? 'hover:bg-gray-200 text-gray-600' : 'text-gray-300 cursor-default'}`}
            onClick={goForward}
            disabled={!canGoForward}
          >
            <ArrowRight size={16} />
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            onClick={handleReload}
            title="Reload"
          >
            <RotateCw size={16} />
          </button>

          {/* Chrome URL Bar */}
          <div className="flex-1 mx-1">
            <div
              className="flex items-center bg-[#f1f3f4] rounded-full px-4 py-[7px] hover:bg-[#e8eaed] focus-within:bg-white focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:rounded-lg transition-all cursor-text"
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
                  className="flex-1 text-[14px] outline-none bg-transparent text-gray-800"
                  autoFocus
                  placeholder="Search Google or type a URL"
                />
              ) : (
                <div className="flex items-center justify-center gap-1.5 w-full">
                  {activeTab.url !== 'localhost:3000' && !activeTab.url.startsWith('yt:search:') && (
                    <Lock size={12} className="text-gray-400 shrink-0" />
                  )}
                  <span className="text-[14px] text-gray-500 truncate">
                    {activeTab.url === 'localhost:3000' ? 'Search Google or type a URL' : activeTab.url.startsWith('yt:search:') ? activeTab.url.replace('yt:search:', '') : getDisplayUrl(activeTab.url)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors" title="Bookmark">
            <Star size={16} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors" title="Share">
            <Share2 size={16} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors" title="More">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="shrink-0 bg-[#f9f9f9] border-b border-gray-200 px-4 py-1 flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {BOOKMARKS.map((bm) => (
          <div
            key={bm.url}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-gray-200 cursor-pointer text-[12px] text-gray-600 whitespace-nowrap transition-colors"
            onClick={() => navigateToUrl(bm.url)}
          >
            <FaviconIcon url={bm.url} size="small" />
            <span>{bm.name}</span>
          </div>
        ))}
      </div>

      {/* Loading Bar */}
      {activeTab.isLoading && (
        <div className="h-[3px] bg-gray-100 shrink-0">
          <div
            className="h-full bg-[#4285F4] transition-all duration-150 ease-out"
            style={{ width: `${activeTab.loadingProgress}%` }}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  )
}

function resolveFaviconChrome(url: string): string {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (normalized.includes('google')) return 'google'
  if (normalized.includes('youtube')) return 'youtube'
  if (normalized.includes('github')) return 'github'
  if (normalized.includes('wikipedia')) return 'wikipedia'
  if (normalized.includes('reddit')) return 'reddit'
  if (normalized.includes('x.com') || normalized.includes('twitter')) return 'x'
  if (normalized.includes('stackoverflow')) return 'stackoverflow'
  return ''
}
