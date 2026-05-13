'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
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
  FileText,
  Image as ImageIcon,
  Music,
  Film,
  Code,
  FolderPlus,
  Info,
  Trash2,
  Copy,
  Archive,
  Pencil,
  Play,
  Pause,
  Volume2,
  Maximize2,
  X,
} from 'lucide-react'
import useMacOSStore from '@/store/macos-store'

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'list' | 'column'

interface FSNode {
  name: string
  type: 'folder' | 'file'
  children?: FSNode[]
  size?: string
  dateModified?: string
}

// ─── Helper: check file type ──────────────────────────────────────────────────

function isImageFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)
}

function isVideoFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ['mp4', 'mov', 'avi', 'mkv'].includes(ext)
}

function isTextFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ['txt', 'md', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'rs', 'go'].includes(ext)
}

function isPdfFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ext === 'pdf'
}

function getPicsumUrl(filename: string, width: number, height: number): string {
  const seed = filename.replace(/\.[^.]+$/, '')
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

// ─── Helper: get file icon based on extension ────────────────────────────────

function getFileIcon(item: FSNode): React.ReactNode {
  if (item.type === 'folder') {
    return <Folder size={item.type === 'folder' ? 32 : 14} className="text-blue-500 shrink-0" />
  }
  const ext = item.name.split('.').pop()?.toLowerCase() || ''
  const iconSize = 32

  // Image files: show thumbnail
  if (isImageFile(item.name)) {
    return (
      <div className="relative shrink-0" style={{ width: iconSize, height: iconSize }}>
        <img
          src={getPicsumUrl(item.name, 64, 64)}
          alt={item.name}
          className="w-full h-full object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            const parent = (e.target as HTMLImageElement).parentElement
            if (parent) {
              const fallback = document.createElement('div')
              fallback.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'
              parent.appendChild(fallback.firstElementChild!)
            }
          }}
        />
      </div>
    )
  }

  // Video files: show film strip with gradient
  if (isVideoFile(item.name)) {
    return (
      <div className="relative shrink-0" style={{ width: iconSize, height: iconSize }}>
        <div className="w-full h-full rounded bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
          <Film size={18} className="text-white/90" />
        </div>
      </div>
    )
  }

  switch (ext) {
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'm3u':
      return <Music size={iconSize} className="text-pink-500 shrink-0" />
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'html':
    case 'css':
    case 'py':
    case 'rs':
    case 'go':
      return <Code size={iconSize} className="text-orange-500 shrink-0" />
    case 'txt':
    case 'md':
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'xlsx':
      return <FileText size={iconSize} className="text-gray-500 shrink-0" />
    default:
      return <File size={iconSize} className="text-gray-400 shrink-0" />
  }
}

function getFileIconSmall(item: FSNode): React.ReactNode {
  if (item.type === 'folder') {
    return <Folder size={14} className="text-blue-500 shrink-0" />
  }
  const ext = item.name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <ImageIcon size={14} className="text-green-500 shrink-0" />
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'm3u':
      return <Music size={14} className="text-pink-500 shrink-0" />
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return <Film size={14} className="text-purple-500 shrink-0" />
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'html':
    case 'css':
    case 'py':
    case 'rs':
    case 'go':
      return <Code size={14} className="text-orange-500 shrink-0" />
    case 'txt':
    case 'md':
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'xlsx':
      return <FileText size={14} className="text-gray-500 shrink-0" />
    default:
      return <File size={14} className="text-gray-400 shrink-0" />
  }
}

function getKindLabel(item: FSNode): string {
  if (item.type === 'folder') return 'Folder'
  const ext = item.name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'png': return 'PNG Image'
    case 'jpg':
    case 'jpeg': return 'JPEG Image'
    case 'gif': return 'GIF Image'
    case 'svg': return 'SVG Image'
    case 'mp3': return 'MP3 Audio'
    case 'wav': return 'WAV Audio'
    case 'm3u': return 'Playlist'
    case 'mp4': return 'MP4 Video'
    case 'mov': return 'QuickTime Movie'
    case 'pdf': return 'PDF Document'
    case 'doc':
    case 'docx': return 'Word Document'
    case 'xlsx': return 'Excel Spreadsheet'
    case 'txt': return 'Plain Text'
    case 'md': return 'Markdown'
    case 'html': return 'HTML Document'
    case 'css': return 'CSS Stylesheet'
    case 'js': return 'JavaScript'
    case 'ts':
    case 'tsx': return 'TypeScript'
    case 'dmg': return 'Disk Image'
    case 'zip': return 'Archive'
    case 'app': return 'Application'
    default: return `${ext.toUpperCase()} File`
  }
}

// ─── Virtual File System ─────────────────────────────────────────────────────

