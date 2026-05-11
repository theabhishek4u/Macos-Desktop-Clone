'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1,
  Music as MusicIcon, Clock, User, Disc3, ListMusic, Plus, Heart, Search,
  Shuffle, Repeat, Repeat1, Mic2, X, ChevronRight
} from 'lucide-react';

type SidebarItem = 'recent' | 'artists' | 'albums' | 'songs' | 'playlist-1' | 'playlist-2' | 'playlist-3' | 'playlist-4';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  gradient: string;
  favorited: boolean;
  lyrics: string[];
}

const SONGS: Song[] = [
  {
    id: 1, title: 'Midnight Drive', artist: 'Neon Waves', album: 'After Hours', duration: 234, gradient: 'from-rose-500 to-pink-400', favorited: true,
    lyrics: [
      'Cruising down the empty street',
      'Headlights cutting through the night',
      'Radio playing something sweet',
      'Everything feels just right',
      '',
      'Midnight drive, take me far',
      'Underneath the glowing stars',
      'Leave the world behind tonight',
      'Just the road and the moonlight',
      '',
      'Windows down, the air is cool',
      'City lights are fading out',
      'Nothing left to prove',
      'Just this moment, here and now',
    ]
  },
  {
    id: 2, title: 'Golden Hour', artist: 'Amber Sky', album: 'Sunset Boulevard', duration: 198, gradient: 'from-amber-500 to-orange-400', favorited: false,
    lyrics: [
      'The sky is painting orange and gold',
      'Another day is growing old',
      'Shadows stretching on the ground',
      'Beauty waiting to be found',
      '',
      'Golden hour, hold me close',
      'Before the daylight goes',
      'In this moment, time stands still',
      'Just the warmth, just the thrill',
    ]
  },
  {
    id: 3, title: 'Ocean Eyes', artist: 'Blue Horizon', album: 'Deep Blue', duration: 256, gradient: 'from-sky-500 to-cyan-400', favorited: true,
    lyrics: [
      'Waves are crashing on the shore',
      'Salt and sand beneath my feet',
      'Could stay here forevermore',
      'Where the ocean and sky meet',
      '',
      'Ocean eyes, deep and wide',
      'Pulling me like the tide',
      'Swimming in the shade of blue',
      'Lost in the depths of you',
      '',
      'Seagulls calling overhead',
      'Sunlight dancing on the crest',
      'Every word left unsaid',
      'Whispered by the ocean\'s breath',
    ]
  },
  {
    id: 4, title: 'Electric Dreams', artist: 'Synthwave', album: 'Retro Future', duration: 312, gradient: 'from-violet-500 to-purple-400', favorited: false,
    lyrics: [
      'Neon signs in pouring rain',
      'Synthesizers in my brain',
      'Running through the city lights',
      'Chasing electric nights',
      '',
      'Electric dreams, take me higher',
      'Through the wires, through the fire',
      'Binary code running deep',
      'Promises we couldn\'t keep',
      '',
      'Pixel hearts and laser beams',
      'Nothing is quite what it seems',
      'In this world of make believe',
      'Electric dreams, I never leave',
    ]
  },
  {
    id: 5, title: 'Forest Rain', artist: 'Emerald', album: 'Nature Sounds', duration: 189, gradient: 'from-emerald-500 to-green-400', favorited: false,
    lyrics: [
      'Drops on leaves so gently fall',
      'Nature sings her lullaby',
      'Standing beneath the canopy tall',
      'Watching clouds drift by',
      '',
      'Forest rain, wash away',
      'All the noise, all the gray',
      'Leave me clean, leave me new',
      'Morning dew, forest hue',
    ]
  },
  {
    id: 6, title: 'City Lights', artist: 'Metro Pulse', album: 'Urban Vibes', duration: 267, gradient: 'from-slate-600 to-gray-400', favorited: true,
    lyrics: [
      'Skyscrapers touching clouds',
      'Traffic humming far below',
      'In this sea of rushing crowds',
      'There\'s a rhythm that I know',
      '',
      'City lights, they never sleep',
      'Promises they always keep',
      'Burning bright against the dark',
      'Every window tells a spark',
      '',
      'Subway trains and taxi cabs',
      'Coffee shops and subway tabs',
      'Million stories in the air',
      'City lights are everywhere',
    ]
  },
  {
    id: 7, title: 'Lavender Haze', artist: 'Pastel Dream', album: 'Color Theory', duration: 221, gradient: 'from-fuchsia-500 to-pink-400', favorited: false,
    lyrics: [
      'Soft petals in the morning light',
      'Lavender fields in my sight',
      'Gentle breeze and purple hues',
      'Nothing but these views',
      '',
      'Lavender haze, soft and sweet',
      'Laying at your feet',
      'Colors blend and fade away',
      'In this dream I want to stay',
    ]
  },
  {
    id: 8, title: 'Sunrise Melody', artist: 'Dawn Chorus', album: 'Early Light', duration: 178, gradient: 'from-yellow-400 to-amber-300', favorited: false,
    lyrics: [
      'First light breaks across the sky',
      'Birds begin their morning song',
      'Night is saying its goodbye',
      'Day has waited all night long',
      '',
      'Sunrise melody, play for me',
      'Set my spirit free',
      'Golden rays and morning dew',
      'Everything feels new',
    ]
  },
  {
    id: 9, title: 'Starlight', artist: 'Cosmos', album: 'Galaxy Walk', duration: 295, gradient: 'from-indigo-500 to-blue-400', favorited: true,
    lyrics: [
      'Billions of stars above my head',
      'Each one a story to be read',
      'Floating in this cosmic sea',
      'Starlight shining endlessly',
      '',
      'Starlight, guide my way',
      'Through the milky way',
      'Constellations drawing near',
      'Universe so clear',
      '',
      'Nebula in shades of blue',
      'Galaxies spiral into view',
      'In the silence, I can hear',
      'Starlight whispering, be here',
    ]
  },
  {
    id: 10, title: 'Velvet Night', artist: 'Luna', album: 'Moonrise', duration: 243, gradient: 'from-purple-600 to-violet-500', favorited: false,
    lyrics: [
      'Moon is rising soft and slow',
      'Casting shadows down below',
      'Velvet sky, a deep embrace',
      'Night has found its resting place',
      '',
      'Velvet night, hold me tight',
      'Under silver light',
      'Stars like diamonds in the dark',
      'Every one a spark',
      '',
      'Midnight whispers, secrets shared',
      'Showing someone cared',
      'Velvet night, don\'t end soon',
      'Dance beneath the moon',
    ]
  },
  {
    id: 11, title: 'Crimson Wave', artist: 'Neon Waves', album: 'After Hours', duration: 210, gradient: 'from-red-500 to-rose-400', favorited: false,
    lyrics: [
      'Red light floods the open road',
      'Carrying a heavy load',
      'Crimson waves crash on the shore',
      'Leaving me wanting more',
      '',
      'Crimson wave, carry me',
      'To where I\'m wild and free',
      'Paint the world in shades of red',
      'Where the river meets the bed',
    ]
  },
  {
    id: 12, title: 'Silver Lining', artist: 'Amber Sky', album: 'Sunset Boulevard', duration: 245, gradient: 'from-gray-400 to-slate-300', favorited: false,
    lyrics: [
      'Behind every cloud they say',
      'There\'s a brighter day',
      'Silver lining, shining through',
      'Waiting there for you',
      '',
      'Silver lining in the gray',
      'Chasing clouds away',
      'Even storms must end someday',
      'And the light will stay',
    ]
  },
];

