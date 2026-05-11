'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Navigation,
  Plus,
  Minus,
  Compass,
  ChevronLeft,
  ChevronRight,
  Car,
  Footprints,
  TrainFront,
  Bike,
  MapPin,
  Star,
  Coffee,
  Utensils,
  Fuel,
  Clock,
  Phone,
} from 'lucide-react'

interface NearbyPlace {
  id: string
  name: string
  category: 'restaurant' | 'coffee' | 'gas'
  rating: number
  distance: string
  address: string
  icon: React.ReactNode
}

interface LocationInfo {
  name: string
  address: string
  lat: number
  lng: number
}

const NEARBY_PLACES: NearbyPlace[] = [
  { id: '1', name: 'The Harbor Kitchen', category: 'restaurant', rating: 4.7, distance: '0.2 mi', address: '142 Harbor Blvd', icon: <Utensils size={14} /> },
  { id: '2', name: 'Blue Bottle Coffee', category: 'coffee', rating: 4.8, distance: '0.1 mi', address: '56 Main St', icon: <Coffee size={14} /> },
  { id: '3', name: 'Shell Station', category: 'gas', rating: 4.2, distance: '0.5 mi', address: '890 Pacific Ave', icon: <Fuel size={14} /> },
  { id: '4', name: 'Sakura Sushi', category: 'restaurant', rating: 4.5, distance: '0.3 mi', address: '221 Elm St', icon: <Utensils size={14} /> },
  { id: '5', name: 'Starbucks Reserve', category: 'coffee', rating: 4.6, distance: '0.4 mi', address: '78 Market St', icon: <Coffee size={14} /> },
  { id: '6', name: 'Chevron', category: 'gas', rating: 3.9, distance: '0.7 mi', address: '456 Oak Ave', icon: <Fuel size={14} /> },
]

const SELECTED_LOCATION: LocationInfo = {
  name: 'Apple Park',
  address: 'One Apple Park Way, Cupertino, CA 95014',
  lat: 37.3349,
  lng: -122.0090,
}

type TransportMode = 'car' | 'walk' | 'transit' | 'bike'

const MAP_LOCATIONS = [
  { name: 'Apple Park', lat: 37.3349, lng: -122.0090 },
  { name: 'Golden Gate Bridge', lat: 37.8199, lng: -122.4783 },
  { name: 'Fisherman\'s Wharf', lat: 37.8080, lng: -122.4177 },
  { name: 'Stanford University', lat: 37.4275, lng: -122.1697 },
  { name: 'San Jose Downtown', lat: 37.3382, lng: -121.8863 },
]