function createInitialFS(): FSNode {
  return {
    name: 'Root',
    type: 'folder',
    children: [
      {
        name: 'Desktop',
        type: 'folder',
        children: [
          { name: 'Screenshot.png', type: 'file', size: '2.4 MB', dateModified: 'Today' },
          { name: 'Notes.txt', type: 'file', size: '4 KB', dateModified: 'Today' },
          {
            name: 'Project',
            type: 'folder',
            children: [
              { name: 'index.html', type: 'file', size: '12 KB', dateModified: 'Yesterday' },
              { name: 'style.css', type: 'file', size: '8 KB', dateModified: 'Yesterday' },
              { name: 'app.js', type: 'file', size: '24 KB', dateModified: 'Yesterday' },
            ],
          },
        ],
      },
      {
        name: 'Documents',
        type: 'folder',
        children: [
          { name: 'Resume.pdf', type: 'file', size: '156 KB', dateModified: 'Last Week' },
          { name: 'Budget.xlsx', type: 'file', size: '34 KB', dateModified: 'This Week' },
          { name: 'Letter.docx', type: 'file', size: '22 KB', dateModified: 'Yesterday' },
          {
            name: 'Archive',
            type: 'folder',
            children: [
              { name: 'old-report.pdf', type: 'file', size: '890 KB', dateModified: 'Last Month' },
              { name: 'backup.zip', type: 'file', size: '45 MB', dateModified: 'Last Month' },
            ],
          },
        ],
      },
      {
        name: 'Downloads',
        type: 'folder',
        children: [
          { name: 'installer.dmg', type: 'file', size: '128 MB', dateModified: 'Today' },
          { name: 'photo.jpg', type: 'file', size: '3.2 MB', dateModified: 'Today' },
          { name: 'song.mp3', type: 'file', size: '5.8 MB', dateModified: 'Yesterday' },
          { name: 'movie-trailer.mp4', type: 'file', size: '52 MB', dateModified: 'Last Week' },
        ],
      },
      {
        name: 'Applications',
        type: 'folder',
        children: [
          { name: 'Safari.app', type: 'file', size: '18 MB', dateModified: '—' },
          { name: 'Calculator.app', type: 'file', size: '4 MB', dateModified: '—' },
          { name: 'Notes.app', type: 'file', size: '12 MB', dateModified: '—' },
          { name: 'Terminal.app', type: 'file', size: '6 MB', dateModified: '—' },
          { name: 'Calendar.app', type: 'file', size: '15 MB', dateModified: '—' },
        ],
      },
      {
        name: 'Pictures',
        type: 'folder',
        children: [
          {
            name: 'Vacation',
            type: 'folder',
            children: [
              { name: 'beach.jpg', type: 'file', size: '4.1 MB', dateModified: 'Last Month' },
              { name: 'sunset.jpg', type: 'file', size: '3.8 MB', dateModified: 'Last Month' },
            ],
          },
          {
            name: 'Screenshots',
            type: 'folder',
            children: [
              { name: 'screen-1.png', type: 'file', size: '1.2 MB', dateModified: 'This Week' },
              { name: 'screen-2.png', type: 'file', size: '980 KB', dateModified: 'This Week' },
            ],
          },
          { name: 'wallpaper.jpg', type: 'file', size: '5.6 MB', dateModified: 'Last Week' },
        ],
      },
      {
        name: 'Music',
        type: 'folder',
        children: [
          {
            name: 'Playlists',
            type: 'folder',
            children: [
              { name: 'favorites.m3u', type: 'file', size: '2 KB', dateModified: 'Last Month' },
              { name: 'workout.m3u', type: 'file', size: '1 KB', dateModified: 'Last Month' },
            ],
          },
          { name: 'song.mp3', type: 'file', size: '5.2 MB', dateModified: 'Last Week' },
        ],
      },
    ],
  }
}

// ─── Sidebar items ───────────────────────────────────────────────────────────

interface SidebarItem {
  name: string
  icon: React.ReactNode
  path: string[]
}

const FAVORITES: SidebarItem[] = [
  { name: 'Desktop', icon: <Folder size={14} className="text-blue-500" />, path: ['Desktop'] },
  { name: 'Documents', icon: <FileText size={14} className="text-gray-500" />, path: ['Documents'] },
  { name: 'Downloads', icon: <HardDrive size={14} className="text-gray-500" />, path: ['Downloads'] },
  { name: 'Applications', icon: <Code size={14} className="text-orange-500" />, path: ['Applications'] },
  { name: 'Pictures', icon: <ImageIcon size={14} className="text-green-500" />, path: ['Pictures'] },
  { name: 'Music', icon: <Music size={14} className="text-pink-500" />, path: ['Music'] },
]

const LOCATIONS: SidebarItem[] = [
  { name: 'Macintosh HD', icon: <HardDrive size={14} className="text-gray-500" />, path: [] },
  { name: 'Network', icon: <Globe size={14} className="text-gray-500" />, path: [] },
]

// ─── Helper: resolve a path to its FSNode ────────────────────────────────────

