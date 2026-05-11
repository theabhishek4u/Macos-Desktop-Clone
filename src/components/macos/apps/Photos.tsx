'use client';

import React, { useState, useCallback } from 'react';
import { Heart, ChevronLeft, ChevronRight, X, Search, ImageIcon, Clock, Star, Grid3X3, FolderOpen, User, Mountain, Building2 } from 'lucide-react';

type PhotoTab = 'library' | 'foryou' | 'albums' | 'search';
type SidebarSection = 'all' | 'favorites' | 'recents' | 'nature' | 'city' | 'people';

interface Photo {
  id: number;
  gradient: string;
  title: string;
  album: string;
  date: string;
  favorited: boolean;
}

const PHOTOS: Photo[] = [
  { id: 1, gradient: 'from-rose-400 to-orange-300', title: 'Sunset Glow', album: 'Nature', date: 'Today', favorited: true },
  { id: 2, gradient: 'from-sky-400 to-cyan-300', title: 'Ocean Breeze', album: 'Nature', date: 'Today', favorited: false },
  { id: 3, gradient: 'from-emerald-400 to-teal-300', title: 'Forest Path', album: 'Nature', date: 'Yesterday', favorited: true },
  { id: 4, gradient: 'from-violet-400 to-purple-300', title: 'City Lights', album: 'City', date: 'Yesterday', favorited: false },
  { id: 5, gradient: 'from-amber-400 to-yellow-300', title: 'Golden Hour', album: 'Nature', date: 'This Week', favorited: true },
  { id: 6, gradient: 'from-pink-400 to-rose-300', title: 'Cherry Blossom', album: 'Nature', date: 'This Week', favorited: false },
  { id: 7, gradient: 'from-slate-600 to-zinc-400', title: 'Urban Night', album: 'City', date: 'This Week', favorited: false },
  { id: 8, gradient: 'from-indigo-400 to-blue-300', title: 'Twilight Sky', album: 'Nature', date: 'Last Week', favorited: true },
  { id: 9, gradient: 'from-red-400 to-pink-300', title: 'Portrait Light', album: 'People', date: 'Last Week', favorited: false },
  { id: 10, gradient: 'from-lime-400 to-green-300', title: 'Meadow', album: 'Nature', date: 'Last Month', favorited: false },
  { id: 11, gradient: 'from-orange-400 to-red-300', title: 'Autumn Walk', album: 'Nature', date: 'Last Month', favorited: true },
  { id: 12, gradient: 'from-fuchsia-400 to-purple-300', title: 'Neon City', album: 'City', date: 'Last Month', favorited: false },
  { id: 13, gradient: 'from-teal-400 to-emerald-300', title: 'Tropical Beach', album: 'Nature', date: 'Last Month', favorited: false },
  { id: 14, gradient: 'from-gray-500 to-slate-400', title: 'Cityscape', album: 'City', date: 'Last Month', favorited: false },
  { id: 15, gradient: 'from-cyan-400 to-sky-300', title: 'Family Day', album: 'People', date: 'Last Month', favorited: true },
  { id: 16, gradient: 'from-yellow-400 to-amber-300', title: 'Desert Sand', album: 'Nature', date: 'Earlier', favorited: false },
];

