'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Music as MusicIcon, Clock, User, Disc3, ListMusic, Plus, Heart, Search
} from 'lucide-react';

type SidebarItem = 'recent' | 'artists' | 'albums' | 'songs' | 'playlist-1' | 'playlist-2' | 'playlist-3';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  gradient: string;
  favorited: boolean;
}

const SONGS: Song[] = [
  { id: 1, title: 'Midnight Drive', artist: 'Neon Waves', album: 'After Hours', duration: 234, gradient: 'from-rose-500 to-pink-400', favorited: true },
  { id: 2, title: 'Golden Hour', artist: 'Amber Sky', album: 'Sunset Boulevard', duration: 198, gradient: 'from-amber-500 to-orange-400', favorited: false },
  { id: 3, title: 'Ocean Eyes', artist: 'Blue Horizon', album: 'Deep Blue', duration: 256, gradient: 'from-sky-500 to-cyan-400', favorited: true },
  { id: 4, title: 'Electric Dreams', artist: 'Synthwave', album: 'Retro Future', duration: 312, gradient: 'from-violet-500 to-purple-400', favorited: false },
  { id: 5, title: 'Forest Rain', artist: 'Emerald', album: 'Nature Sounds', duration: 189, gradient: 'from-emerald-500 to-green-400', favorited: false },
  { id: 6, title: 'City Lights', artist: 'Metro Pulse', album: 'Urban Vibes', duration: 267, gradient: 'from-slate-600 to-gray-400', favorited: true },
  { id: 7, title: 'Lavender Haze', artist: 'Pastel Dream', album: 'Color Theory', duration: 221, gradient: 'from-fuchsia-500 to-pink-400', favorited: false },
  { id: 8, title: 'Sunrise Melody', artist: 'Dawn Chorus', album: 'Early Light', duration: 178, gradient: 'from-yellow-400 to-amber-300', favorited: false },
  { id: 9, title: 'Starlight', artist: 'Cosmos', album: 'Galaxy Walk', duration: 295, gradient: 'from-indigo-500 to-blue-400', favorited: true },
  { id: 10, title: 'Velvet Night', artist: 'Luna', album: 'Moonrise', duration: 243, gradient: 'from-purple-600 to-violet-500', favorited: false },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Music() {
  const [songs, setSongs] = useState<Song[]>(SONGS);
  const [activeSection, setActiveSection] = useState<SidebarItem>('songs');
  const [currentSongId, setCurrentSongId] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSong = songs.find((s) => s.id === currentSongId) || songs[0];

  // Simulated progress
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Auto next
            const idx = songs.findIndex((s) => s.id === currentSongId);
            const nextIdx = (idx + 1) % songs.length;
            setCurrentSongId(songs[nextIdx].id);
            return 0;
          }
          return prev + 100 / (currentSong.duration * 10); // update every 100ms
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentSongId, currentSong.duration, songs]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const playNext = useCallback(() => {
    const idx = songs.findIndex((s) => s.id === currentSongId);
    const nextIdx = (idx + 1) % songs.length;
    setCurrentSongId(songs[nextIdx].id);
    setProgress(0);
  }, [songs, currentSongId]);

  const playPrev = useCallback(() => {
    const idx = songs.findIndex((s) => s.id === currentSongId);
    const prevIdx = (idx - 1 + songs.length) % songs.length;
    setCurrentSongId(songs[prevIdx].id);
    setProgress(0);
  }, [songs, currentSongId]);

  const playSong = useCallback((id: number) => {
    setCurrentSongId(id);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, favorited: !s.favorited } : s)));
  }, []);

  const elapsedSeconds = Math.floor((progress / 100) * currentSong.duration);

  const sidebarSections = [
    {
      title: 'Library',
      items: [
        { id: 'recent' as SidebarItem, label: 'Recently Added', icon: Clock },
        { id: 'artists' as SidebarItem, label: 'Artists', icon: User },
        { id: 'albums' as SidebarItem, label: 'Albums', icon: Disc3 },
        { id: 'songs' as SidebarItem, label: 'Songs', icon: MusicIcon },
      ],
    },
    {
      title: 'Playlists',
      items: [
        { id: 'playlist-1' as SidebarItem, label: 'Chill Vibes', icon: ListMusic },
        { id: 'playlist-2' as SidebarItem, label: 'Workout Mix', icon: ListMusic },
        { id: 'playlist-3' as SidebarItem, label: 'Road Trip', icon: ListMusic },
      ],
    },
  ];

  const getDisplayedSongs = (): Song[] => {
    switch (activeSection) {
      case 'recent':
        return songs.slice(0, 5);
      case 'artists':
        return songs;
      case 'albums':
        return songs;
      case 'songs':
        return songs;
      case 'playlist-1':
        return [songs[0], songs[2], songs[4], songs[8]];
      case 'playlist-2':
        return [songs[1], songs[3], songs[5], songs[7]];
      case 'playlist-3':
        return [songs[6], songs[8], songs[9], songs[0]];
      default:
        return songs;
    }
  };

  const displayedSongs = getDisplayedSongs();

  // Get unique albums
  const albums = Array.from(new Set(songs.map((s) => s.album))).map((album) => {
    const song = songs.find((s) => s.album === album)!;
    return { name: album, gradient: song.gradient, artist: song.artist, count: songs.filter((s) => s.album === album).length };
  });

  // Get unique artists
  const artists = Array.from(new Set(songs.map((s) => s.artist))).map((artist) => {
    const song = songs.find((s) => s.artist === artist)!;
    return { name: artist, gradient: song.gradient, count: songs.filter((s) => s.artist === artist).length };
  });

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl overflow-hidden select-none">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#f5f0e8] border-r border-gray-200 flex-shrink-0 overflow-y-auto py-2 hidden sm:block">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-3">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </span>
                {section.title === 'Playlists' && (
                  <Plus size={12} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                )}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-red-500/10 text-red-600'
                        : 'text-gray-600 hover:bg-black/5'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-red-500' : 'text-gray-400'} />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Section Title */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-800">
              {activeSection === 'recent' ? 'Recently Added' :
               activeSection === 'artists' ? 'Artists' :
               activeSection === 'albums' ? 'Albums' :
               activeSection === 'songs' ? 'Songs' :
               activeSection === 'playlist-1' ? 'Chill Vibes' :
               activeSection === 'playlist-2' ? 'Workout Mix' :
               'Road Trip'}
            </h1>
          </div>

          {/* Artists View */}
          {activeSection === 'artists' && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {artists.map((artist) => (
                  <div key={artist.name} className="flex flex-col items-center cursor-pointer group">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${artist.gradient} shadow-md group-hover:scale-105 transition-transform flex items-center justify-center`}>
                      <User size={28} className="text-white/70" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 mt-2 text-center">{artist.name}</p>
                    <p className="text-[10px] text-gray-400">{artist.count} songs</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums View */}
          {activeSection === 'albums' && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {albums.map((album) => (
                  <div
                    key={album.name}
                    className="cursor-pointer group"
                    onClick={() => {
                      const firstSong = songs.find((s) => s.album === album.name);
                      if (firstSong) playSong(firstSong.id);
                    }}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden shadow-sm mb-1.5">
                      <div className={`w-full h-full bg-gradient-to-br ${album.gradient} group-hover:scale-105 transition-transform`} />
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate">{album.name}</p>
                    <p className="text-[10px] text-gray-400">{album.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Songs / Recent / Playlist View */}
          {(activeSection === 'songs' || activeSection === 'recent' || activeSection.startsWith('playlist')) && (
            <div className="p-4">
              {/* Album art header for playlists */}
              {activeSection.startsWith('playlist') && (
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${displayedSongs[0]?.gradient || 'from-gray-300 to-gray-400'} shadow-lg flex items-center justify-center`}>
                    <ListMusic size={32} className="text-white/70" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {activeSection === 'playlist-1' ? 'Chill Vibes' :
                       activeSection === 'playlist-2' ? 'Workout Mix' : 'Road Trip'}
                    </h2>
                    <p className="text-xs text-gray-400">{displayedSongs.length} songs</p>
                    <button
                      onClick={() => playSong(displayedSongs[0]?.id)}
                      className="mt-2 px-4 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <Play size={12} fill="white" /> Play
                    </button>
                  </div>
                </div>
              )}

              {/* Song list header */}
              <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-3 px-2 py-1 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                <span>#</span>
                <span>Title</span>
                <span className="hidden sm:block">Album</span>
                <span className="text-right"><Clock size={12} className="inline" /></span>
              </div>

              {/* Song rows */}
              <div className="divide-y divide-gray-50">
                {displayedSongs.map((song, idx) => {
                  const isCurrentSong = song.id === currentSongId;
                  return (
                    <div
                      key={song.id}
                      onDoubleClick={() => playSong(song.id)}
                      onClick={() => playSong(song.id)}
                      className={`grid grid-cols-[2rem_1fr_1fr_3rem] gap-3 px-2 py-2 items-center cursor-pointer transition-colors rounded-md group ${
                        isCurrentSong ? 'bg-red-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-xs ${isCurrentSong ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {isCurrentSong && isPlaying ? (
                          <span className="flex items-center gap-0.5">
                            <span className="w-0.5 h-2.5 bg-red-500 animate-pulse rounded-full" />
                            <span className="w-0.5 h-3.5 bg-red-500 animate-pulse rounded-full delay-75" />
                            <span className="w-0.5 h-2 bg-red-500 animate-pulse rounded-full delay-150" />
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded bg-gradient-to-br ${song.gradient} flex-shrink-0 flex items-center justify-center`}>
                          <MusicIcon size={12} className="text-white/60" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${isCurrentSong ? 'text-red-500' : 'text-gray-800'}`}>
                            {song.title}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{song.artist}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Heart
                            size={12}
                            className={song.favorited ? 'text-red-500 fill-red-500 opacity-100' : 'text-gray-300 hover:text-red-400'}
                          />
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400 truncate hidden sm:block">{song.album}</span>
                      <span className="text-[10px] text-gray-400 text-right tabular-nums">{formatDuration(song.duration)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Now Playing Bar */}
      <div className="bg-[#f5f0e8] border-t border-gray-200 px-4 py-2 flex-shrink-0">
        {/* Progress bar */}
        <div className="w-full mb-2">
          <div
            className="w-full h-1 bg-gray-200 rounded-full cursor-pointer relative group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = ((e.clientX - rect.left) / rect.width) * 100;
              setProgress(Math.max(0, Math.min(100, pct)));
            }}
          >
            <div
              className="h-full bg-red-500 rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
            </div>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-gray-400 tabular-nums">{formatDuration(elapsedSeconds)}</span>
            <span className="text-[9px] text-gray-400 tabular-nums">{formatDuration(currentSong.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Song info */}
          <div className="flex items-center gap-2 w-1/3 min-w-0">
            <div className={`w-9 h-9 rounded-md bg-gradient-to-br ${currentSong.gradient} flex-shrink-0 shadow-sm flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
              <MusicIcon size={14} className="text-white/70" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{currentSong.title}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <button onClick={() => toggleFavorite(currentSong.id)} className="flex-shrink-0 ml-1">
              <Heart
                size={13}
                className={currentSong.favorited ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'}
              />
            </button>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-3">
            <button onClick={playPrev} className="text-gray-500 hover:text-gray-800 transition-colors">
              <SkipBack size={16} />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors shadow-sm"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-gray-500 hover:text-gray-800 transition-colors">
              <SkipForward size={16} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1.5 w-1/3 justify-end">
            <button onClick={() => setIsMuted((m) => !m)} className="text-gray-400 hover:text-gray-600 transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <div
              className="w-20 h-1 bg-gray-200 rounded-full cursor-pointer relative group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setVolume(Math.max(0, Math.min(100, pct)));
                setIsMuted(false);
              }}
            >
              <div
                className="h-full bg-gray-400 rounded-full relative"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
