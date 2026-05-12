'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  ImageIcon,
  Clock,
  Star,
  Grid3X3,
  FolderOpen,
  Mountain,
  Building2,
  Camera,
  Monitor,
  Palette,
  Info,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────────────────

type PhotoTab = 'library' | 'foryou' | 'albums' | 'search';
type SidebarSection = 'all' | 'favorites' | 'recents' | 'nature' | 'screenshots' | 'wallpapers';

interface Photo {
  id: number;
  gradient: string;
  title: string;
  album: string;
  date: string;
  dateRaw: string;
  favorited: boolean;
  size: string;
  dimensions: string;
  description: string;
}

// ─── Photo data with better gradients that look more like actual photos ──────

const PHOTOS: Photo[] = [
  // Nature album - landscape-like gradients
  { id: 1, gradient: 'from-orange-400 via-rose-300 to-purple-400', title: 'Sunset Glow', album: 'Nature', date: 'Today', dateRaw: '2025-03-04', favorited: true, size: '4.2 MB', dimensions: '4032 × 3024', description: 'A beautiful sunset over the mountains' },
  { id: 2, gradient: 'from-sky-500 via-cyan-300 to-teal-200', title: 'Ocean Breeze', album: 'Nature', date: 'Today', dateRaw: '2025-03-04', favorited: false, size: '3.8 MB', dimensions: '4032 × 3024', description: 'Waves crashing on the shore' },
  { id: 3, gradient: 'from-green-800 via-emerald-500 to-lime-300', title: 'Forest Path', album: 'Nature', date: 'Yesterday', dateRaw: '2025-03-03', favorited: true, size: '5.1 MB', dimensions: '4032 × 3024', description: 'Sunlight filtering through the trees' },
  { id: 4, gradient: 'from-amber-300 via-yellow-200 to-rose-200', title: 'Golden Hour', album: 'Nature', date: 'This Week', dateRaw: '2025-03-01', favorited: true, size: '3.5 MB', dimensions: '3024 × 4032', description: 'Golden light across the meadow' },
  { id: 5, gradient: 'from-pink-300 via-rose-200 to-pink-100', title: 'Cherry Blossom', album: 'Nature', date: 'This Week', dateRaw: '2025-03-01', favorited: false, size: '4.0 MB', dimensions: '4032 × 3024', description: 'Spring cherry blossoms in full bloom' },
  { id: 6, gradient: 'from-indigo-500 via-violet-400 to-purple-300', title: 'Twilight Sky', album: 'Nature', date: 'Last Week', dateRaw: '2025-02-25', favorited: true, size: '2.9 MB', dimensions: '4032 × 3024', description: 'Stars beginning to appear at dusk' },
  { id: 7, gradient: 'from-lime-500 via-green-400 to-emerald-300', title: 'Meadow', album: 'Nature', date: 'Last Month', dateRaw: '2025-02-10', favorited: false, size: '4.6 MB', dimensions: '4032 × 3024', description: 'Wildflowers in the open meadow' },
  { id: 8, gradient: 'from-orange-500 via-red-400 to-amber-300', title: 'Autumn Walk', album: 'Nature', date: 'Last Month', dateRaw: '2025-02-05', favorited: true, size: '3.7 MB', dimensions: '3024 × 4032', description: 'Fall colors along the trail' },
  { id: 9, gradient: 'from-teal-400 via-cyan-300 to-sky-200', title: 'Tropical Beach', album: 'Nature', date: 'Last Month', dateRaw: '2025-01-28', favorited: false, size: '5.3 MB', dimensions: '4032 × 3024', description: 'Palm trees on white sand beach' },
  { id: 10, gradient: 'from-yellow-400 via-amber-300 to-orange-200', title: 'Desert Sand', album: 'Nature', date: 'Earlier', dateRaw: '2025-01-15', favorited: false, size: '4.1 MB', dimensions: '4032 × 3024', description: 'Sand dunes at golden hour' },

  // Screenshots album - more tech/dark themed gradients
  { id: 11, gradient: 'from-gray-900 via-gray-700 to-gray-500', title: 'Code Editor', album: 'Screenshots', date: 'Today', dateRaw: '2025-03-04', favorited: false, size: '890 KB', dimensions: '2560 × 1440', description: 'VS Code with dark theme' },
  { id: 12, gradient: 'from-slate-800 via-blue-900 to-slate-700', title: 'Desktop Screen', album: 'Screenshots', date: 'Yesterday', dateRaw: '2025-03-03', favorited: false, size: '1.2 MB', dimensions: '2560 × 1440', description: 'Clean desktop screenshot' },
  { id: 13, gradient: 'from-zinc-800 via-neutral-600 to-stone-500', title: 'Terminal Output', album: 'Screenshots', date: 'This Week', dateRaw: '2025-03-02', favorited: true, size: '456 KB', dimensions: '1200 × 800', description: 'Build logs from terminal' },
  { id: 14, gradient: 'from-gray-700 via-slate-600 to-gray-400', title: 'Settings Panel', album: 'Screenshots', date: 'Last Week', dateRaw: '2025-02-26', favorited: false, size: '678 KB', dimensions: '1920 × 1080', description: 'System preferences screenshot' },
  { id: 15, gradient: 'from-neutral-800 via-gray-600 to-zinc-500', title: 'Browser Tabs', album: 'Screenshots', date: 'Last Month', dateRaw: '2025-02-15', favorited: false, size: '1.5 MB', dimensions: '2560 × 1440', description: 'Too many browser tabs open' },

  // Wallpapers album - more abstract/artistic gradients
  { id: 16, gradient: 'from-blue-600 via-indigo-500 to-purple-600', title: 'Cosmic Flow', album: 'Wallpapers', date: 'This Week', dateRaw: '2025-03-02', favorited: true, size: '2.8 MB', dimensions: '3840 × 2160', description: 'Abstract cosmic wallpaper' },
  { id: 17, gradient: 'from-rose-500 via-pink-400 to-fuchsia-500', title: 'Pink Haze', album: 'Wallpapers', date: 'This Week', dateRaw: '2025-03-01', favorited: false, size: '2.4 MB', dimensions: '3840 × 2160', description: 'Soft pink gradient wallpaper' },
  { id: 18, gradient: 'from-emerald-600 via-teal-500 to-cyan-500', title: 'Deep Ocean', album: 'Wallpapers', date: 'Last Week', dateRaw: '2025-02-27', favorited: true, size: '3.1 MB', dimensions: '3840 × 2160', description: 'Deep ocean gradient wallpaper' },
  { id: 19, gradient: 'from-amber-500 via-orange-400 to-red-500', title: 'Fire Gradient', album: 'Wallpapers', date: 'Last Month', dateRaw: '2025-02-10', favorited: false, size: '2.2 MB', dimensions: '3840 × 2160', description: 'Warm fire gradient wallpaper' },
  { id: 20, gradient: 'from-violet-600 via-purple-500 to-indigo-600', title: 'Nebula', album: 'Wallpapers', date: 'Last Month', dateRaw: '2025-02-05', favorited: true, size: '3.4 MB', dimensions: '3840 × 2160', description: 'Nebula inspired wallpaper' },
  { id: 21, gradient: 'from-stone-400 via-zinc-300 to-neutral-200', title: 'Minimal Light', album: 'Wallpapers', date: 'Earlier', dateRaw: '2025-01-20', favorited: false, size: '1.8 MB', dimensions: '3840 × 2160', description: 'Clean minimal light wallpaper' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function Photos() {
  const [activeTab, setActiveTab] = useState<PhotoTab>('library');
  const [activeSection, setActiveSection] = useState<SidebarSection>('all');
  const [photos, setPhotos] = useState<Photo[]>(PHOTOS);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1=small, 2=medium, 3=large
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const toggleFavorite = useCallback((id: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorited: !p.favorited } : p))
    );
  }, []);

  const getFilteredPhotos = useCallback((): Photo[] => {
    let filtered = photos;

    if (activeSection === 'favorites') {
      filtered = filtered.filter((p) => p.favorited);
    } else if (activeSection === 'recents') {
      filtered = filtered.filter((p) => p.date === 'Today' || p.date === 'Yesterday');
    } else if (activeSection === 'nature') {
      filtered = filtered.filter((p) => p.album === 'Nature');
    } else if (activeSection === 'screenshots') {
      filtered = filtered.filter((p) => p.album === 'Screenshots');
    } else if (activeSection === 'wallpapers') {
      filtered = filtered.filter((p) => p.album === 'Wallpapers');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.album.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [photos, activeSection, searchQuery]);

  const filteredPhotos = getFilteredPhotos();
  const selectedPhoto = selectedPhotoId !== null ? photos.find((p) => p.id === selectedPhotoId) : null;

  const goToPrevPhoto = useCallback(() => {
    if (selectedPhotoId === null) return;
    const idx = filteredPhotos.findIndex((p) => p.id === selectedPhotoId);
    if (idx > 0) setSelectedPhotoId(filteredPhotos[idx - 1].id);
  }, [selectedPhotoId, filteredPhotos]);

  const goToNextPhoto = useCallback(() => {
    if (selectedPhotoId === null) return;
    const idx = filteredPhotos.findIndex((p) => p.id === selectedPhotoId);
    if (idx < filteredPhotos.length - 1) setSelectedPhotoId(filteredPhotos[idx + 1].id);
  }, [selectedPhotoId, filteredPhotos]);

  // Zoom config
  const zoomConfig = useMemo(() => {
    switch (zoomLevel) {
      case 1: return { cols: 6, label: 'Small' };
      case 2: return { cols: 4, label: 'Medium' };
      case 3: return { cols: 3, label: 'Large' };
      default: return { cols: 4, label: 'Medium' };
    }
  }, [zoomLevel]);

  const sidebarItems = [
    { section: 'Library', items: [
      { id: 'all' as SidebarSection, label: 'All Photos', icon: ImageIcon, count: photos.length },
      { id: 'favorites' as SidebarSection, label: 'Favorites', icon: Heart, count: photos.filter(p => p.favorited).length },
      { id: 'recents' as SidebarSection, label: 'Recents', icon: Clock, count: photos.filter(p => p.date === 'Today' || p.date === 'Yesterday').length },
    ]},
    { section: 'Albums', items: [
      { id: 'nature' as SidebarSection, label: 'Nature', icon: Mountain, count: photos.filter(p => p.album === 'Nature').length },
      { id: 'screenshots' as SidebarSection, label: 'Screenshots', icon: Monitor, count: photos.filter(p => p.album === 'Screenshots').length },
      { id: 'wallpapers' as SidebarSection, label: 'Wallpapers', icon: Palette, count: photos.filter(p => p.album === 'Wallpapers').length },
    ]},
  ];

  const tabItems: { id: PhotoTab; label: string; icon: React.ReactNode }[] = [
    { id: 'library', label: 'Library', icon: <Grid3X3 size={16} /> },
    { id: 'foryou', label: 'For You', icon: <Star size={16} /> },
    { id: 'albums', label: 'Albums', icon: <FolderOpen size={16} /> },
    { id: 'search', label: 'Search', icon: <Search size={16} /> },
  ];

  const albums = [
    { name: 'Nature', icon: <Mountain size={20} className="text-green-600" />, albumKey: 'nature' as SidebarSection },
    { name: 'Screenshots', icon: <Monitor size={20} className="text-gray-600" />, albumKey: 'screenshots' as SidebarSection },
    { name: 'Wallpapers', icon: <Palette size={20} className="text-purple-600" />, albumKey: 'wallpapers' as SidebarSection },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl overflow-hidden select-none relative">
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {activeTab === 'library' && (
          <div className="w-44 bg-gray-50 border-r border-gray-200 flex-shrink-0 overflow-y-auto py-2 hidden sm:block">
            {sidebarItems.map((group) => (
              <div key={group.section} className="mb-3">
                <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {group.section}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      <span className="text-gray-400 text-[10px]">{item.count}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Zoom control bar */}
          {(activeTab === 'library' || activeTab === 'search') && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0 bg-white">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-gray-700">
                  {activeSection === 'all' ? 'All Photos' :
                   activeSection === 'favorites' ? 'Favorites' :
                   activeSection === 'recents' ? 'Recents' :
                   activeSection === 'nature' ? 'Nature' :
                   activeSection === 'screenshots' ? 'Screenshots' :
                   'Wallpapers'}
                </h2>
                <span className="text-[10px] text-gray-400">{filteredPhotos.length} Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut size={13} className="text-gray-400" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
                <ZoomIn size={13} className="text-gray-400" />
              </div>
            </div>
          )}

          {/* Search bar for search tab */}
          {activeTab === 'search' && (
            <div className="p-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos by name, album, or description..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  autoFocus
                />
              </div>
              {searchQuery && (
                <p className="mt-2 text-[10px] text-gray-400">{filteredPhotos.length} result{filteredPhotos.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;</p>
              )}
            </div>
          )}

          {/* For You tab */}
          {activeTab === 'foryou' && (
            <div className="p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Memories</h2>
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 mb-4 cursor-pointer hover:scale-[1.01] transition-transform">
                <p className="text-xs text-gray-500 mb-1">Last Year</p>
                <p className="text-sm font-semibold text-gray-700">Spring Adventures</p>
                <p className="text-xs text-gray-500 mt-1">6 photos from this day last year</p>
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mb-3">Favorites</h2>
              <div className="grid grid-cols-3 gap-1.5">
                {photos.filter(p => p.favorited).slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${photo.gradient} relative`}>
                      {/* Simulate landscape/subject overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/10" />
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-4">Recent Highlights</h2>
              <div className="grid grid-cols-2 gap-2">
                {photos.filter(p => p.date === 'Today' || p.date === 'Yesterday').slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${photo.gradient} relative`}>
                      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black/10" />
                      <div className="absolute bottom-1.5 left-2">
                        <span className="text-[10px] text-white/80 font-medium drop-shadow">{photo.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums tab */}
          {activeTab === 'albums' && (
            <div className="p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">My Albums</h2>
              <div className="grid grid-cols-2 gap-3">
                {albums.map((album) => {
                  const albumPhotos = photos.filter((p) => p.album === album.name);
                  return (
                    <div
                      key={album.name}
                      className="cursor-pointer group"
                      onClick={() => {
                        setActiveSection(album.albumKey);
                        setActiveTab('library');
                      }}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-1.5 relative">
                        <div className={`w-full h-full bg-gradient-to-br ${albumPhotos[0]?.gradient || 'from-gray-200 to-gray-300'} group-hover:scale-[1.03] transition-transform relative`}>
                          {/* Simulate photo layers */}
                          <div className="absolute inset-0 bg-black/5" />
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent" />
                          {albumPhotos.length > 1 && (
                            <div className="absolute top-1.5 right-1.5 w-8 h-8 rounded-md overflow-hidden border border-white/30">
                              <div className={`w-full h-full bg-gradient-to-br ${albumPhotos[1]?.gradient || 'from-gray-300 to-gray-400'}`} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {album.icon}
                        <div>
                          <p className="text-xs font-medium text-gray-700">{album.name}</p>
                          <p className="text-[10px] text-gray-400">{albumPhotos.length} photos</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Library / Photo Grid */}
          {(activeTab === 'library' || activeTab === 'search') && (
            <div className="p-3 flex-1 overflow-y-auto">
              {/* Photo grid with zoom */}
              <div className={`grid grid-cols-${zoomConfig.cols} gap-${zoomLevel === 3 ? '2' : zoomLevel === 2 ? '1.5' : '1'}`}
                style={{
                  gridTemplateColumns: `repeat(${zoomConfig.cols}, minmax(0, 1fr))`,
                  gap: zoomLevel === 3 ? '8px' : zoomLevel === 2 ? '6px' : '4px',
                }}
              >
                {filteredPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="aspect-square rounded-md overflow-hidden cursor-pointer relative group"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${photo.gradient} group-hover:scale-110 transition-transform duration-200 relative`}>
                      {/* Landscape simulation overlays */}
                      {photo.album === 'Nature' && (
                        <>
                          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/20 to-transparent" />
                          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent" />
                        </>
                      )}
                      {photo.album === 'Screenshots' && (
                        <div className="absolute inset-2 border border-white/10 rounded-sm" />
                      )}
                      {photo.album === 'Wallpapers' && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />
                      )}
                    </div>
                    {/* Favorite indicator */}
                    {photo.favorited && (
                      <div className="absolute top-1 right-1">
                        <Heart size={10} className="text-white fill-white drop-shadow-sm" />
                      </div>
                    )}
                    {/* Hover overlay with title */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                      <div className="w-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white font-medium truncate drop-shadow">{photo.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredPhotos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ImageIcon size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">No photos found</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Detail View */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center rounded-xl"
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedPhotoId(null)
                    setShowInfoPanel(false)
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={16} />
                </button>
                <span className="text-white/80 text-xs font-medium">{selectedPhoto.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    showInfoPanel ? 'bg-white/25 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                  title="Show Info"
                >
                  <Info size={15} />
                </button>
                <button
                  onClick={() => toggleFavorite(selectedPhoto.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Heart
                    size={15}
                    className={selectedPhoto.favorited ? 'text-red-500 fill-red-500' : 'text-white/80'}
                  />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                  title="Share"
                >
                  <Share2 size={15} />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Photo container */}
            <div className="flex items-center justify-center w-full h-full px-16 relative">
              {/* Navigation arrows */}
              <button
                onClick={goToPrevPhoto}
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-10 ${
                  filteredPhotos.findIndex((p) => p.id === selectedPhotoId) === 0
                    ? 'bg-white/5 text-white/20 cursor-default'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                disabled={filteredPhotos.findIndex((p) => p.id === selectedPhotoId) === 0}
              >
                <ChevronLeft size={22} />
              </button>

              <motion.div
                key={selectedPhoto.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-lg aspect-[4/3] rounded-xl overflow-hidden shadow-2xl relative"
              >
                <div className={`w-full h-full bg-gradient-to-br ${selectedPhoto.gradient} relative`}>
                  {/* Landscape overlays for realism */}
                  {selectedPhoto.album === 'Nature' && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/25 to-transparent" />
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/15 to-transparent" />
                    </>
                  )}
                  {selectedPhoto.album === 'Screenshots' && (
                    <div className="absolute inset-4 border border-white/10 rounded-sm" />
                  )}
                  {selectedPhoto.album === 'Wallpapers' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10" />
                  )}
                </div>
              </motion.div>

              <button
                onClick={goToNextPhoto}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-10 ${
                  filteredPhotos.findIndex((p) => p.id === selectedPhotoId) === filteredPhotos.length - 1
                    ? 'bg-white/5 text-white/20 cursor-default'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                disabled={filteredPhotos.findIndex((p) => p.id === selectedPhotoId) === filteredPhotos.length - 1}
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Bottom info strip */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-4 z-10">
              <div className="text-center">
                <p className="text-white text-sm font-medium">{selectedPhoto.title}</p>
                <p className="text-gray-400 text-[11px]">{selectedPhoto.album} · {selectedPhoto.date}</p>
              </div>
            </div>

            {/* Info panel sidebar */}
            <AnimatePresence>
              {showInfoPanel && (
                <motion.div
                  initial={{ x: 280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 280, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-0 right-0 bottom-0 w-[280px] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white">Info</h3>
                      <button
                        onClick={() => setShowInfoPanel(false)}
                        className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Photo preview */}
                    <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4">
                      <div className={`w-full h-full bg-gradient-to-br ${selectedPhoto.gradient} relative`}>
                        {selectedPhoto.album === 'Nature' && (
                          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/25 to-transparent" />
                        )}
                      </div>
                    </div>

                    {/* Title & album */}
                    <div className="mb-4">
                      <p className="text-white text-sm font-medium">{selectedPhoto.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{selectedPhoto.album}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="border-t border-white/10 pt-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Size</span>
                            <span className="text-gray-200">{selectedPhoto.size}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Dimensions</span>
                            <span className="text-gray-200">{selectedPhoto.dimensions}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Date</span>
                            <span className="text-gray-200">{selectedPhoto.dateRaw}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Camera</span>
                            <span className="text-gray-200">iPhone 15 Pro</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">f-stop</span>
                            <span className="text-gray-200">f/1.8</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Exposure</span>
                            <span className="text-gray-200">1/120s</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">ISO</span>
                            <span className="text-gray-200">64</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Focal Length</span>
                            <span className="text-gray-200">6mm</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="border-t border-white/10 pt-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Description</h4>
                        <p className="text-xs text-gray-300">{selectedPhoto.description}</p>
                      </div>

                      {/* Favorite */}
                      <div className="border-t border-white/10 pt-3">
                        <button
                          onClick={() => toggleFavorite(selectedPhoto.id)}
                          className="flex items-center gap-2 text-xs transition-colors"
                        >
                          <Heart
                            size={14}
                            className={selectedPhoto.favorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                          />
                          <span className={selectedPhoto.favorited ? 'text-red-400' : 'text-gray-400'}>
                            {selectedPhoto.favorited ? 'Favorited' : 'Add to Favorites'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Bar */}
      <div className="flex items-center justify-around bg-white border-t border-gray-200 px-2 py-1.5 flex-shrink-0">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'search') setSearchQuery('');
            }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
