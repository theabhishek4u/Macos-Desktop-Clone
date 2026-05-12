'use client';

import { useState, useMemo } from 'react';
import {
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
  CloudSnow,
  CloudLightning,
  ChevronDown,
  MapPin,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  Volume2,
} from 'lucide-react';

interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
}

interface DailyForecast {
  day: string;
  icon: string;
  high: number;
  low: number;
  condition: string;
}

interface WeatherDetail {
  label: string;
  value: string;
  icon: React.ReactNode;
  sublabel?: string;
}

interface AirQualityData {
  aqi: number;
  category: string;
  description: string;
  color: string;
  percent: number;
}

interface UVData {
  value: number;
  category: string;
  color: string;
  percent: number;
}

interface SunData {
  sunrise: string;
  sunset: string;
}

interface CityWeather {
  city: string;
  currentTemp: number;
  condition: string;
  conditionIcon: string;
  high: number;
  low: number;
  feelsLike: number;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  details: WeatherDetail[];
  airQuality: AirQualityData;
  uvIndex: UVData;
  sun: SunData;
}

// ─── CSS Animation Keyframes (injected via style tag) ──────────────────────

function WeatherAnimations() {
  return (
    <style>{`
      @keyframes weather-sun-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes weather-sun-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.08); }
      }
      @keyframes weather-raindrop-fall {
        0% { transform: translateY(-8px); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translateY(18px); opacity: 0; }
      }
      @keyframes weather-cloud-drift {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(6px); }
      }
      @keyframes weather-snowflake-fall {
        0% { transform: translateY(-6px) rotate(0deg); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translateY(16px) rotate(180deg); opacity: 0; }
      }
      @keyframes weather-lightning-flash {
        0%, 90%, 100% { opacity: 0.2; }
        92%, 96% { opacity: 1; }
        94% { opacity: 0.3; }
      }
      @keyframes weather-gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes weather-glow-pulse {
        0%, 100% { filter: drop-shadow(0 0 8px rgba(255,255,255,0.3)); }
        50% { filter: drop-shadow(0 0 16px rgba(255,255,255,0.5)); }
      }
      .weather-gradient-bg {
        background-size: 200% 200%;
        animation: weather-gradient-shift 20s ease infinite;
      }
      .weather-temp-glow {
        text-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.08);
        animation: weather-glow-pulse 4s ease-in-out infinite;
      }
    `}</style>
  );
}

// ─── Animated Weather Icons ─────────────────────────────────────────────────

function AnimatedSunIcon({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        {/* Glow */}
        <circle cx="40" cy="40" r="28" fill="rgba(251,191,36,0.15)" style={{ animation: 'weather-sun-pulse 3s ease-in-out infinite' }} />
        {/* Rays */}
        <g style={{ animation: 'weather-sun-rotate 20s linear infinite', transformOrigin: '40px 40px' }}>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const x1 = 40 + 22 * Math.cos(angle);
            const y1 = 40 + 22 * Math.sin(angle);
            const x2 = 40 + 32 * Math.cos(angle);
            const y2 = 40 + 32 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />;
          })}
        </g>
        {/* Sun body */}
        <circle cx="40" cy="40" r="16" fill="#fbbf24" />
        <circle cx="40" cy="40" r="12" fill="#f59e0b" />
      </svg>
    </div>
  );
}