export default function Maps() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomLevel, setZoomLevel] = useState(12)
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null)
  const [transportMode, setTransportMode] = useState<TransportMode>('car')
  const [showDirections, setShowDirections] = useState(false)
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState(SELECTED_LOCATION.name)
  const [activeTab, setActiveTab] = useState<'details' | 'nearby' | 'directions'>('details')

  const filteredPlaces = useMemo(() => {
    if (!searchQuery) return NEARBY_PLACES
    return NEARBY_PLACES.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleZoomIn = () => setZoomLevel(z => Math.min(z + 1, 18))
  const handleZoomOut = () => setZoomLevel(z => Math.max(z - 1, 1))

  // Scale bar text based on zoom level
  const scaleText = useMemo(() => {
    if (zoomLevel >= 16) return '100 m'
    if (zoomLevel >= 14) return '500 m'
    if (zoomLevel >= 12) return '1 km'
    if (zoomLevel >= 10) return '5 km'
    return '10 km'
  }, [zoomLevel])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header / Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-[#f8f8f8] shrink-0">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
          title="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
        </button>

        {/* Search bar */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Maps"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow"
          />
        </div>

        {/* Directions button */}
        <button
          onClick={() => {
            setShowDirections(!showDirections)
            if (!showDirections) setActiveTab('directions')
          }}
          className={`p-1.5 rounded transition-colors ${showDirections ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
          title="Directions"
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-[280px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
            {/* Sidebar tabs */}
            <div className="flex border-b border-gray-200 shrink-0">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                  activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('nearby')}
                className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                  activeTab === 'nearby' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Nearby
              </button>
              <button
                onClick={() => setActiveTab('directions')}
                className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                  activeTab === 'directions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Directions
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-gray-900">{SELECTED_LOCATION.name}</h3>
                      <p className="text-[12px] text-gray-500 mt-0.5">{SELECTED_LOCATION.address}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <MapPin size={12} className="text-gray-400" />
                      <span>{SELECTED_LOCATION.lat.toFixed(4)}° N, {Math.abs(SELECTED_LOCATION.lng).toFixed(4)}° W</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Clock size={12} className="text-gray-400" />
                      <span>Open now · Closes 6:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Phone size={12} className="text-gray-400" />
                      <span>(408) 996-1010</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActiveTab('directions'); setShowDirections(true) }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Navigation size={12} />
                      Directions
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <Star size={12} />
                      Favorite
                    </button>
                  </div>

                  {/* Quick search suggestions */}
                  <div className="mt-5">
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Search Suggestions</h4>
                    <div className="space-y-1">
                      {MAP_LOCATIONS.map(loc => (
                        <button
                          key={loc.name}
                          className="w-full text-left px-2 py-1.5 text-[12px] text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{loc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Nearby Tab */}
              {activeTab === 'nearby' && (
                <div className="p-4">
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Nearby Places</h4>

                  {/* Category filters */}
                  <div className="flex gap-1.5 mb-3">
                    {(['all', 'restaurant', 'coffee', 'gas'] as const).map(cat => (
                      <button
                        key={cat}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        {cat === 'all' ? 'All' : cat === 'coffee' ? 'Coffee' : cat === 'restaurant' ? 'Food' : 'Gas'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {filteredPlaces.map(place => (
                      <button
                        key={place.id}
                        onClick={() => setSelectedPlace(selectedPlace?.id === place.id ? null : place)}
                        className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                          selectedPlace?.id === place.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            place.category === 'restaurant' ? 'bg-orange-100 text-orange-600' :
                            place.category === 'coffee' ? 'bg-amber-100 text-amber-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {place.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-gray-900 truncate">{place.name}</div>
                            <div className="text-[11px] text-gray-500">{place.address}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-0.5">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className="text-[11px] text-gray-600">{place.rating}</span>
                              </div>
                              <span className="text-[11px] text-gray-400">·</span>
                              <span className="text-[11px] text-gray-500">{place.distance}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Directions Tab */}
              {activeTab === 'directions' && (
                <div className="p-4">
                  {/* Transport mode */}
                  <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
                    {([
                      { mode: 'car' as TransportMode, icon: <Car size={16} />, label: 'Drive' },
                      { mode: 'walk' as TransportMode, icon: <Footprints size={16} />, label: 'Walk' },
                      { mode: 'transit' as TransportMode, icon: <TrainFront size={16} />, label: 'Transit' },
                      { mode: 'bike' as TransportMode, icon: <Bike size={16} />, label: 'Bike' },
                    ]).map(({ mode, icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setTransportMode(mode)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
                          transportMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title={label}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* From / To inputs */}
                  <div className="space-y-2 mb-4">
                    <div className="relative">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                      <input
                        type="text"
                        placeholder="Start location"
                        value={fromLocation}
                        onChange={e => setFromLocation(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-[12px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-shadow"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                      <input
                        type="text"
                        placeholder="Destination"
                        value={toLocation}
                        onChange={e => setToLocation(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-[12px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-shadow"
                      />
                    </div>
                  </div>

                  {/* Route result */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-semibold text-gray-900">
                        {transportMode === 'car' ? '12 min' : transportMode === 'walk' ? '1 hr 42 min' : transportMode === 'transit' ? '35 min' : '48 min'}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        {transportMode === 'car' ? '4.2 mi' : transportMode === 'walk' ? '3.8 mi' : transportMode === 'transit' ? '5.1 mi' : '3.9 mi'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">Via I-280 S · Fastest route</p>
                  </div>

                  {/* Step by step */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Steps</h4>
                    <div className="space-y-0">
                      {[
                        { text: 'Head south on Apple Park Way', dist: '0.3 mi' },
                        { text: 'Turn right onto I-280 S', dist: '3.5 mi' },
                        { text: 'Take exit toward De Anza Blvd', dist: '0.2 mi' },
                        { text: 'Arrive at destination', dist: '' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-[12px] text-gray-700">{step.text}</p>
                            {step.dist && <p className="text-[11px] text-gray-400">{step.dist}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* CSS Map Visualization */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 120% 80% at 30% 40%, #b8d8b8 0%, transparent 50%),
              radial-gradient(ellipse 100% 70% at 70% 60%, #a8d0a8 0%, transparent 45%),
              radial-gradient(ellipse 80% 60% at 20% 70%, #8ec5e8 0%, transparent 50%),
              radial-gradient(ellipse 90% 50% at 80% 30%, #8ec5e8 0%, transparent 40%),
              radial-gradient(ellipse 60% 40% at 50% 50%, #c9dcc9 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 60% 75%, #d5c9b8 0%, transparent 50%),
              linear-gradient(180deg, #d6e8d6 0%, #c4dbc4 30%, #b0cfb0 60%, #a0c5a0 100%)
            `,
          }}>
            {/* SVG Roads and Features */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              {/* Urban areas */}
              <rect x="320" y="200" width="160" height="200" fill="#d4d0c8" opacity="0.35" rx="4" />
              <rect x="500" y="100" width="120" height="150" fill="#d4d0c8" opacity="0.25" rx="4" />
              <rect x="150" y="350" width="100" height="120" fill="#d4d0c8" opacity="0.2" rx="4" />

              {/* Water bodies */}
              <ellipse cx="180" cy="420" rx="80" ry="45" fill="#7eb8d8" opacity="0.5" />
              <ellipse cx="650" cy="180" rx="50" ry="35" fill="#7eb8d8" opacity="0.4" />
              <path d="M 600 380 Q 650 350 720 370 Q 750 380 760 410 Q 740 440 700 430 Q 660 420 620 430 Q 590 420 600 380Z" fill="#7eb8d8" opacity="0.45" />

              {/* Park areas */}
              <ellipse cx="400" cy="130" rx="70" ry="40" fill="#8bc48b" opacity="0.4" />
              <ellipse cx="550" cy="450" rx="55" ry="35" fill="#8bc48b" opacity="0.35" />

              {/* Major roads */}
              <line x1="0" y1="300" x2="800" y2="300" stroke="white" strokeWidth="3" opacity="0.7" />
              <line x1="400" y1="0" x2="400" y2="600" stroke="white" strokeWidth="3" opacity="0.7" />
              <line x1="0" y1="200" x2="800" y2="200" stroke="white" strokeWidth="2" opacity="0.5" />
              <line x1="0" y1="450" x2="800" y2="450" stroke="white" strokeWidth="2" opacity="0.5" />
              <line x1="200" y1="0" x2="200" y2="600" stroke="white" strokeWidth="2" opacity="0.5" />
              <line x1="600" y1="0" x2="600" y2="600" stroke="white" strokeWidth="2" opacity="0.5" />

              {/* Minor roads */}
              <line x1="0" y1="100" x2="800" y2="100" stroke="white" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="150" x2="800" y2="150" stroke="white" strokeWidth="1" opacity="0.25" />
              <line x1="0" y1="250" x2="800" y2="250" stroke="white" strokeWidth="1" opacity="0.25" />
              <line x1="0" y1="350" x2="800" y2="350" stroke="white" strokeWidth="1" opacity="0.25" />
              <line x1="0" y1="500" x2="800" y2="500" stroke="white" strokeWidth="1" opacity="0.25" />
              <line x1="300" y1="0" x2="300" y2="600" stroke="white" strokeWidth="1" opacity="0.25" />
              <line x1="500" y1="0" x2="500" y2="600" stroke="white" strokeWidth="1" opacity="0.25" />
              <line x1="700" y1="0" x2="700" y2="600" stroke="white" strokeWidth="1" opacity="0.25" />
              <line x1="100" y1="0" x2="100" y2="600" stroke="white" strokeWidth="1" opacity="0.25" />

              {/* Diagonal highway */}
              <line x1="0" y1="550" x2="800" y2="50" stroke="#e8e8e8" strokeWidth="4" opacity="0.6" />
              <line x1="0" y1="550" x2="800" y2="50" stroke="white" strokeWidth="2" opacity="0.4" strokeDasharray="8,6" />

              {/* Curved road */}
              <path d="M 100 0 Q 250 300 400 300 Q 550 300 700 600" fill="none" stroke="white" strokeWidth="2" opacity="0.45" />

              {/* Road labels */}
              <text x="405" y="295" fontSize="9" fill="#555" opacity="0.6" fontWeight="500">I-280</text>
              <text x="605" y="195" fontSize="8" fill="#555" opacity="0.5">Elm St</text>
              <text x="205" y="445" fontSize="8" fill="#555" opacity="0.5">Oak Ave</text>

              {/* Water labels */}
              <text x="160" y="425" fontSize="8" fill="#4a8aaa" opacity="0.6" fontStyle="italic">Crystal Lake</text>

              {/* Park labels */}
              <text x="370" y="135" fontSize="8" fill="#3a7a3a" opacity="0.6" fontStyle="italic">Central Park</text>

              {/* Pin marker */}
              <g transform="translate(400, 280)">
                {/* Pin shadow */}
                <ellipse cx="0" cy="18" rx="8" ry="3" fill="rgba(0,0,0,0.15)" />
                {/* Pin body */}
                <path d="M 0 -24 C -13 -24 -18 -14 -18 -8 C -18 4 0 18 0 18 C 0 18 18 4 18 -8 C 18 -14 13 -24 0 -24 Z" fill="#FF3B30" stroke="#CC2D25" strokeWidth="1" />
                {/* Pin inner circle */}
                <circle cx="0" cy="-10" r="6" fill="white" opacity="0.95" />
                {/* Pin dot */}
                <circle cx="0" cy="-10" r="3" fill="#FF3B30" />
              </g>
            </svg>

            {/* Grid overlay for map tiles effect */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)
              `,
              backgroundSize: `${80 / (zoomLevel / 12)}px ${80 / (zoomLevel / 12)}px`,
            }} />
          </div>

          {/* Compass icon - top right */}
          <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center border border-gray-200">
            <Compass size={18} className="text-gray-600" style={{ transform: 'rotate(15deg)' }} />
          </div>

          {/* Location info popup (near pin) */}
          <div className="absolute top-[38%] left-[55%] -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 min-w-[180px]">
            <div className="text-[12px] font-semibold text-gray-900">{SELECTED_LOCATION.name}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{SELECTED_LOCATION.address}</div>
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] text-gray-500">4.8 · Visitor Center</span>
            </div>
          </div>

          {/* Zoom controls - bottom right */}
          <div className="absolute bottom-12 right-3 flex flex-col bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
              title="Zoom In"
            >
              <Plus size={16} className="text-gray-700" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 transition-colors"
              title="Zoom Out"
            >
              <Minus size={16} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 bg-[#f8f8f8] shrink-0">
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {SELECTED_LOCATION.lat.toFixed(4)}° N, {Math.abs(SELECTED_LOCATION.lng).toFixed(4)}° W
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-[2px] bg-gray-400 rounded-full" />
            <span>{scaleText}</span>
          </div>
          <span>Zoom: {zoomLevel}</span>
        </div>
      </div>
    </div>
  )
}