export default function Photos() {
  const [activeTab, setActiveTab] = useState<PhotoTab>('library');
  const [activeSection, setActiveSection] = useState<SidebarSection>('all');
  const [photos, setPhotos] = useState<Photo[]>(PHOTOS);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    } else if (activeSection === 'city') {
      filtered = filtered.filter((p) => p.album === 'City');
    } else if (activeSection === 'people') {
      filtered = filtered.filter((p) => p.album === 'People');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.album.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [photos, activeSection, searchQuery]);

  const filteredPhotos = getFilteredPhotos();
  const selectedPhoto = selectedPhotoId !== null ? photos.find((p) => p.id === selectedPhotoId) : null;

  const goToPrevPhoto = () => {
    if (selectedPhotoId === null) return;
    const idx = filteredPhotos.findIndex((p) => p.id === selectedPhotoId);
    if (idx > 0) setSelectedPhotoId(filteredPhotos[idx - 1].id);
  };

  const goToNextPhoto = () => {
    if (selectedPhotoId === null) return;
    const idx = filteredPhotos.findIndex((p) => p.id === selectedPhotoId);
    if (idx < filteredPhotos.length - 1) setSelectedPhotoId(filteredPhotos[idx + 1].id);
  };

  const sidebarItems = [
    { section: 'Library', items: [
      { id: 'all' as SidebarSection, label: 'All Photos', icon: ImageIcon, count: photos.length },
      { id: 'favorites' as SidebarSection, label: 'Favorites', icon: Heart, count: photos.filter(p => p.favorited).length },
      { id: 'recents' as SidebarSection, label: 'Recents', icon: Clock, count: photos.filter(p => p.date === 'Today' || p.date === 'Yesterday').length },
    ]},
    { section: 'Albums', items: [
      { id: 'nature' as SidebarSection, label: 'Nature', icon: Mountain, count: photos.filter(p => p.album === 'Nature').length },
      { id: 'city' as SidebarSection, label: 'City', icon: Building2, count: photos.filter(p => p.album === 'City').length },
      { id: 'people' as SidebarSection, label: 'People', icon: User, count: photos.filter(p => p.album === 'People').length },
    ]},
  ];

  const tabItems: { id: PhotoTab; label: string; icon: React.ReactNode }[] = [
    { id: 'library', label: 'Library', icon: <Grid3X3 size={16} /> },
    { id: 'foryou', label: 'For You', icon: <Star size={16} /> },
    { id: 'albums', label: 'Albums', icon: <FolderOpen size={16} /> },
    { id: 'search', label: 'Search', icon: <Search size={16} /> },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl overflow-hidden select-none">
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
        <div className="flex-1 overflow-y-auto">
          {/* Search bar for search tab */}
          {activeTab === 'search' && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          )}

          {/* For You tab */}
          {activeTab === 'foryou' && (
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Memories</h2>
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 mb-4">
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
                    <div className={`w-full h-full bg-gradient-to-br ${photo.gradient}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums tab */}
          {activeTab === 'albums' && (
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">My Albums</h2>
              <div className="grid grid-cols-2 gap-3">
                {['Nature', 'City', 'People'].map((album) => {
                  const albumPhotos = photos.filter((p) => p.album === album);
                  return (
                    <div key={album} className="cursor-pointer group" onClick={() => {
                      setActiveSection(album.toLowerCase() as SidebarSection);
                      setActiveTab('library');
                    }}>
                      <div className="aspect-square rounded-xl overflow-hidden mb-1.5">
                        <div className={`w-full h-full bg-gradient-to-br ${albumPhotos[0]?.gradient || 'from-gray-200 to-gray-300'} group-hover:scale-[1.03] transition-transform`} />
                      </div>
                      <p className="text-xs font-medium text-gray-700">{album}</p>
                      <p className="text-[10px] text-gray-400">{albumPhotos.length} photos</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Library / Photo Grid */}
          {(activeTab === 'library' || activeTab === 'search') && (
            <div className="p-3">
              {/* Section header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-sm font-semibold text-gray-700">
                  {activeSection === 'all' ? 'All Photos' :
                   activeSection === 'favorites' ? 'Favorites' :
                   activeSection === 'recents' ? 'Recents' :
                   activeSection === 'nature' ? 'Nature' :
                   activeSection === 'city' ? 'City' :
                   'People'}
                </h2>
                <span className="text-[10px] text-gray-400">{filteredPhotos.length} Photos</span>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-4 gap-1">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-md overflow-hidden cursor-pointer relative group"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  >
                    <div
                      className={`w-full h-full bg-gradient-to-br ${photo.gradient} group-hover:scale-110 transition-transform duration-200`}
                    />
                    {/* Favorite indicator */}
                    {photo.favorited && (
                      <div className="absolute top-1 right-1">
                        <Heart size={10} className="text-white fill-white drop-shadow-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredPhotos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ImageIcon size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">No photos found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Detail View */}
      {selectedPhoto && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center rounded-xl">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10">
            <button
              onClick={() => setSelectedPhotoId(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={16} />
            </button>
            <button
              onClick={() => toggleFavorite(selectedPhoto.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Heart
                size={16}
                className={selectedPhoto.favorited ? 'text-red-500 fill-red-500' : 'text-white'}
              />
            </button>
          </div>

          {/* Photo */}
          <div className="w-[80%] max-w-md aspect-square rounded-xl overflow-hidden shadow-2xl">
            <div className={`w-full h-full bg-gradient-to-br ${selectedPhoto.gradient}`} />
          </div>

          {/* Info */}
          <div className="mt-4 text-center">
            <p className="text-white text-sm font-medium">{selectedPhoto.title}</p>
            <p className="text-gray-400 text-xs">{selectedPhoto.album} · {selectedPhoto.date}</p>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goToPrevPhoto}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            disabled={filteredPhotos.findIndex((p) => p.id === selectedPhotoId) === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNextPhoto}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            disabled={filteredPhotos.findIndex((p) => p.id === selectedPhotoId) === filteredPhotos.length - 1}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

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