function AnimatedRainIcon({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        {/* Cloud */}
        <ellipse cx="35" cy="30" rx="20" ry="12" fill="#94a3b8" opacity="0.9" />
        <ellipse cx="48" cy="28" rx="16" ry="11" fill="#94a3b8" opacity="0.9" />
        <ellipse cx="42" cy="34" rx="22" ry="10" fill="#94a3b8" opacity="0.85" />
        {/* Raindrops */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={22 + i * 12}
            y1={42}
            x2={20 + i * 12}
            y2={54}
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
            style={{ animation: `weather-raindrop-fall 1s ${i * 0.25}s ease-in infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}

function AnimatedCloudIcon({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        {/* Back cloud */}
        <g style={{ animation: 'weather-cloud-drift 6s ease-in-out infinite' }}>
          <ellipse cx="30" cy="38" rx="22" ry="14" fill="#cbd5e1" opacity="0.6" />
          <ellipse cx="44" cy="36" rx="18" ry="12" fill="#cbd5e1" opacity="0.6" />
        </g>
        {/* Front cloud */}
        <g style={{ animation: 'weather-cloud-drift 8s ease-in-out infinite reverse' }}>
          <ellipse cx="38" cy="44" rx="26" ry="14" fill="#e2e8f0" opacity="0.9" />
          <ellipse cx="52" cy="42" rx="20" ry="12" fill="#e2e8f0" opacity="0.85" />
          <ellipse cx="32" cy="40" rx="16" ry="10" fill="#e2e8f0" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

function AnimatedSnowIcon({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        {/* Cloud */}
        <ellipse cx="35" cy="28" rx="20" ry="12" fill="#cbd5e1" opacity="0.85" />
        <ellipse cx="48" cy="26" rx="16" ry="11" fill="#cbd5e1" opacity="0.85" />
        <ellipse cx="42" cy="32" rx="22" ry="10" fill="#cbd5e1" opacity="0.8" />
        {/* Snowflakes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={20 + i * 10}
            cy={44}
            r={2}
            fill="white"
            opacity="0.9"
            style={{ animation: `weather-snowflake-fall 2s ${i * 0.35}s ease-in infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}

function AnimatedStormIcon({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        {/* Dark cloud */}
        <ellipse cx="35" cy="28" rx="22" ry="13" fill="#64748b" opacity="0.95" />
        <ellipse cx="50" cy="26" rx="17" ry="12" fill="#64748b" opacity="0.9" />
        <ellipse cx="42" cy="33" rx="24" ry="11" fill="#475569" opacity="0.95" />
        {/* Lightning bolt */}
        <polygon
          points="40,36 36,48 42,46 38,60 48,44 42,46 46,36"
          fill="#fbbf24"
          style={{ animation: 'weather-lightning-flash 4s ease-in-out infinite' }}
        />
        {/* Rain */}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={20 + i * 14}
            y1={44}
            x2={18 + i * 14}
            y2={56}
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
            style={{ animation: `weather-raindrop-fall 1.2s ${i * 0.3}s ease-in infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}

function AnimatedPartlyCloudyIcon({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        {/* Sun behind */}
        <g style={{ animation: 'weather-sun-rotate 25s linear infinite', transformOrigin: '28px 28px' }}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60) * (Math.PI / 180);
            const x1 = 28 + 18 * Math.cos(angle);
            const y1 = 28 + 18 * Math.sin(angle);
            const x2 = 28 + 26 * Math.cos(angle);
            const y2 = 28 + 26 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.5" />;
          })}
        </g>
        <circle cx="28" cy="28" r="12" fill="#fbbf24" opacity="0.8" />
        {/* Cloud in front */}
        <g style={{ animation: 'weather-cloud-drift 7s ease-in-out infinite' }}>
          <ellipse cx="44" cy="44" rx="24" ry="14" fill="#e2e8f0" opacity="0.9" />
          <ellipse cx="56" cy="42" rx="16" ry="11" fill="#e2e8f0" opacity="0.85" />
          <ellipse cx="36" cy="40" rx="14" ry="10" fill="#e2e8f0" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

function getAnimatedWeatherIcon(icon: string, size: number = 48) {
  switch (icon) {
    case 'sunny':
      return <AnimatedSunIcon size={size} />;
    case 'partly-cloudy':
      return <AnimatedPartlyCloudyIcon size={size} />;
    case 'cloudy':
      return <AnimatedCloudIcon size={size} />;
    case 'rainy':
      return <AnimatedRainIcon size={size} />;
    case 'stormy':
      return <AnimatedStormIcon size={size} />;
    case 'snowy':
      return <AnimatedSnowIcon size={size} />;
    default:
      return <AnimatedSunIcon size={size} />;
  }
}

function getWeatherIcon(icon: string, size: number = 16) {
  switch (icon) {
    case 'sunny':
      return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
    case 'partly-cloudy':
      return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.9 6.6a4 4 0 1 1 2.5 4.4"/><path d="M17.6 18.2A4.5 4.5 0 1 0 16 9.5a5 5 0 1 0-7.6 4.2"/></svg>;
    case 'cloudy':
      return <Cloud className="text-gray-300" style={{ width: size, height: size }} />;
    case 'rainy':
      return <CloudRain className="text-blue-300" style={{ width: size, height: size }} />;
    case 'stormy':
      return <CloudLightning className="text-yellow-200" style={{ width: size, height: size }} />;
    case 'snowy':
      return <CloudSnow className="text-blue-100" style={{ width: size, height: size }} />;
    default:
      return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
  }
}

function getGradient(condition: string): string {
  switch (condition) {
    case 'Sunny':
      return 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)';
    case 'Partly Cloudy':
      return 'linear-gradient(180deg, #89b4f8 0%, #6cb4ee 100%)';
    case 'Cloudy':
      return 'linear-gradient(180deg, #7f8c9a 0%, #a0b0c0 100%)';
    case 'Rainy':
      return 'linear-gradient(180deg, #536976 0%, #292e49 100%)';
    case 'Thunderstorm':
      return 'linear-gradient(180deg, #373b44 0%, #4286f4 100%)';
    case 'Snowy':
      return 'linear-gradient(180deg, #e6dada 0%, #a8c0d6 100%)';
    default:
      return 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)';
  }
}

function getSoundLabel(condition: string): string {
  switch (condition) {
    case 'Rainy':
      return 'Rain Sounds';
    case 'Thunderstorm':
      return 'Storm Sounds';
    case 'Snowy':
      return 'Wind Sounds';
    case 'Cloudy':
      return 'Ambient Sounds';
    case 'Sunny':
      return 'Bird Sounds';
    case 'Partly Cloudy':
      return 'Breeze Sounds';
    default:
      return 'Ambient Sounds';
  }
}

const CITY_DATA: CityWeather[] = [
  {
    city: 'San Francisco',
    currentTemp: 64,
    condition: 'Partly Cloudy',
    conditionIcon: 'partly-cloudy',
    high: 68,
    low: 54,
    feelsLike: 61,
    hourly: [
      { time: 'Now', temp: 64, icon: 'partly-cloudy' },
      { time: '1PM', temp: 65, icon: 'partly-cloudy' },
      { time: '2PM', temp: 66, icon: 'sunny' },
      { time: '3PM', temp: 67, icon: 'sunny' },
      { time: '4PM', temp: 66, icon: 'sunny' },
      { time: '5PM', temp: 64, icon: 'partly-cloudy' },
      { time: '6PM', temp: 62, icon: 'partly-cloudy' },
      { time: '7PM', temp: 60, icon: 'cloudy' },
      { time: '8PM', temp: 58, icon: 'cloudy' },
      { time: '9PM', temp: 57, icon: 'cloudy' },
      { time: '10PM', temp: 56, icon: 'cloudy' },
      { time: '11PM', temp: 55, icon: 'cloudy' },
    ],
    daily: [
      { day: 'Today', icon: 'partly-cloudy', high: 68, low: 54, condition: 'Partly Cloudy' },
      { day: 'Tue', icon: 'sunny', high: 72, low: 56, condition: 'Sunny' },
      { day: 'Wed', icon: 'sunny', high: 74, low: 58, condition: 'Sunny' },
      { day: 'Thu', icon: 'partly-cloudy', high: 70, low: 55, condition: 'Partly Cloudy' },
      { day: 'Fri', icon: 'cloudy', high: 65, low: 53, condition: 'Cloudy' },
      { day: 'Sat', icon: 'rainy', high: 60, low: 50, condition: 'Rainy' },
      { day: 'Sun', icon: 'partly-cloudy', high: 63, low: 52, condition: 'Partly Cloudy' },
    ],
    details: [
      { label: 'Wind', value: '12 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'W NW' },
      { label: 'Rainfall', value: '0"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '72%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 54°' },
      { label: 'Visibility', value: '10 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Clear' },
      { label: 'Pressure', value: '30.12', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
      { label: 'Feels Like', value: '61°', icon: <Thermometer className="h-4 w-4" />, sublabel: 'Similar to actual' },
    ],
    airQuality: {
      aqi: 42,
      category: 'Good',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      color: '#22c55e',
      percent: 28,
    },
    uvIndex: {
      value: 5,
      category: 'Moderate',
      color: '#f59e0b',
      percent: 45,
    },
    sun: {
      sunrise: '6:42 AM',
      sunset: '7:58 PM',
    },
  },
  {
    city: 'New York',
    currentTemp: 38,
    condition: 'Cloudy',
    conditionIcon: 'cloudy',
    high: 42,
    low: 31,
    feelsLike: 33,
    hourly: [
      { time: 'Now', temp: 38, icon: 'cloudy' },
      { time: '1PM', temp: 39, icon: 'cloudy' },
      { time: '2PM', temp: 40, icon: 'cloudy' },
      { time: '3PM', temp: 41, icon: 'partly-cloudy' },
      { time: '4PM', temp: 40, icon: 'cloudy' },
      { time: '5PM', temp: 38, icon: 'cloudy' },
      { time: '6PM', temp: 36, icon: 'rainy' },
      { time: '7PM', temp: 35, icon: 'rainy' },
      { time: '8PM', temp: 34, icon: 'rainy' },
      { time: '9PM', temp: 33, icon: 'cloudy' },
      { time: '10PM', temp: 32, icon: 'cloudy' },
      { time: '11PM', temp: 31, icon: 'snowy' },
    ],
    daily: [
      { day: 'Today', icon: 'cloudy', high: 42, low: 31, condition: 'Cloudy' },
      { day: 'Tue', icon: 'rainy', high: 40, low: 33, condition: 'Rainy' },
      { day: 'Wed', icon: 'snowy', high: 35, low: 28, condition: 'Snowy' },
      { day: 'Thu', icon: 'cloudy', high: 38, low: 30, condition: 'Cloudy' },
      { day: 'Fri', icon: 'partly-cloudy', high: 44, low: 34, condition: 'Partly Cloudy' },
      { day: 'Sat', icon: 'sunny', high: 48, low: 36, condition: 'Sunny' },
      { day: 'Sun', icon: 'sunny', high: 50, low: 38, condition: 'Sunny' },
    ],
    details: [
      { label: 'Wind', value: '18 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'NE' },
      { label: 'Rainfall', value: '0.2"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '85%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 34°' },
      { label: 'Visibility', value: '7 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Hazy' },
      { label: 'Pressure', value: '29.85', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
      { label: 'Feels Like', value: '33°', icon: <Thermometer className="h-4 w-4" />, sublabel: 'Colder than actual' },
    ],
    airQuality: {
      aqi: 78,
      category: 'Moderate',
      description: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive.',
      color: '#f59e0b',
      percent: 52,
    },
    uvIndex: {
      value: 1,
      category: 'Low',
      color: '#22c55e',
      percent: 9,
    },
    sun: {
      sunrise: '7:15 AM',
      sunset: '5:42 PM',
    },
  },
  {
    city: 'London',
    currentTemp: 48,
    condition: 'Rainy',
    conditionIcon: 'rainy',
    high: 51,
    low: 43,
    feelsLike: 44,
    hourly: [
      { time: 'Now', temp: 48, icon: 'rainy' },
      { time: '1PM', temp: 48, icon: 'rainy' },
      { time: '2PM', temp: 49, icon: 'rainy' },
      { time: '3PM', temp: 50, icon: 'cloudy' },
      { time: '4PM', temp: 49, icon: 'cloudy' },
      { time: '5PM', temp: 48, icon: 'rainy' },
      { time: '6PM', temp: 47, icon: 'rainy' },
      { time: '7PM', temp: 46, icon: 'rainy' },
      { time: '8PM', temp: 45, icon: 'cloudy' },
      { time: '9PM', temp: 44, icon: 'cloudy' },
      { time: '10PM', temp: 44, icon: 'cloudy' },
      { time: '11PM', temp: 43, icon: 'cloudy' },
    ],
    daily: [
      { day: 'Today', icon: 'rainy', high: 51, low: 43, condition: 'Rainy' },
      { day: 'Tue', icon: 'rainy', high: 50, low: 42, condition: 'Rainy' },
      { day: 'Wed', icon: 'cloudy', high: 52, low: 44, condition: 'Cloudy' },
      { day: 'Thu', icon: 'partly-cloudy', high: 55, low: 45, condition: 'Partly Cloudy' },
      { day: 'Fri', icon: 'rainy', high: 49, low: 41, condition: 'Rainy' },
      { day: 'Sat', icon: 'cloudy', high: 53, low: 43, condition: 'Cloudy' },
      { day: 'Sun', icon: 'partly-cloudy', high: 56, low: 46, condition: 'Partly Cloudy' },
    ],
    details: [
      { label: 'Wind', value: '14 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'SW' },
      { label: 'Rainfall', value: '0.8"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '91%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 45°' },
      { label: 'Visibility', value: '5 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Misty' },
      { label: 'Pressure', value: '29.72', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
      { label: 'Feels Like', value: '44°', icon: <Thermometer className="h-4 w-4" />, sublabel: 'Colder than actual' },
    ],
    airQuality: {
      aqi: 35,
      category: 'Good',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      color: '#22c55e',
      percent: 23,
    },
    uvIndex: {
      value: 2,
      category: 'Low',
      color: '#22c55e',
      percent: 18,
    },
    sun: {
      sunrise: '7:28 AM',
      sunset: '4:55 PM',
    },
  },
  {
    city: 'Tokyo',
    currentTemp: 55,
    condition: 'Sunny',
    conditionIcon: 'sunny',
    high: 59,
    low: 45,
    feelsLike: 53,
    hourly: [
      { time: 'Now', temp: 55, icon: 'sunny' },
      { time: '1PM', temp: 56, icon: 'sunny' },
      { time: '2PM', temp: 57, icon: 'sunny' },
      { time: '3PM', temp: 58, icon: 'sunny' },
      { time: '4PM', temp: 57, icon: 'sunny' },
      { time: '5PM', temp: 55, icon: 'partly-cloudy' },
      { time: '6PM', temp: 52, icon: 'partly-cloudy' },
      { time: '7PM', temp: 50, icon: 'partly-cloudy' },
      { time: '8PM', temp: 48, icon: 'cloudy' },
      { time: '9PM', temp: 47, icon: 'cloudy' },
      { time: '10PM', temp: 46, icon: 'cloudy' },
      { time: '11PM', temp: 45, icon: 'cloudy' },
    ],
    daily: [
      { day: 'Today', icon: 'sunny', high: 59, low: 45, condition: 'Sunny' },
      { day: 'Tue', icon: 'sunny', high: 62, low: 47, condition: 'Sunny' },
      { day: 'Wed', icon: 'partly-cloudy', high: 60, low: 46, condition: 'Partly Cloudy' },
      { day: 'Thu', icon: 'rainy', high: 54, low: 43, condition: 'Rainy' },
      { day: 'Fri', icon: 'rainy', high: 52, low: 42, condition: 'Rainy' },
      { day: 'Sat', icon: 'partly-cloudy', high: 57, low: 44, condition: 'Partly Cloudy' },
      { day: 'Sun', icon: 'sunny', high: 61, low: 46, condition: 'Sunny' },
    ],
    details: [
      { label: 'Wind', value: '8 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'S' },
      { label: 'Rainfall', value: '0"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '58%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 40°' },
      { label: 'Visibility', value: '12 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Clear' },
      { label: 'Pressure', value: '30.25', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
      { label: 'Feels Like', value: '53°', icon: <Thermometer className="h-4 w-4" />, sublabel: 'Similar to actual' },
    ],
    airQuality: {
      aqi: 62,
      category: 'Moderate',
      description: 'Air quality is acceptable. However, there may be a risk for some people who are unusually sensitive to air pollution.',
      color: '#f59e0b',
      percent: 41,
    },
    uvIndex: {
      value: 5,
      category: 'Moderate',
      color: '#f59e0b',
      percent: 45,
    },
    sun: {
      sunrise: '5:58 AM',
      sunset: '6:32 PM',
    },
  },
];

// ─── Hourly Temperature Graph SVG ──────────────────────────────────────────

function HourlyTempGraph({ hourly }: { hourly: HourlyForecast[] }) {
  const temps = hourly.map((h) => h.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = maxTemp - minTemp || 1;

  const width = hourly.length * 52;
  const height = 40;
  const padding = 6;

  const points = hourly.map((h, i) => ({
    x: padding + i * 52 + 26,
    y: padding + (1 - (h.temp - minTemp) / tempRange) * (height - padding * 2),
  }));

  // Create smooth curve using catmull-rom to bezier
  const smoothPath = points.length > 2
    ? points.reduce((path, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        const prev = points[i - 1];
        const cpx1 = prev.x + (point.x - prev.x) / 3;
        const cpx2 = point.x - (point.x - prev.x) / 3;
        return `${path} C ${cpx1} ${prev.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`;
      }, '')
    : points.length === 2
    ? `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
    : '';

  // Gradient fill path (close the curve at the bottom)
  const fillPath = smoothPath
    ? `${smoothPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : '';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full mt-1"
      style={{ height: '40px' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="tempGraphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      {fillPath && <path d={fillPath} fill="url(#tempGraphGradient)" />}
      {/* Line */}
      {smoothPath && (
        <path d={smoothPath} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {/* Dots */}
      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="2" fill="white" opacity="0.8" />
      ))}
    </svg>
  );
}

// ─── Weather Map Placeholder ─────────────────────────────────────────────────

function WeatherMapPlaceholder({ condition }: { condition: string }) {
  const cityMarkers = [
    { name: 'SF', x: 12, y: 38 },
    { name: 'NY', x: 78, y: 32 },
    { name: 'LN', x: 45, y: 25 },
    { name: 'TK', x: 85, y: 35 },
    { name: 'LA', x: 14, y: 42 },
    { name: 'CH', x: 22, y: 30 },
  ];

  const mapGradient = condition === 'Rainy'
    ? 'from-slate-600 via-blue-800 to-slate-700'
    : condition === 'Cloudy'
    ? 'from-gray-500 via-gray-600 to-gray-500'
    : condition === 'Snowy'
    ? 'from-blue-200 via-blue-300 to-blue-200'
    : 'from-blue-400 via-cyan-500 to-blue-400';

  return (
    <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 overflow-hidden">
      <div className="flex items-center gap-1.5 p-3 pb-2">
        <MapPin className="h-3.5 w-3.5 text-white/60" />
        <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">Weather Map</span>
      </div>
      <div className={`relative mx-3 mb-3 rounded-lg overflow-hidden bg-gradient-to-br ${mapGradient}`} style={{ height: '160px' }}>
        {/* Simulated radar overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-32 h-32 rounded-full bg-green-400/40 blur-xl" style={{ top: '10%', left: '5%' }} />
          <div className="absolute w-24 h-24 rounded-full bg-yellow-400/30 blur-lg" style={{ top: '30%', left: '40%' }} />
          <div className="absolute w-20 h-20 rounded-full bg-red-400/20 blur-lg" style={{ top: '50%', left: '70%' }} />
          {condition === 'Rainy' && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-blue-500/40 blur-xl" style={{ top: '20%', left: '55%' }} />
              <div className="absolute w-16 h-16 rounded-full bg-blue-400/30 blur-md" style={{ top: '60%', left: '25%' }} />
            </>
          )}
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          {[20, 40, 60, 80].map((y) => (
            <div key={`h-${y}`} className="absolute w-full border-t border-white/30" style={{ top: `${y}%` }} />
          ))}
          {[20, 40, 60, 80].map((x) => (
            <div key={`v-${x}`} className="absolute h-full border-l border-white/30" style={{ left: `${x}%` }} />
          ))}
        </div>

        {/* City markers */}
        {cityMarkers.map((city) => (
          <div
            key={city.name}
            className="absolute flex flex-col items-center"
            style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-2 h-2 rounded-full bg-white shadow-lg shadow-white/50" />
            <span className="text-[8px] font-bold text-white/80 mt-0.5 drop-shadow-md">{city.name}</span>
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/30 rounded px-2 py-1 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-[7px] text-white/70 ml-1">Precipitation</span>
        </div>
      </div>
    </div>
  );
}

// ─── Air Quality Component ───────────────────────────────────────────────────

function AirQualitySection({ aq }: { aq: AirQualityData }) {
  return (
    <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Wind className="h-3.5 w-3.5 text-white/60" />
        <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">Air Quality</span>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-semibold">{aq.aqi}</span>
        <span className="text-sm font-medium text-white/80">{aq.category}</span>
      </div>
      {/* Colored progress bar */}
      <div className="h-1.5 rounded-full bg-white/15 mb-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${aq.percent}%`,
            background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)',
          }}
        />
      </div>
      {/* AQI scale labels */}
      <div className="flex justify-between text-[9px] text-white/40 mb-1.5">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
      </div>
      <p className="text-[11px] text-white/50 leading-relaxed">{aq.description}</p>
    </div>
  );
}

// ─── UV Index Component ──────────────────────────────────────────────────────

function UVIndexSection({ uv }: { uv: UVData }) {
  return (
    <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">UV Index</span>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-semibold">{uv.value}</span>
        <span className="text-sm font-medium text-white/80">{uv.category}</span>
      </div>
      {/* Colored UV scale bar */}
      <div className="h-1.5 rounded-full bg-white/15 mb-1.5 overflow-hidden relative">
        <div
          className="h-full rounded-full"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #22c55e, #84cc16, #f59e0b, #ef4444, #9333ea)',
          }}
        />
        {/* Indicator dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${uv.percent}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: uv.color,
          }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-white/40">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
        <span>Very High</span>
        <span>Extreme</span>
      </div>
    </div>
  );
}

// ─── Sunrise/Sunset Component ────────────────────────────────────────────────

function SunriseSunsetSection({ sun, conditionIcon }: { sun: SunData; conditionIcon: string }) {
  // Parse time strings to get hours for the arc
  const sunriseHour = 6 + 42 / 60; // ~6.7
  const sunsetHour = 19 + 58 / 60; // ~19.97
  const nowHour = 12; // Simulate midday for visualization
  const dayLength = sunsetHour - sunriseHour;
  const progress = Math.min(1, Math.max(0, (nowHour - sunriseHour) / dayLength));

  return (
    <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <SunriseIcon className="h-3.5 w-3.5 text-orange-300" />
        <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">Sunrise & Sunset</span>
      </div>

      {/* Arc visualization */}
      <div className="relative h-20 mb-2">
        <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Arc path (dashed) */}
          <path
            d="M 20 70 Q 100 -10 180 70"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          {/* Active arc (solid) */}
          <path
            d="M 20 70 Q 100 -10 180 70"
            fill="none"
            stroke="rgba(255,200,50,0.6)"
            strokeWidth="2"
            strokeDasharray={`${progress * 260} 260`}
          />
          {/* Current sun position on arc */}
          {progress > 0 && progress < 1 && (
            <>
              <circle
                cx={20 + progress * 160}
                cy={70 - Math.sin(progress * Math.PI) * 80}
                r="6"
                fill="#fbbf24"
                stroke="white"
                strokeWidth="1.5"
              />
              {/* Sun glow */}
              <circle
                cx={20 + progress * 160}
                cy={70 - Math.sin(progress * Math.PI) * 80}
                r="12"
                fill="rgba(251,191,36,0.15)"
              />
            </>
          )}
          {/* Sunrise marker */}
          <circle cx="20" cy="70" r="3" fill="#fb923c" opacity="0.8" />
          {/* Sunset marker */}
          <circle cx="180" cy="70" r="3" fill="#f97316" opacity="0.8" />
          {/* Horizon line */}
          <line x1="10" y1="70" x2="190" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
      </div>

      {/* Times */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <SunriseIcon className="h-3.5 w-3.5 text-orange-300" />
          <div>
            <div className="text-[12px] font-semibold">{sun.sunrise}</div>
            <div className="text-[9px] text-white/40">Sunrise</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <SunsetIcon className="h-3.5 w-3.5 text-orange-400" />
          <div className="text-right">
            <div className="text-[12px] font-semibold">{sun.sunset}</div>
            <div className="text-[9px] text-white/40">Sunset</div>
          </div>
        </div>
      </div>
      {/* Unused variable suppression */}
      {void conditionIcon}
    </div>
  );
}

// ─── Ambient Sound Indicator ────────────────────────────────────────────────

function AmbientSoundIndicator({ condition }: { condition: string }) {
  const [playing, setPlaying] = useState(false);
  const soundLabel = getSoundLabel(condition);

  return (
    <button
      onClick={() => setPlaying(!playing)}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${
        playing
          ? 'bg-white/25 border border-white/30'
          : 'bg-white/10 border border-white/15 hover:bg-white/15'
      }`}
    >
      <Volume2 className={`h-3 w-3 transition-colors ${playing ? 'text-white' : 'text-white/50'}`} />
      <span className={`text-[10px] font-medium transition-colors ${playing ? 'text-white/90' : 'text-white/50'}`}>
        {soundLabel}
      </span>
      {playing && (
        <div className="flex items-center gap-[2px]">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[2px] rounded-full bg-white/70"
              style={{
                height: `${4 + Math.random() * 6}px`,
                animation: `weather-sun-pulse ${0.5 + i * 0.15}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

// ─── Main Weather Component ──────────────────────────────────────────────────

export default function Weather() {
  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const [showCityMenu, setShowCityMenu] = useState(false);

  const weather = useMemo(
    () => CITY_DATA.find((c) => c.city === selectedCity) ?? CITY_DATA[0],
    [selectedCity]
  );

  const gradientBg = getGradient(weather.condition);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden text-white relative">
      <WeatherAnimations />
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 weather-gradient-bg"
        style={{ background: gradientBg }}
      />
      {/* Slow-moving gradient overlay */}
      <div
        className="absolute inset-0 opacity-20 weather-gradient-bg pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(0,0,0,0.1) 70%, rgba(255,255,255,0.05) 100%)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Content (on top of backgrounds) */}
      <div className="relative z-10 flex flex-col h-full">
        {/* City selector bar */}
        <div className="relative flex items-center justify-center px-4 pt-3 pb-2 shrink-0">
          <button
            onClick={() => setShowCityMenu(!showCityMenu)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/15 active:bg-white/25 transition-colors"
          >
            {weather.city}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCityMenu ? 'rotate-180' : ''}`} />
          </button>
          {showCityMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 rounded-xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
              {CITY_DATA.map((city) => (
                <button
                  key={city.city}
                  onClick={() => {
                    setSelectedCity(city.city);
                    setShowCityMenu(false);
                  }}
                  className={`w-full px-6 py-2 text-left text-[13px] transition-colors ${
                    selectedCity === city.city
                      ? 'bg-white/25 font-semibold'
                      : 'hover:bg-white/15 text-white/80'
                  }`}
                >
                  {city.city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 min-h-0">
          {/* Current weather */}
          <div className="flex flex-col items-center pt-2 pb-4">
            <span className="text-[80px] font-thin leading-none tracking-tighter weather-temp-glow">
              {weather.currentTemp}°
            </span>
            <div className="flex items-center gap-2 mt-2">
              {getAnimatedWeatherIcon(weather.conditionIcon, 40)}
              <span className="text-base font-medium text-white/90">{weather.condition}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
              <span>H:{weather.high}°</span>
              <span>L:{weather.low}°</span>
            </div>
            <div className="mt-0.5 text-xs text-white/50">
              Feels like {weather.feelsLike}°
            </div>
            {/* Ambient sound indicator */}
            <div className="mt-2">
              <AmbientSoundIndicator condition={weather.condition} />
            </div>
          </div>

          {/* Hourly forecast */}
          <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">Hourly Forecast</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1">
              <div className="flex" style={{ minWidth: 'max-content' }}>
                {weather.hourly.map((hour, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center min-w-[52px] py-1.5 px-1"
                  >
                    <span className="text-[11px] text-white/60 mb-1.5">{hour.time}</span>
                    {getWeatherIcon(hour.icon, 18)}
                    <span className="text-[13px] font-medium mt-1.5">{hour.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Temperature graph line */}
            <HourlyTempGraph hourly={weather.hourly} />
          </div>

          {/* 7-Day forecast */}
          <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Cloud className="h-3.5 w-3.5 text-white/60" />
              <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">7-Day Forecast</span>
            </div>
            <div className="space-y-0">
              {weather.daily.map((day, i) => {
                const range = weather.daily.reduce(
                  (acc, d) => ({
                    min: Math.min(acc.min, d.low),
                    max: Math.max(acc.max, d.high),
                  }),
                  { min: 200, max: -200 }
                );
                const rangeSpan = range.max - range.min;
                const lowPct = ((day.low - range.min) / rangeSpan) * 100;
                const highPct = ((day.high - range.min) / rangeSpan) * 100;

                return (
                  <div
                    key={i}
                    className="flex items-center py-1.5 border-b border-white/10 last:border-0"
                  >
                    <span className="w-12 text-[12px] text-white/80 shrink-0">{day.day}</span>
                    <span className="w-6 shrink-0 flex justify-center">
                      {getWeatherIcon(day.icon, 16)}
                    </span>
                    <span className="w-12 text-[11px] text-white/40 text-right shrink-0">{day.low}°</span>
                    <div className="flex-1 mx-2 h-1 rounded-full bg-white/15 relative">
                      <div
                        className="absolute top-0 h-full rounded-full"
                        style={{
                          left: `${lowPct}%`,
                          right: `${100 - highPct}%`,
                          background: 'linear-gradient(90deg, #5bc0f8, #f8e75b)',
                        }}
                      />
                    </div>
                    <span className="w-12 text-[12px] text-white/90 shrink-0">{day.high}°</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weather Map */}
          <div className="mb-3">
            <WeatherMapPlaceholder condition={weather.condition} />
          </div>

          {/* Air Quality & UV Index row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <AirQualitySection aq={weather.airQuality} />
            <UVIndexSection uv={weather.uvIndex} />
          </div>

          {/* Sunrise/Sunset */}
          <div className="mb-3">
            <SunriseSunsetSection sun={weather.sun} conditionIcon={weather.conditionIcon} />
          </div>

          {/* Weather details grid */}
          <div className="grid grid-cols-2 gap-3">
            {weather.details.map((detail, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 p-3 flex flex-col"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {detail.icon}
                  <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
                    {detail.label}
                  </span>
                </div>
                <span className="text-xl font-semibold">{detail.value}</span>
                {detail.sublabel && (
                  <span className="text-[11px] text-white/50 mt-0.5">{detail.sublabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
