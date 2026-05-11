'use client';

import { useState, useMemo } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
  CloudSun,
  CloudSnow,
  CloudLightning,
  ChevronDown,
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
}

function getWeatherIcon(icon: string, size: number = 16) {
  switch (icon) {
    case 'sunny':
      return <Sun className="text-yellow-300" style={{ width: size, height: size }} />;
    case 'partly-cloudy':
      return <CloudSun className="text-yellow-200" style={{ width: size, height: size }} />;
    case 'cloudy':
      return <Cloud className="text-gray-300" style={{ width: size, height: size }} />;
    case 'rainy':
      return <CloudRain className="text-blue-300" style={{ width: size, height: size }} />;
    case 'stormy':
      return <CloudLightning className="text-yellow-200" style={{ width: size, height: size }} />;
    case 'snowy':
      return <CloudSnow className="text-blue-100" style={{ width: size, height: size }} />;
    default:
      return <Sun className="text-yellow-300" style={{ width: size, height: size }} />;
  }
}

function getEmoji(icon: string): string {
  switch (icon) {
    case 'sunny': return '☀️';
    case 'partly-cloudy': return '⛅';
    case 'cloudy': return '☁️';
    case 'rainy': return '🌧️';
    case 'stormy': return '⛈️';
    case 'snowy': return '🌨️';
    default: return '☀️';
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
      { label: 'UV Index', value: '4', icon: <Sun className="h-4 w-4" />, sublabel: 'Moderate' },
      { label: 'Wind', value: '12 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'W NW' },
      { label: 'Rainfall', value: '0"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '72%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 54°' },
      { label: 'Visibility', value: '10 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Clear' },
      { label: 'Pressure', value: '30.12', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
    ],
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
      { label: 'UV Index', value: '1', icon: <Sun className="h-4 w-4" />, sublabel: 'Low' },
      { label: 'Wind', value: '18 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'NE' },
      { label: 'Rainfall', value: '0.2"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '85%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 34°' },
      { label: 'Visibility', value: '7 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Hazy' },
      { label: 'Pressure', value: '29.85', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
    ],
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
      { label: 'UV Index', value: '2', icon: <Sun className="h-4 w-4" />, sublabel: 'Low' },
      { label: 'Wind', value: '14 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'SW' },
      { label: 'Rainfall', value: '0.8"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '91%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 45°' },
      { label: 'Visibility', value: '5 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Misty' },
      { label: 'Pressure', value: '29.72', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
    ],
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
      { label: 'UV Index', value: '5', icon: <Sun className="h-4 w-4" />, sublabel: 'Moderate' },
      { label: 'Wind', value: '8 mph', icon: <Wind className="h-4 w-4" />, sublabel: 'S' },
      { label: 'Rainfall', value: '0"', icon: <Droplets className="h-4 w-4" />, sublabel: 'in last 24h' },
      { label: 'Humidity', value: '58%', icon: <Droplets className="h-4 w-4" />, sublabel: 'The dew point is 40°' },
      { label: 'Visibility', value: '12 mi', icon: <Eye className="h-4 w-4" />, sublabel: 'Clear' },
      { label: 'Pressure', value: '30.25', icon: <Gauge className="h-4 w-4" />, sublabel: 'inHg' },
    ],
  },
];

export default function Weather() {
  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const [showCityMenu, setShowCityMenu] = useState(false);

  const weather = useMemo(
    () => CITY_DATA.find((c) => c.city === selectedCity) ?? CITY_DATA[0],
    [selectedCity]
  );

  const gradientBg = getGradient(weather.condition);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden text-white"
      style={{ background: gradientBg }}
    >
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
          <span className="text-[72px] font-thin leading-none tracking-tighter">
            {weather.currentTemp}°
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{getEmoji(weather.conditionIcon)}</span>
            <span className="text-base font-medium text-white/90">{weather.condition}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
            <span>H:{weather.high}°</span>
            <span>L:{weather.low}°</span>
          </div>
          <div className="mt-0.5 text-xs text-white/50">
            Feels like {weather.feelsLike}°
          </div>
        </div>

        {/* Hourly forecast */}
        <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/15 p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sun className="h-3.5 w-3.5 text-yellow-300" />
            <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">Hourly Forecast</span>
          </div>
          <div className="flex gap-0 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1">
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

        {/* Daily forecast */}
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
  );
}
