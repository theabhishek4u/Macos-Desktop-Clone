'use client'

import React, { useState, useCallback, useRef, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Columns3,
  Search,
  Folder,
  File,
  HardDrive,
  Globe,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'list' | 'column'

interface FSNode {
  name: string
  emoji: string
  type: 'folder' | 'file'
  children?: FSNode[]
}

// ─── Virtual File System ─────────────────────────────────────────────────────

const FILE_SYSTEM: FSNode = {
  name: 'Root',
  emoji: '🖥️',
  type: 'folder',
  children: [
    {
      name: 'Desktop',
      emoji: '🖥️',
      type: 'folder',
      children: [
        { name: 'Screenshot.png', emoji: '🖼️', type: 'file' },
        { name: 'Notes.txt', emoji: '📄', type: 'file' },
        {
          name: 'Project',
          emoji: '📁',
          type: 'folder',
          children: [
            { name: 'index.html', emoji: '📄', type: 'file' },
            { name: 'style.css', emoji: '📄', type: 'file' },
            { name: 'app.js', emoji: '📄', type: 'file' },
          ],
        },
      ],
    },
    {
      name: 'Documents',
      emoji: '📄',
      type: 'folder',
      children: [
        { name: 'Resume.pdf', emoji: '📋', type: 'file' },
        { name: 'Budget.xlsx', emoji: '📊', type: 'file' },
        { name: 'Letter.docx', emoji: '📝', type: 'file' },
        {
          name: 'Archive',
          emoji: '📁',
          type: 'folder',
          children: [
            { name: 'old-report.pdf', emoji: '📋', type: 'file' },
            { name: 'backup.zip', emoji: '🗜️', type: 'file' },
          ],
        },
      ],
    },
    {
      name: 'Downloads',
      emoji: '⬇️',
      type: 'folder',
      children: [
        { name: 'installer.dmg', emoji: '💿', type: 'file' },
        { name: 'photo.jpg', emoji: '🖼️', type: 'file' },
        { name: 'song.mp3', emoji: '🎵', type: 'file' },
      ],
    },
    {
      name: 'Applications',
      emoji: '📦',
      type: 'folder',
      children: [
        { name: 'Safari', emoji: '🧭', type: 'file' },
        { name: 'Calculator', emoji: '🧮', type: 'file' },
        { name: 'Notes', emoji: '📝', type: 'file' },
        { name: 'Terminal', emoji: '💻', type: 'file' },
        { name: 'Calendar', emoji: '📅', type: 'file' },
      ],
    },
    {
      name: 'Pictures',
      emoji: '🖼️',
      type: 'folder',
      children: [
        {
          name: 'Vacation',
          emoji: '📁',
          type: 'folder',
          children: [
            { name: 'beach.jpg', emoji: '🖼️', type: 'file' },
            { name: 'sunset.jpg', emoji: '🖼️', type: 'file' },
          ],
        },
        {
          name: 'Screenshots',
          emoji: '📁',
          type: 'folder',
          children: [
            { name: 'screen-1.png', emoji: '🖼️', type: 'file' },
            { name: 'screen-2.png', emoji: '🖼️', type: 'file' },
          ],
        },
        { name: 'wallpaper.jpg', emoji: '🖼️', type: 'file' },
      ],
    },
    {
      name: 'Music',
      emoji: '🎵',
      type: 'folder',
      children: [
        {
          name: 'Playlists',
          emoji: '📁',
          type: 'folder',
          children: [
            { name: 'favorites.m3u', emoji: '🎵', type: 'file' },
            { name: 'workout.m3u', emoji: '🎵', type: 'file' },
          ],
        },
        { name: 'song.mp3', emoji: '🎵', type: 'file' },
      ],
    },
  ],
}

// ─── Sidebar items ───────────────────────────────────────────────────────────

interface SidebarItem {
  name: string
  emoji: string
  path: string[]
}

const FAVORITES: SidebarItem[] = [
  { name: 'Desktop', emoji: '🖥️', path: ['Desktop'] },
  { name: 'Documents', emoji: '📄', path: ['Documents'] },
  { name: 'Downloads', emoji: '⬇️', path: ['Downloads'] },
  { name: 'Applications', emoji: '📦', path: ['Applications'] },
  { name: 'Pictures', emoji: '🖼️', path: ['Pictures'] },
  { name: 'Music', emoji: '🎵', path: ['Music'] },
]

const LOCATIONS: SidebarItem[] = [
  { name: 'Macintosh HD', emoji: '💾', path: [] },
  { name: 'Network', emoji: '🌐', path: [] },
]

// ─── Helper: resolve a path to its FSNode ────────────────────────────────────

function resolveNode(path: string[]): FSNode | null {
  let node: FSNode = FILE_SYSTEM
  for (const segment of path) {
    const child = node.children?.find((c) => c.name === segment)
    if (!child) return null
    node = child
  }
  return node
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Finder() {
  const [currentPath, setCurrentPath] = useState<string[]>(['Desktop'])
  const [history, setHistory] = useState<string[][]>([['Desktop']])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // Navigate to a new path, pushing onto history
  const navigateTo = useCallback(
    (path: string[]) => {
      const newPath = [...path]
      setCurrentPath(newPath)
      setSelectedItem(null)
      setSearchQuery('')

      // Trim future history when navigating from a non-latest position
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newPath)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex]
  )

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentPath(history[newIndex])
      setSelectedItem(null)
      setSearchQuery('')
    }
  }, [history, historyIndex])

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCurrentPath(history[newIndex])
      setSelectedItem(null)
      setSearchQuery('')
    }
  }, [history, historyIndex])

  const navigateUp = useCallback(() => {
    if (currentPath.length > 0) {
      navigateTo(currentPath.slice(0, -1))
    }
  }, [currentPath, navigateTo])

  // Resolve current directory
  const currentNode = useMemo(() => resolveNode(currentPath), [currentPath])

  // Filter items by search
  const displayItems = useMemo(() => {
    if (!currentNode?.children) return []
    const items = [...currentNode.children]
    // Sort: folders first, then files
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })
    if (!searchQuery.trim()) return items
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentNode, searchQuery])

  // Handle double-click on a folder
  const handleItemDoubleClick = useCallback(
    (item: FSNode) => {
      if (item.type === 'folder') {
        navigateTo([...currentPath, item.name])
      }
    },
    [currentPath, navigateTo]
  )

  // Handle single click on a folder in column view
  const handleColumnFolderClick = useCallback(
    (item: FSNode) => {
      if (item.type === 'folder') {
        navigateTo([...currentPath, item.name])
      }
    },
    [currentPath, navigateTo]
  )

  // ─── Sidebar resize handlers ──────────────────────────────────────────

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = sidebarWidth

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return
      const delta = ev.clientX - startX.current
      const newWidth = Math.max(140, Math.min(400, startWidth.current + delta))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [sidebarWidth])

  // Path for comparing sidebar active state
  const sidebarActivePath = currentPath.join('/')

  // Column view: compute all columns up to current path + one more for selected subfolder
  const [columnPreviewPath, setColumnPreviewPath] = useState<string[] | null>(null)

  const columnPaths = useMemo(() => {
    const paths: string[][] = [[]]
    for (let i = 0; i < currentPath.length; i++) {
      paths.push(currentPath.slice(0, i + 1))
    }
    if (columnPreviewPath) {
      paths.push(columnPreviewPath)
    }
    return paths
  }, [currentPath, columnPreviewPath])

  return (
    <div className="flex w-full h-full bg-white text-gray-900 text-sm select-none overflow-hidden">
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col border-r border-gray-200 bg-gray-100/80 overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        {/* Favorites */}
        <div className="pt-3 pb-1 px-3">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Favorites
          </h3>
        </div>
        <div className="px-2">
          {FAVORITES.map((item) => {
            const isActive = sidebarActivePath === item.path.join('/')
            return (
              <button
                key={item.name}
                className={`w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] transition-colors duration-100 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-600 font-medium'
                    : 'hover:bg-blue-500/10 text-gray-700'
                }`}
                onClick={() => navigateTo(item.path)}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <span className="truncate">{item.name}</span>
              </button>
            )
          })}
        </div>

        {/* Locations */}
        <div className="pt-4 pb-1 px-3">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Locations
          </h3>
        </div>
        <div className="px-2">
          {LOCATIONS.map((item) => {
            const isActive =
              item.path.length === 0 && currentPath.length === 0
            return (
              <button
                key={item.name}
                className={`w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] transition-colors duration-100 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-600 font-medium'
                    : 'hover:bg-blue-500/10 text-gray-700'
                }`}
                onClick={() => navigateTo(item.path)}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <span className="truncate">{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Resize Handle ──────────────────────────────────────────────── */}
      <div
        className="w-[5px] shrink-0 cursor-col-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors duration-150 relative z-10"
        onMouseDown={handleResizeMouseDown}
      />

      {/* ─── Main Content Area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ─── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50/80 shrink-0">
          {/* Back / Forward */}
          <button
            className={`p-1 rounded-md transition-colors ${
              historyIndex > 0
                ? 'hover:bg-gray-200 text-gray-600'
                : 'text-gray-300 cursor-default'
            }`}
            onClick={goBack}
            disabled={historyIndex <= 0}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className={`p-1 rounded-md transition-colors ${
              historyIndex < history.length - 1
                ? 'hover:bg-gray-200 text-gray-600'
                : 'text-gray-300 cursor-default'
            }`}
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
          >
            <ChevronRight size={16} />
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* View mode toggles */}
          <button
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-500/20 text-blue-600'
                : 'hover:bg-gray-200 text-gray-500'
            }`}
            onClick={() => setViewMode('grid')}
            title="Icon View"
          >
            <Grid3X3 size={15} />
          </button>
          <button
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500/20 text-blue-600'
                : 'hover:bg-gray-200 text-gray-500'
            }`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={15} />
          </button>
          <button
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'column'
                ? 'bg-blue-500/20 text-blue-600'
                : 'hover:bg-gray-200 text-gray-500'
            }`}
            onClick={() => setViewMode('column')}
            title="Column View"
          >
            <Columns3 size={15} />
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-0.5 text-[12px] text-gray-500 min-w-0 flex-1 overflow-hidden">
            <button
              className="hover:text-gray-800 transition-colors shrink-0"
              onClick={() => navigateTo([])}
            >
              <HardDrive size={13} className="inline -mt-0.5" />
            </button>
            {currentPath.map((segment, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={11} className="shrink-0 text-gray-400" />
                <button
                  className="hover:text-gray-800 transition-colors truncate"
                  onClick={() => navigateTo(currentPath.slice(0, i + 1))}
                >
                  {segment}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative shrink-0">
            <Search
              size={13}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-[140px] h-[26px] pl-7 pr-2 text-[12px] rounded-md border border-gray-300 bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ─── Content ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'grid' && (
            <GridView
              items={displayItems}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onDoubleClick={handleItemDoubleClick}
              onGoUp={currentPath.length > 0 ? navigateUp : undefined}
            />
          )}
          {viewMode === 'list' && (
            <ListView
              items={displayItems}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onDoubleClick={handleItemDoubleClick}
              onGoUp={currentPath.length > 0 ? navigateUp : undefined}
            />
          )}
          {viewMode === 'column' && (
            <ColumnView
              columnPaths={columnPaths}
              currentPath={currentPath}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onFolderClick={handleColumnFolderClick}
              onPreviewFolder={(path) => setColumnPreviewPath(path)}
              onClearPreview={() => setColumnPreviewPath(null)}
            />
          )}
        </div>

        {/* ─── Status Bar ───────────────────────────────────────────────── */}
        <div className="h-[22px] shrink-0 flex items-center px-3 text-[11px] text-gray-400 border-t border-gray-200 bg-gray-50/60">
          {displayItems.length} item{displayItems.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>
    </div>
  )
}

// ─── Grid View ───────────────────────────────────────────────────────────────

function GridView({
  items,
  selectedItem,
  onSelect,
  onDoubleClick,
  onGoUp,
}: {
  items: FSNode[]
  selectedItem: string | null
  onSelect: (name: string | null) => void
  onDoubleClick: (item: FSNode) => void
  onGoUp?: () => void
}) {
  return (
    <div className="p-4">
      {/* Go up item */}
      {onGoUp && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-1 mb-2">
          <button
            className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-gray-100 cursor-pointer transition-colors"
            onDoubleClick={onGoUp}
          >
            <span className="text-2xl">⬆️</span>
            <span className="text-[11px] text-gray-500 truncate w-full text-center">Back</span>
          </button>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-1">
        {items.map((item) => (
          <button
            key={item.name}
            className={`flex flex-col items-center gap-1 rounded-lg p-2 cursor-pointer transition-colors ${
              selectedItem === item.name
                ? 'bg-blue-500/15 ring-1 ring-blue-400/40'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelect(item.name === selectedItem ? null : item.name)}
            onDoubleClick={() => onDoubleClick(item)}
          >
            <span className="text-3xl leading-none">{item.emoji}</span>
            <span
              className={`text-[11px] leading-tight truncate w-full text-center ${
                item.type === 'folder' ? 'font-medium' : ''
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </div>
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Folder size={40} className="mb-2 opacity-40" />
          <span className="text-sm">This folder is empty</span>
        </div>
      )}
    </div>
  )
}

// ─── List View ───────────────────────────────────────────────────────────────

function ListView({
  items,
  selectedItem,
  onSelect,
  onDoubleClick,
  onGoUp,
}: {
  items: FSNode[]
  selectedItem: string | null
  onSelect: (name: string | null) => void
  onDoubleClick: (item: FSNode) => void
  onGoUp?: () => void
}) {
  return (
    <div className="py-1">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_100px] items-center px-4 py-1 text-[11px] font-medium text-gray-400 border-b border-gray-200 bg-gray-50/50 sticky top-0">
        <span>Name</span>
        <span>Kind</span>
        <span>Date Modified</span>
      </div>

      {/* Go up row */}
      {onGoUp && (
        <button
          className="w-full grid grid-cols-[1fr_100px_100px] items-center px-4 py-1 hover:bg-gray-100 transition-colors text-left"
          onDoubleClick={onGoUp}
        >
          <span className="flex items-center gap-2 text-gray-500">
            <span className="text-sm">⬆️</span>
            <span className="text-[12px]">..</span>
          </span>
          <span className="text-[12px] text-gray-400">Folder</span>
          <span className="text-[12px] text-gray-400">—</span>
        </button>
      )}

      {items.map((item) => (
        <button
          key={item.name}
          className={`w-full grid grid-cols-[1fr_100px_100px] items-center px-4 py-1 transition-colors text-left ${
            selectedItem === item.name
              ? 'bg-blue-500/15'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect(item.name === selectedItem ? null : item.name)}
          onDoubleClick={() => onDoubleClick(item)}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-sm shrink-0">{item.emoji}</span>
            <span
              className={`text-[12px] truncate ${
                item.type === 'folder' ? 'font-medium' : ''
              }`}
            >
              {item.name}
            </span>
          </span>
          <span className="text-[12px] text-gray-400">
            {item.type === 'folder' ? 'Folder' : item.name.split('.').pop()?.toUpperCase()}
          </span>
          <span className="text-[12px] text-gray-400">Today</span>
        </button>
      ))}

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Folder size={40} className="mb-2 opacity-40" />
          <span className="text-sm">This folder is empty</span>
        </div>
      )}
    </div>
  )
}