const PLAYLISTS = {
  'playlist-1': { name: 'Chill Vibes', songIds: [1, 3, 5, 7, 9] },
  'playlist-2': { name: 'Workout', songIds: [4, 6, 2, 11, 8] },
  'playlist-3': { name: 'Road Trip', songIds: [7, 9, 10, 1, 12] },
  'playlist-4': { name: 'Focus', songIds: [5, 3, 9, 12, 2] },
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function MusicApp() {
  const [songs, setSongs] = useState<Song[]>(SONGS);
  const [activeSection, setActiveSection] = useState<SidebarItem>('songs');
  const [currentSongId, setCurrentSongId] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(progress);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentSong = songs.find((s) => s.id === currentSongId) || songs[0];

  // Keep ref in sync
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const getDisplayedSongIds = useCallback((): number[] => {
    switch (activeSection) {
      case 'recent':
        return songs.slice(0, 5).map(s => s.id);
      case 'artists':
        return songs.map(s => s.id);
      case 'albums':
        return songs.map(s => s.id);
      case 'songs':
        return songs.map(s => s.id);
      default:
        if (activeSection.startsWith('playlist')) {
          const pl = PLAYLISTS[activeSection as keyof typeof PLAYLISTS];
          return pl ? pl.songIds : songs.map(s => s.id);
        }
        return songs.map(s => s.id);
    }
  }, [activeSection, songs]);

  // Build the queue based on current section and shuffle
  const getQueue = useCallback((): Song[] => {
    const displayedIds = getDisplayedSongIds();
    const currentIdx = displayedIds.indexOf(currentSongId);
    if (currentIdx === -1) return displayedIds.map(id => songs.find(s => s.id === id)!).filter(Boolean);
    const upcoming = displayedIds.slice(currentIdx + 1).map(id => songs.find(s => s.id === id)!).filter(Boolean);
    return upcoming;
  }, [currentSongId, activeSection, shuffleOn, songs, getDisplayedSongIds]);

  // Simulated progress
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Handle repeat/shuffle on song end
            if (repeatMode === 'one') {
              return 0; // restart same song
            }
            const displayedIds = getDisplayedSongIds();
            const idx = displayedIds.indexOf(currentSongId);
            if (shuffleOn) {
              const randomIdx = Math.floor(Math.random() * displayedIds.length);
              setCurrentSongId(displayedIds[randomIdx]);
            } else {
              const nextIdx = (idx + 1) % displayedIds.length;
              if (nextIdx === 0 && repeatMode === 'off') {
                setIsPlaying(false);
                return 0;
              }
              setCurrentSongId(displayedIds[nextIdx]);
            }
            return 0;
          }
          return prev + 100 / (currentSong.duration * 10);
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentSongId, currentSong.duration, shuffleOn, repeatMode, getDisplayedSongIds]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const playNext = useCallback(() => {
    const displayedIds = getDisplayedSongIds();
    if (shuffleOn) {
      const randomIdx = Math.floor(Math.random() * displayedIds.length);
      setCurrentSongId(displayedIds[randomIdx]);
    } else {
      const idx = displayedIds.indexOf(currentSongId);
      const nextIdx = (idx + 1) % displayedIds.length;
      setCurrentSongId(displayedIds[nextIdx]);
    }
    setProgress(0);
  }, [currentSongId, shuffleOn, getDisplayedSongIds]);

  const playPrev = useCallback(() => {
    // If more than 3 seconds in, restart the song
    if (progressRef.current > (300 / currentSong.duration)) {
      setProgress(0);
      return;
    }
    const displayedIds = getDisplayedSongIds();
    const idx = displayedIds.indexOf(currentSongId);
    const prevIdx = (idx - 1 + displayedIds.length) % displayedIds.length;
    setCurrentSongId(displayedIds[prevIdx]);
    setProgress(0);
  }, [currentSongId, currentSong.duration, getDisplayedSongIds]);

  const playSong = useCallback((id: number) => {
    setCurrentSongId(id);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, favorited: !s.favorited } : s)));
  }, []);

  const handleProgressSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, pct)));
  }, []);

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setVolume(Math.max(0, Math.min(100, pct)));
    setIsMuted(false);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const elapsedSeconds = Math.floor((progress / 100) * currentSong.duration);

  // Get the songs to display in main content
  const getDisplayedSongs = (): Song[] => {
    let songIds: number[];
    switch (activeSection) {
      case 'recent':
        songIds = songs.slice(0, 5).map(s => s.id);
        break;
      case 'artists':
        songIds = songs.map(s => s.id);
        break;
      case 'albums':
        songIds = songs.map(s => s.id);
        break;
      case 'songs':
        songIds = songs.map(s => s.id);
        break;
      default:
        if (activeSection.startsWith('playlist')) {
          const pl = PLAYLISTS[activeSection as keyof typeof PLAYLISTS];
          songIds = pl ? pl.songIds : songs.map(s => s.id);
        } else {
          songIds = songs.map(s => s.id);
        }
    }
    return songIds.map(id => songs.find(s => s.id === id)!).filter(Boolean);
  };

  const displayedSongs = searchQuery
    ? songs.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getDisplayedSongs();

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

  // Queue songs
  const queueSongs = getQueue();

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
        { id: 'playlist-2' as SidebarItem, label: 'Workout', icon: ListMusic },
        { id: 'playlist-3' as SidebarItem, label: 'Road Trip', icon: ListMusic },
        { id: 'playlist-4' as SidebarItem, label: 'Focus', icon: ListMusic },
      ],
    },
  ];

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
                    onClick={() => { setActiveSection(item.id); setSearchQuery(''); }}
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section Header with Search */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">
              {searchQuery ? 'Search Results' :
               activeSection === 'recent' ? 'Recently Added' :
               activeSection === 'artists' ? 'Artists' :
               activeSection === 'albums' ? 'Albums' :
               activeSection === 'songs' ? 'Songs' :
               activeSection === 'playlist-1' ? 'Chill Vibes' :
               activeSection === 'playlist-2' ? 'Workout' :
               activeSection === 'playlist-3' ? 'Road Trip' :
               'Focus'}
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs..."
                  className="pl-7 pr-2 py-1 text-[11px] bg-gray-100 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-300 w-36"
                />
              </div>
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`p-1.5 rounded-md transition-colors ${showLyrics ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Lyrics"
              >
                <Mic2 size={14} />
              </button>
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-1.5 rounded-md transition-colors ${showQueue ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Up Next"
              >
                <ListMusic size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Main scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Lyrics Panel (overlay) */}
              {showLyrics && (
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-center">
                  <div className={`w-32 h-32 mx-auto rounded-lg bg-gradient-to-br ${currentSong.gradient} shadow-lg flex items-center justify-center mb-4`}>
                    <MusicIcon size={40} className="text-white/60" />
                  </div>
                  <h2 className="text-white font-bold text-lg">{currentSong.title}</h2>
                  <p className="text-gray-400 text-xs mb-4">{currentSong.artist}</p>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {currentSong.lyrics.map((line, i) => (
                      <p
                        key={i}
                        className={`text-sm leading-relaxed transition-all ${
                          line === '' ? 'h-4' : 'text-gray-300 hover:text-white cursor-pointer'
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Album art header for playlists */}
              {activeSection.startsWith('playlist') && !searchQuery && (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-b from-gray-50 to-white">
                  <div className={`w-28 h-28 rounded-lg bg-gradient-to-br ${displayedSongs[0]?.gradient || 'from-gray-300 to-gray-400'} shadow-lg flex items-center justify-center`}>
                    <ListMusic size={36} className="text-white/70" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {PLAYLISTS[activeSection as keyof typeof PLAYLISTS]?.name || 'Playlist'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">{displayedSongs.length} songs</p>
                    <button
                      onClick={() => playSong(displayedSongs[0]?.id)}
                      className="mt-3 px-5 py-2 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Play size={12} fill="white" /> Play
                    </button>
                  </div>
                </div>
              )}

              {/* Artists View */}
              {activeSection === 'artists' && !searchQuery && (
                <div className="p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
              {activeSection === 'albums' && !searchQuery && (
                <div className="p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
                          <div className={`w-full h-full bg-gradient-to-br ${album.gradient} group-hover:scale-105 transition-transform relative`}>
                            <MusicIcon size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-700 truncate">{album.name}</p>
                        <p className="text-[10px] text-gray-400">{album.artist}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Songs / Recent / Playlist View */}
              {(activeSection === 'songs' || activeSection === 'recent' || activeSection.startsWith('playlist') || searchQuery) && (
                <div className="p-4">
                  {/* Now Playing Album Art (for songs view) */}
                  {activeSection === 'songs' && !searchQuery && (
                    <div className="flex items-center gap-5 mb-5 bg-gradient-to-r from-gray-50 to-transparent p-4 rounded-xl">
                      <div className={`w-32 h-32 rounded-xl bg-gradient-to-br ${currentSong.gradient} shadow-lg flex items-center justify-center flex-shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
                        <Disc3 size={48} className="text-white/50" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Now Playing</p>
                        <h2 className="text-2xl font-bold text-gray-800 mt-0.5">{currentSong.title}</h2>
                        <p className="text-sm text-gray-500">{currentSong.artist} — {currentSong.album}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={togglePlay}
                            className="px-5 py-2 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                            {isPlaying ? 'Pause' : 'Play'}
                          </button>
                          <button
                            onClick={() => toggleFavorite(currentSong.id)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Heart
                              size={16}
                              className={currentSong.favorited ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'}
                            />
                          </button>
                        </div>
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

            {/* Queue / Up Next Sidebar */}
            {showQueue && (
              <div className="w-56 border-l border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700">Up Next</h3>
                  <button onClick={() => setShowQueue(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {queueSongs.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-[11px] text-gray-400">No more tracks in queue</p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {queueSongs.map((song) => (
                        <button
                          key={song.id}
                          onClick={() => playSong(song.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 rounded bg-gradient-to-br ${song.gradient} flex-shrink-0 flex items-center justify-center`}>
                            <MusicIcon size={10} className="text-white/60" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-gray-700 truncate">{song.title}</p>
                            <p className="text-[9px] text-gray-400 truncate">{song.artist}</p>
                          </div>
                          <span className="text-[9px] text-gray-400 tabular-nums">{formatDuration(song.duration)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Now playing in queue */}
                <div className="border-t border-gray-200 p-3 bg-white">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium mb-2">Now Playing</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded bg-gradient-to-br ${currentSong.gradient} flex-shrink-0 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                      <MusicIcon size={12} className="text-white/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-gray-800 truncate">{currentSong.title}</p>
                      <p className="text-[9px] text-gray-400 truncate">{currentSong.artist}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Now Playing Bar */}
      <div className="bg-[#f5f0e8] border-t border-gray-200 px-4 py-2 flex-shrink-0">
        {/* Progress bar */}
        <div className="w-full mb-1.5">
          <div
            ref={progressBarRef}
            className="w-full h-1.5 bg-gray-200/80 rounded-full cursor-pointer relative group"
            onClick={handleProgressSeek}
          >
            <div
              className="h-full bg-red-500 rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border-2 border-white" />
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
            <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${currentSong.gradient} flex-shrink-0 shadow-sm flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
              <MusicIcon size={16} className="text-white/70" />
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShuffleOn(!shuffleOn)}
              className={`p-1 rounded-md transition-colors ${shuffleOn ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
              title="Shuffle"
            >
              <Shuffle size={13} />
            </button>
            <button onClick={playPrev} className="text-gray-500 hover:text-gray-800 transition-colors">
              <SkipBack size={16} />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors shadow-sm"
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-gray-500 hover:text-gray-800 transition-colors">
              <SkipForward size={16} />
            </button>
            <button
              onClick={cycleRepeat}
              className={`p-1 rounded-md transition-colors relative ${repeatMode !== 'off' ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
              title={repeatMode === 'off' ? 'Repeat Off' : repeatMode === 'all' ? 'Repeat All' : 'Repeat One'}
            >
              {repeatMode === 'one' ? <Repeat1 size={13} /> : <Repeat size={13} />}
              {repeatMode !== 'off' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1.5 w-1/3 justify-end">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-1 rounded transition-colors ${showLyrics ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
              title="Lyrics"
            >
              <Mic2 size={13} />
            </button>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-1 rounded transition-colors ${showQueue ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
              title="Queue"
            >
              <ListMusic size={13} />
            </button>
            <div className="h-4 w-px bg-gray-300 mx-0.5" />
            <button onClick={() => setIsMuted((m) => !m)} className="text-gray-400 hover:text-gray-600 transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={14} /> : volume < 50 ? <Volume1 size={14} /> : <Volume2 size={14} />}
            </button>
            <div
              className="w-20 h-1.5 bg-gray-200/80 rounded-full cursor-pointer relative group"
              onClick={handleVolumeChange}
            >
              <div
                className="h-full bg-gray-400 rounded-full relative transition-all"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