function resolveNode(root: FSNode, path: string[]): FSNode | null {
  let node: FSNode = root
  for (const segment of path) {
    const child = node.children?.find((c) => c.name === segment)
    if (!child) return null
    node = child
  }
  return node
}

// ─── Simulated disk space ────────────────────────────────────────────────────

function getSimulatedDiskSpace(fs: FSNode): { used: string; available: string } {
  // Simulate disk info
  return {
    used: '186.4 GB',
    available: '313.6 GB',
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Finder() {
  const [fileSystem, setFileSystem] = useState<FSNode>(createInitialFS)
  const [currentPath, setCurrentPath] = useState<string[]>(['Desktop'])
  const [history, setHistory] = useState<string[][]>([['Desktop']])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [renamingItem, setRenamingItem] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [columnPreviewPath, setColumnPreviewPath] = useState<string[] | null>(null)
  const [showQuickLook, setShowQuickLook] = useState(false)

  const { setContextMenu } = useMacOSStore()

  // Space key for Quick Look
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && selectedItem && !renamingItem) {
        e.preventDefault()
        setShowQuickLook(true)
      }
      if (e.key === 'Escape') {
        setShowQuickLook(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedItem, renamingItem])

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
      setColumnPreviewPath(null)

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
  const currentNode = useMemo(() => resolveNode(fileSystem, currentPath), [fileSystem, currentPath])

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

  // Handle double-click on a folder or file
  const handleItemDoubleClick = useCallback(
    (item: FSNode) => {
      if (item.type === 'folder') {
        navigateTo([...currentPath, item.name])
      } else {
        // Open Quick Look for files
        setSelectedItem(item.name)
        setShowQuickLook(true)
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

  // ─── File operations ───────────────────────────────────────────────────

  const addNewFolder = useCallback(() => {
    const parentNode = resolveNode(fileSystem, currentPath)
    if (!parentNode || parentNode.type !== 'folder') return

    let folderName = 'untitled folder'
    let counter = 1
    while (parentNode.children?.some(c => c.name === folderName)) {
      folderName = `untitled folder ${counter}`
      counter++
    }

    const newFolder: FSNode = {
      name: folderName,
      type: 'folder',
      children: [],
    }

    setFileSystem(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as FSNode
      const targetNode = resolveNode(clone, currentPath)
      if (targetNode && targetNode.type === 'folder') {
        if (!targetNode.children) targetNode.children = []
        targetNode.children.push(newFolder)
      }
      return clone
    })
    setSelectedItem(folderName)
    setRenamingItem(folderName)
    setRenameValue(folderName)
  }, [fileSystem, currentPath])

  const renameItem = useCallback((oldName: string, newName: string) => {
    if (!newName.trim()) return
    setFileSystem(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as FSNode
      const targetNode = resolveNode(clone, currentPath)
      if (targetNode && targetNode.children) {
        const item = targetNode.children.find(c => c.name === oldName)
        if (item) {
          item.name = newName.trim()
        }
      }
      return clone
    })
    if (selectedItem === oldName) {
      setSelectedItem(newName.trim())
    }
  }, [currentPath, selectedItem])

  const deleteItem = useCallback((name: string) => {
    setFileSystem(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as FSNode
      const targetNode = resolveNode(clone, currentPath)
      if (targetNode && targetNode.children) {
        targetNode.children = targetNode.children.filter(c => c.name !== name)
      }
      return clone
    })
    if (selectedItem === name) {
      setSelectedItem(null)
    }
  }, [currentPath, selectedItem])

  const duplicateItem = useCallback((name: string) => {
    setFileSystem(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as FSNode
      const targetNode = resolveNode(clone, currentPath)
      if (targetNode && targetNode.children) {
        const item = targetNode.children.find(c => c.name === name)
        if (item) {
          const copy = JSON.parse(JSON.stringify(item)) as FSNode
          const ext = copy.name.includes('.') ? '.' + copy.name.split('.').pop() : ''
          const baseName = copy.name.includes('.') ? copy.name.slice(0, copy.name.lastIndexOf('.')) : copy.name
          let newName = `${baseName} copy${ext}`
          let counter = 1
          while (targetNode.children.some(c => c.name === newName)) {
            newName = `${baseName} copy ${counter}${ext}`
            counter++
          }
          copy.name = newName
          targetNode.children.push(copy)
          setSelectedItem(newName)
        }
      }
      return clone
    })
  }, [currentPath])

  const compressItem = useCallback((name: string) => {
    const ext = name.includes('.') ? '' : ''
    const archiveName = name.includes('.') 
      ? `${name.slice(0, name.lastIndexOf('.'))}.zip`
      : `${name}.zip`
    
    setFileSystem(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as FSNode
      const targetNode = resolveNode(clone, currentPath)
      if (targetNode && targetNode.children) {
        // Check if archive already exists
        if (!targetNode.children.some(c => c.name === archiveName)) {
          targetNode.children.push({
            name: archiveName,
            type: 'file',
            size: '—',
            dateModified: 'Today',
          })
        }
      }
      return clone
    })
  }, [currentPath])

  // ─── Context menu ──────────────────────────────────────────────────────

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: FSNode) => {
      e.preventDefault()
      e.stopPropagation()
      setSelectedItem(item.name)

      const items: { label: string; action?: () => void; separator?: boolean; shortcut?: string; disabled?: boolean }[] = [
        {
          label: 'Open',
          action: () => {
            if (item.type === 'folder') {
              navigateTo([...currentPath, item.name])
            }
          },
          shortcut: '⌘O',
        },
        {
          label: 'Quick Look',
          action: () => {
            setSelectedItem(item.name)
            setShowQuickLook(true)
          },
          shortcut: '␣',
        },
        { separator: true },
        {
          label: 'Get Info',
          action: () => {
            setSelectedItem(item.name)
            setShowInfoPanel(true)
          },
          shortcut: '⌘I',
        },
        {
          label: 'Rename...',
          action: () => {
            setRenamingItem(item.name)
            setRenameValue(item.name)
          },
        },
        { separator: true },
        {
          label: 'Duplicate',
          action: () => duplicateItem(item.name),
          shortcut: '⌘D',
        },
        {
          label: 'Compress',
          action: () => compressItem(item.name),
          shortcut: '⌘⇧Z',
        },
        { separator: true },
        {
          label: 'Move to Trash',
          action: () => deleteItem(item.name),
          shortcut: '⌘⌫',
        },
      ]

      setContextMenu({ x: e.clientX, y: e.clientY, items })
    },
    [currentPath, navigateTo, setContextMenu, duplicateItem, compressItem, deleteItem]
  )

  const handleBackgroundContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setSelectedItem(null)

      const items: { label: string; action?: () => void; separator?: boolean; shortcut?: string }[] = [
        {
          label: 'New Folder',
          action: () => addNewFolder(),
          shortcut: '⇧⌘N',
        },
        { separator: true },
        {
          label: 'Get Info',
          action: () => setShowInfoPanel(true),
          shortcut: '⌘I',
        },
        { separator: true },
        {
          label: 'Sort by Name',
          action: () => {},
        },
        {
          label: 'Sort by Kind',
          action: () => {},
        },
        {
          label: 'Sort by Date',
          action: () => {},
        },
      ]

      setContextMenu({ x: e.clientX, y: e.clientY, items })
    },
    [addNewFolder, setContextMenu]
  )

  // ─── Rename handling ──────────────────────────────────────────────────

  const finishRenaming = useCallback(() => {
    if (renamingItem && renameValue.trim() && renameValue.trim() !== renamingItem) {
      renameItem(renamingItem, renameValue.trim())
    }
    setRenamingItem(null)
    setRenameValue('')
  }, [renamingItem, renameValue, renameItem])

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        finishRenaming()
      } else if (e.key === 'Escape') {
        setRenamingItem(null)
        setRenameValue('')
      }
    },
    [finishRenaming]
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

  // Selected item details for info panel
  const selectedNode = useMemo(() => {
    if (!selectedItem || !currentNode?.children) return null
    return currentNode.children.find(c => c.name === selectedItem) || null
  }, [selectedItem, currentNode])

  // Disk info
  const diskInfo = useMemo(() => getSimulatedDiskSpace(fileSystem), [fileSystem])

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
                {item.icon}
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
                {item.icon}
                <span className="truncate">{item.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tags section */}
        <div className="pt-4 pb-1 px-3">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Tags
          </h3>
        </div>
        <div className="px-2">
          {[
            { name: 'Red', color: 'bg-red-500' },
            { name: 'Blue', color: 'bg-blue-500' },
            { name: 'Green', color: 'bg-green-500' },
            { name: 'Yellow', color: 'bg-yellow-500' },
          ].map((tag) => (
            <button
              key={tag.name}
              className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] hover:bg-gray-200/60 text-gray-700 transition-colors duration-100"
            >
              <span className={`w-3 h-3 rounded-full ${tag.color}`} />
              <span className="truncate">{tag.name}</span>
            </button>
          ))}
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

          {/* New Folder button */}
          <button
            className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
            onClick={addNewFolder}
            title="New Folder"
          >
            <FolderPlus size={15} />
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Search bar */}
          <div className="relative shrink-0 ml-auto">
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
        <div className="flex-1 overflow-auto" onContextMenu={handleBackgroundContextMenu}>
          {viewMode === 'grid' && (
            <GridView
              items={displayItems}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onDoubleClick={handleItemDoubleClick}
              onGoUp={currentPath.length > 0 ? navigateUp : undefined}
              onContextMenu={handleContextMenu}
              renamingItem={renamingItem}
              renameValue={renameValue}
              onRenameChange={setRenameValue}
              onRenameKeyDown={handleRenameKeyDown}
              onFinishRenaming={finishRenaming}
            />
          )}
          {viewMode === 'list' && (
            <ListView
              items={displayItems}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onDoubleClick={handleItemDoubleClick}
              onGoUp={currentPath.length > 0 ? navigateUp : undefined}
              onContextMenu={handleContextMenu}
              renamingItem={renamingItem}
              renameValue={renameValue}
              onRenameChange={setRenameValue}
              onRenameKeyDown={handleRenameKeyDown}
              onFinishRenaming={finishRenaming}
            />
          )}
          {viewMode === 'column' && (
            <ColumnView
              fileSystem={fileSystem}
              columnPaths={columnPaths}
              currentPath={currentPath}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onFolderClick={handleColumnFolderClick}
              onPreviewFolder={(path) => setColumnPreviewPath(path)}
              onClearPreview={() => setColumnPreviewPath(null)}
              onContextMenu={handleContextMenu}
            />
          )}
        </div>

        {/* ─── Path Bar ───────────────────────────────────────────────── */}
        <div className="h-[24px] shrink-0 flex items-center px-3 text-[11px] border-t border-gray-200 bg-gray-50/60 gap-0.5 overflow-hidden">
          <HardDrive size={11} className="text-gray-400 shrink-0" />
          <button
            className="text-gray-500 hover:text-gray-800 transition-colors shrink-0 hover:underline"
            onClick={() => navigateTo([])}
          >
            Macintosh HD
          </button>
          {currentPath.map((segment, i) => (
            <React.Fragment key={i}>
              <ChevronRight size={10} className="shrink-0 text-gray-400" />
              <button
                className="text-gray-500 hover:text-gray-800 transition-colors truncate hover:underline"
                onClick={() => navigateTo(currentPath.slice(0, i + 1))}
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* ─── Status Bar ───────────────────────────────────────────────── */}
        <div className="h-[22px] shrink-0 flex items-center justify-between px-3 text-[11px] text-gray-400 border-t border-gray-200 bg-gray-50/60">
          <span>
            {displayItems.length} item{displayItems.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedItem && ` — "${selectedItem}" selected`}
          </span>
          <span>
            {diskInfo.available} available
          </span>
        </div>
      </div>

      {/* ─── Quick Look Preview ──────────────────────────────────────── */}
      {showQuickLook && selectedNode && (
        <QuickLookOverlay
          node={selectedNode}
          currentPath={currentPath}
          onClose={() => setShowQuickLook(false)}
        />
      )}

      {/* ─── Info Panel ──────────────────────────────────────────────────── */}
      {showInfoPanel && selectedNode && (
        <div className="w-[260px] shrink-0 border-l border-gray-200 bg-gray-50/80 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-600">Info</span>
            <button
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInfoPanel(false)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-4 flex flex-col items-center gap-2">
            <div className="mb-2">
              {getFileIcon(selectedNode)}
            </div>
            {renamingItem === selectedNode.name ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={finishRenaming}
                className="w-full text-center text-xs border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                autoFocus
              />
            ) : (
              <button
                className="text-xs font-medium text-gray-800 text-center hover:underline"
                onClick={() => {
                  setRenamingItem(selectedNode.name)
                  setRenameValue(selectedNode.name)
                }}
              >
                {selectedNode.name}
              </button>
            )}
          </div>
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="flex flex-col gap-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Kind:</span>
                <span className="text-gray-700">{getKindLabel(selectedNode)}</span>
              </div>
              {selectedNode.size && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-gray-700">{selectedNode.size}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-gray-700 truncate ml-2">{currentPath.length > 0 ? currentPath.join(' > ') : 'Macintosh HD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-700">{selectedNode.dateModified || 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modified:</span>
                <span className="text-gray-700">{selectedNode.dateModified || 'Today'}</span>
              </div>
              {selectedNode.type === 'folder' && selectedNode.children && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Contains:</span>
                  <span className="text-gray-700">{selectedNode.children.length} item{selectedNode.children.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
          {/* Tags Section */}
          <div className="px-4 py-2 border-t border-gray-200">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Tags</span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-30" />
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 opacity-30" />
              <button className="w-2.5 h-2.5 rounded-full border border-dashed border-gray-300 hover:border-gray-400 transition-colors" />
            </div>
          </div>
          {/* Sharing & Permissions */}
          <div className="px-4 py-2 border-t border-gray-200">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Sharing & Permissions</span>
            <div className="flex flex-col gap-1.5 mt-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">user</span>
                <span className="text-gray-700">Read & Write</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">staff</span>
                <span className="text-gray-700">Read only</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">everyone</span>
                <span className="text-gray-700">Read only</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Video Player Component ──────────────────────────────────────────────────

function VideoPlayer({ filename }: { filename: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('0:00')
  const totalTime = '3:24'

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false)
          return 0
        }
        const next = prev + 0.05
        // Calculate time: 3:24 = 204 seconds
        const totalSeconds = 204
        const currentSeconds = Math.floor((next / 100) * totalSeconds)
        const mins = Math.floor(currentSeconds / 60)
        const secs = currentSeconds % 60
        setCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`)
        return next
      })
    }, 50)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {/* Video frame placeholder - gradient image */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 40% at 50% 60%, rgba(100, 80, 200, 0.6) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 30% at 30% 40%, rgba(200, 100, 50, 0.4) 0%, transparent 50%)',
            'radial-gradient(ellipse 50% 25% at 70% 35%, rgba(50, 100, 200, 0.4) 0%, transparent 50%)',
            'linear-gradient(135deg, #1a0a3a 0%, #2d1568 20%, #4a1a8a 40%, #7a2aae 55%, #cc5a3a 70%, #e8783a 85%, #4a6ae8 100%)',
          ].join(', '),
          opacity: 0.6,
        }}
      />

      {/* Play button overlay (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(true)}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play size={32} className="text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      {/* Pause overlay (when playing, shows on hover) */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsPlaying(false)}
            className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <Pause size={24} className="text-white" fill="white" />
          </button>
        </div>
      )}

      {/* Video title */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-sm font-medium truncate">{filename}</p>
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const newProgress = (x / rect.width) * 100
            setProgress(newProgress)
          }}
        >
          <div
            className="h-full bg-white rounded-full relative transition-all duration-100"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-white/80 transition-colors">
            {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
          </button>
          <span className="text-white/70 text-[11px] font-mono">
            {currentTime} / {totalTime}
          </span>
          <div className="flex-1" />
          <button className="text-white/70 hover:text-white transition-colors">
            <Volume2 size={14} />
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Quick Look Overlay ──────────────────────────────────────────────────────

function QuickLookOverlay({
  node,
  currentPath,
  onClose,
}: {
  node: FSNode
  currentPath: string[]
  onClose: () => void
}) {
  // Image preview
  if (node.type === 'file' && isImageFile(node.name)) {
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className="relative bg-[#1c1c1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          style={{ maxWidth: '85vw', maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={14} />
          </button>

          {/* Image preview */}
          <div className="flex items-center justify-center p-2" style={{ minWidth: 400, minHeight: 300, maxWidth: '80vw', maxHeight: '78vh' }}>
            <img
              src={getPicsumUrl(node.name, 800, 600)}
              alt={node.name}
              className="max-w-full max-h-[78vh] object-contain rounded"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* File info bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1c1c1e] border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-white/90 text-[13px] font-medium">{node.name}</span>
              <span className="text-white/40 text-[11px]">{getKindLabel(node)}</span>
              {node.size && <span className="text-white/40 text-[11px]">{node.size}</span>}
            </div>
            <span className="text-white/30 text-[10px]">Press Space or Escape to close</span>
          </div>
        </div>
      </div>
    )
  }

  // Video preview
  if (node.type === 'file' && isVideoFile(node.name)) {
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className="relative bg-[#1c1c1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          style={{ width: 640, maxWidth: '85vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={14} />
          </button>

          {/* Video player */}
          <div className="aspect-video">
            <VideoPlayer filename={node.name} />
          </div>

          {/* File info bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1c1c1e] border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-white/90 text-[13px] font-medium">{node.name}</span>
              <span className="text-white/40 text-[11px]">{getKindLabel(node)}</span>
              {node.size && <span className="text-white/40 text-[11px]">{node.size}</span>}
            </div>
            <span className="text-white/30 text-[10px]">Press Space or Escape to close</span>
          </div>
        </div>
      </div>
    )
  }

  // Text file preview
  if (node.type === 'file' && isTextFile(node.name)) {
    const ext = node.name.split('.').pop()?.toLowerCase() || ''
    const textContent = getFileTextContent(node.name)
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-xl shadow-2xl border border-gray-200/80 overflow-hidden"
          style={{ width: 500, maxWidth: '85vw', maxHeight: '80vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            <X size={14} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
            <Code size={16} className="text-orange-500" />
            <span className="text-[13px] font-medium text-gray-800">{node.name}</span>
            <span className="text-[11px] text-gray-400">{ext.toUpperCase()}</span>
          </div>

          {/* Text content */}
          <div className="p-4 overflow-auto" style={{ maxHeight: '60vh' }}>
            <pre className="text-[12px] text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
              {textContent}
            </pre>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50/50">
            <span className="text-[11px] text-gray-400">{getKindLabel(node)}{node.size ? ` — ${node.size}` : ''}</span>
            <span className="text-[10px] text-gray-400">Press Space or Escape to close</span>
          </div>
        </div>
      </div>
    )
  }

  // PDF preview
  if (node.type === 'file' && isPdfFile(node.name)) {
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-xl shadow-2xl border border-gray-200/80 overflow-hidden"
          style={{ width: 420, maxWidth: '85vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            <X size={14} />
          </button>

          {/* PDF icon */}
          <div className="flex flex-col items-center py-10">
            <div className="w-24 h-32 bg-red-100 rounded-lg flex flex-col items-center justify-center border-2 border-red-200 mb-4">
              <FileText size={36} className="text-red-500 mb-1" />
              <span className="text-[10px] font-bold text-red-600">PDF</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{node.name}</h3>
            <p className="text-[11px] text-gray-500 mt-1">PDF Document</p>
          </div>

          {/* File info */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Kind:</span>
              <span className="text-gray-700">PDF Document</span>
            </div>
            {node.size && (
              <div className="flex justify-between text-[11px] mt-1">
                <span className="text-gray-400">Size:</span>
                <span className="text-gray-700">{node.size}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] mt-1">
              <span className="text-gray-400">Modified:</span>
              <span className="text-gray-700">{node.dateModified || 'Today'}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-2 border-t border-gray-200">
            <span className="text-[10px] text-gray-400">Press Space or Escape to close</span>
          </div>
        </div>
      </div>
    )
  }

  // Default: folder or unknown file type - show info view
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/80 min-w-[320px] max-w-[400px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onClose}
        >
          <X size={14} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="transform scale-150">
            {getFileIcon(node)}
          </div>
        </div>

        {/* Name */}
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{node.name}</h3>
        </div>

        {/* Details */}
        <div className="space-y-2 text-[11px] border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Kind:</span>
            <span className="text-gray-700">{getKindLabel(node)}</span>
          </div>
          {node.size && (
            <div className="flex justify-between">
              <span className="text-gray-400">Size:</span>
              <span className="text-gray-700">{node.size}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Modified:</span>
            <span className="text-gray-700">{node.dateModified || 'Today'}</span>
          </div>
          {node.type === 'folder' && node.children && (
            <div className="flex justify-between">
              <span className="text-gray-400">Contains:</span>
              <span className="text-gray-700">{node.children.length} item{node.children.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Location:</span>
            <span className="text-gray-700">{currentPath.length > 0 ? currentPath.join(' > ') : 'Macintosh HD'}</span>
          </div>
        </div>

        {/* Press Space to close hint */}
        <div className="mt-4 text-center">
          <span className="text-[10px] text-gray-400">Press Space or Escape to close</span>
        </div>
      </div>
    </div>
  )
}

// ─── Mock text content for text files ────────────────────────────────────────

function getFileTextContent(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const name = filename.replace(/\.[^.]+$/, '')

  switch (ext) {
    case 'js':
    case 'jsx':
      return `// ${filename}\nimport React from 'react'\n\nexport default function ${name.charAt(0).toUpperCase() + name.slice(1)}() {\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n      <p>Welcome to my application.</p>\n    </div>\n  )\n}\n`
    case 'ts':
    case 'tsx':
      return `// ${filename}\nimport React from 'react'\n\ninterface Props {\n  title: string\n  count?: number\n}\n\nexport default function ${name.charAt(0).toUpperCase() + name.slice(1)}({ title, count = 0 }: Props) {\n  return (\n    <div>\n      <h1>{title}</h1>\n      <p>Count: {count}</p>\n    </div>\n  )\n}\n`
    case 'html':
      return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${name}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app">\n    <h1>Welcome</h1>\n    <p>This is a sample HTML file.</p>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>\n`
    case 'css':
      return `/* ${filename} */\n\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  line-height: 1.6;\n  color: #333;\n}\n\n.app {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n`
    case 'py':
      return `# ${filename}\n\ndef main():\n    """Main entry point."""\n    print("Hello, World!")\n    data = [1, 2, 3, 4, 5]\n    result = sum(data)\n    print(f"Sum: {result}")\n\n\nclass DataProcessor:\n    def __init__(self, source):\n        self.source = source\n        self.data = []\n\n    def process(self):\n        for item in self.source:\n            self.data.append(item.strip())\n        return self.data\n\n\nif __name__ == "__main__":\n    main()\n`
    case 'rs':
      return `// ${filename}\n\nfn main() {\n    println!("Hello, World!");\n    let data = vec![1, 2, 3, 4, 5];\n    let sum: i32 = data.iter().sum();\n    println!("Sum: {}", sum);\n}\n`
    case 'go':
      return `// ${filename}\npackage main\n\nimport (\n\t"fmt"\n)\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n\tdata := []int{1, 2, 3, 4, 5}\n\tsum := 0\n\tfor _, v := range data {\n\t\tsum += v\n\t}\n\tfmt.Printf("Sum: %d\\n", sum)\n}\n`
    case 'md':
      return `# ${name}\n\nThis is a sample Markdown document.\n\n## Overview\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n## Features\n\n- Feature one\n- Feature two\n- Feature three\n\n## Getting Started\n\n1. Install dependencies\n2. Configure settings\n3. Run the application\n\n> This is a blockquote example.\n`
    case 'txt':
    default:
      return `This is the content of ${filename}.\n\nIt is a text file containing sample data for preview purposes.\n\n---\nCreated: Today\nModified: Today\nSize: ${Math.floor(Math.random() * 20 + 1)} KB\n`
  }
}

// ─── Grid View ───────────────────────────────────────────────────────────────

function GridView({
  items,
  selectedItem,
  onSelect,
  onDoubleClick,
  onGoUp,
  onContextMenu,
  renamingItem,
  renameValue,
  onRenameChange,
  onRenameKeyDown,
  onFinishRenaming,
}: {
  items: FSNode[]
  selectedItem: string | null
  onSelect: (name: string | null) => void
  onDoubleClick: (item: FSNode) => void
  onGoUp?: () => void
  onContextMenu: (e: React.MouseEvent, item: FSNode) => void
  renamingItem: string | null
  renameValue: string
  onRenameChange: (val: string) => void
  onRenameKeyDown: (e: React.KeyboardEvent) => void
  onFinishRenaming: () => void
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
            <ChevronLeft size={28} className="text-gray-400" />
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
            onContextMenu={(e) => onContextMenu(e, item)}
          >
            {getFileIcon(item)}
            {renamingItem === item.name ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onKeyDown={onRenameKeyDown}
                onBlur={onFinishRenaming}
                className="w-full text-center text-[11px] border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400/30 bg-white"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={`text-[11px] leading-tight truncate w-full text-center ${
                  item.type === 'folder' ? 'font-medium' : ''
                }`}
              >
                {item.name}
              </span>
            )}
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
  onContextMenu,
  renamingItem,
  renameValue,
  onRenameChange,
  onRenameKeyDown,
  onFinishRenaming,
}: {
  items: FSNode[]
  selectedItem: string | null
  onSelect: (name: string | null) => void
  onDoubleClick: (item: FSNode) => void
  onGoUp?: () => void
  onContextMenu: (e: React.MouseEvent, item: FSNode) => void
  renamingItem: string | null
  renameValue: string
  onRenameChange: (val: string) => void
  onRenameKeyDown: (e: React.KeyboardEvent) => void
  onFinishRenaming: () => void
}) {
  return (
    <div className="py-1">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_120px_120px_80px] items-center px-4 py-1 text-[11px] font-medium text-gray-400 border-b border-gray-200 bg-gray-50/50 sticky top-0">
        <span>Name</span>
        <span>Kind</span>
        <span>Date Modified</span>
        <span>Size</span>
      </div>

      {/* Go up row */}
      {onGoUp && (
        <button
          className="w-full grid grid-cols-[1fr_120px_120px_80px] items-center px-4 py-1 hover:bg-gray-100 transition-colors text-left"
          onDoubleClick={onGoUp}
        >
          <span className="flex items-center gap-2 text-gray-500">
            <ChevronLeft size={14} className="text-gray-400 shrink-0" />
            <span className="text-[12px]">..</span>
          </span>
          <span className="text-[12px] text-gray-400">Folder</span>
          <span className="text-[12px] text-gray-400">—</span>
          <span className="text-[12px] text-gray-400">—</span>
        </button>
      )}

      {items.map((item) => (
        <button
          key={item.name}
          className={`w-full grid grid-cols-[1fr_120px_120px_80px] items-center px-4 py-1 transition-colors text-left ${
            selectedItem === item.name
              ? 'bg-blue-500/15'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect(item.name === selectedItem ? null : item.name)}
          onDoubleClick={() => onDoubleClick(item)}
          onContextMenu={(e) => onContextMenu(e, item)}
        >
          <span className="flex items-center gap-2 min-w-0">
            {getFileIconSmall(item)}
            {renamingItem === item.name ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onKeyDown={onRenameKeyDown}
                onBlur={onFinishRenaming}
                className="flex-1 min-w-0 text-[12px] border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400/30 bg-white"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={`text-[12px] truncate ${
                  item.type === 'folder' ? 'font-medium' : ''
                }`}
              >
                {item.name}
              </span>
            )}
          </span>
          <span className="text-[12px] text-gray-400">
            {getKindLabel(item)}
          </span>
          <span className="text-[12px] text-gray-400">{item.dateModified || 'Today'}</span>
          <span className="text-[12px] text-gray-400">{item.size || (item.type === 'folder' ? '—' : '—')}</span>
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
  fileSystem,
  columnPaths,
  currentPath,
  selectedItem,
  onSelect,
  onFolderClick,
  onPreviewFolder,
  onClearPreview,
  onContextMenu,
}: {
  fileSystem: FSNode
  columnPaths: string[][]
  currentPath: string[]
  selectedItem: string | null
  onSelect: (name: string | null) => void
  onFolderClick: (item: FSNode) => void
  onPreviewFolder: (path: string[]) => void
  onClearPreview: () => void
  onContextMenu: (e: React.MouseEvent, item: FSNode) => void
}) {
  return (
    <div className="flex h-full overflow-x-auto">
      {columnPaths.map((path, colIndex) => {
        const node = resolveNode(fileSystem, path)
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
                  onContextMenu={(e) => onContextMenu(e, item)}
                >
                  {getFileIconSmall(item)}
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