// ─── Column View ─────────────────────────────────────────────────────────────

function ColumnView({
  columnPaths,
  currentPath,
  selectedItem,
  onSelect,
  onFolderClick,
  onPreviewFolder,
  onClearPreview,
}: {
  columnPaths: string[][]
  currentPath: string[]
  selectedItem: string | null
  onSelect: (name: string | null) => void
  onFolderClick: (item: FSNode) => void
  onPreviewFolder: (path: string[]) => void
  onClearPreview: () => void
}) {
  return (
    <div className="flex h-full overflow-x-auto">
      {columnPaths.map((path, colIndex) => {
        const node = resolveNode(path)
        if (!node) return null
        const items = node.children
          ? [...node.children].sort((a, b) => {
              if (a.type === 'folder' && b.type !== 'folder') return -1
              if (a.type !== 'folder' && b.type === 'folder') return 1
              return a.name.localeCompare(b.name)
            })
          : []

        // Determine which item in this column is "active" (its sub-column is showing)
        const nextPath = columnPaths[colIndex + 1]
        const activeInCol = nextPath ? nextPath[nextPath.length - 1] : null

        return (
          <div
            key={path.join('/') || `root-${colIndex}`}
            className="shrink-0 w-[180px] border-r border-gray-200 overflow-y-auto"
          >
            {items.map((item) => {
              const isActive = item.name === activeInCol
              const isSelected = item.name === selectedItem
              return (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-1.5 px-2 py-[3px] text-[12px] text-left transition-colors ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-600'
                      : isSelected
                        ? 'bg-blue-500/15'
                        : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    onSelect(item.name === selectedItem ? null : item.name)
                    if (item.type === 'folder') {
                      onFolderClick(item)
                    }
                  }}
                  onMouseEnter={() => {
                    if (item.type === 'folder') {
                      onPreviewFolder([...path, item.name])
                    }
                  }}
                  onMouseLeave={onClearPreview}
                >
                  <span className="text-sm shrink-0">{item.emoji}</span>
                  <span className="truncate flex-1">{item.name}</span>
                  {item.type === 'folder' && (
                    <ChevronRight size={12} className="shrink-0 text-gray-400" />
                  )}
                </button>
              )
            })}
            {items.length === 0 && (
              <div className="px-2 py-8 text-center text-[11px] text-gray-400">
                Empty
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
