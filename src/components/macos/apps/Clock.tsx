'use client';

import React, { useState, useEffect, useRef } from 'react';

type Tab = 'world' | 'alarm' | 'stopwatch' | 'timer';

interface TimeZoneCity {
  name: string;
  tz: string;
  emoji: string;
}

interface AlarmItem {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  repeatDays: string[];
  firing: boolean;
}

const WORLD_CITIES: TimeZoneCity[] = [
  { name: 'New York', tz: 'America/New_York', emoji: '🗽' },
  { name: 'London', tz: 'Europe/London', emoji: '🇬🇧' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', emoji: '🗼' },
  { name: 'Sydney', tz: 'Australia/Sydney', emoji: '🇦🇺' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getRepeatLabel(days: string[]): string {
  if (days.length === 7) return 'Every Day';
  if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) return 'Weekdays';
  if (days.length === 2 && days.includes('Sat') && days.includes('Sun')) return 'Weekends';
  if (days.length === 0) return 'One Time';
  return days.join(', ');
}

function formatAlarmTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

const INITIAL_ALARMS: AlarmItem[] = [
  { id: '1', hour: 6, minute: 30, label: 'Wake Up', enabled: true, repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], firing: false },
  { id: '2', hour: 7, minute: 0, label: 'Work', enabled: true, repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], firing: false },
  { id: '3', hour: 8, minute: 30, label: 'Meeting', enabled: false, repeatDays: ['Mon', 'Wed', 'Fri'], firing: false },
  { id: '4', hour: 9, minute: 0, label: 'Exercise', enabled: true, repeatDays: ['Sat', 'Sun'], firing: false },
];

function getAnalogAngle(now: Date): { hour: number; minute: number; second: number } {
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();
  return {
    hour: (h + m / 60) * 30,
    minute: (m + s / 60) * 6,
    second: (s + ms / 1000) * 6,
  };
}

function formatDigitalTime(now: Date): string {
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function formatStopwatch(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function formatTimerDisplay(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function AnalogClock({ size = 160 }: { size?: number }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 50);
    return () => clearInterval(interval);
  }, []);

  const angles = getAnalogAngle(now);
  const center = size / 2;
  const radius = size / 2 - 8;

  const hourMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const outerR = radius;
    const innerR = radius - (i % 3 === 0 ? 12 : 6);
    return {
      x1: center + innerR * Math.cos(angle),
      y1: center + innerR * Math.sin(angle),
      x2: center + outerR * Math.cos(angle),
      y2: center + outerR * Math.sin(angle),
      thick: i % 3 === 0,
    };
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Clock face */}
        <circle cx={center} cy={center} r={radius + 4} fill="#2c2c2e" stroke="#555" strokeWidth="1.5" />
        <circle cx={center} cy={center} r={radius} fill="#1c1c1e" stroke="#444" strokeWidth="0.5" />

        {/* Hour marks */}
        {hourMarks.map((mark, i) => (
          <line
            key={i}
            x1={mark.x1}
            y1={mark.y1}
            x2={mark.x2}
            y2={mark.y2}
            stroke="#fff"
            strokeWidth={mark.thick ? 2.5 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Hour hand */}
        <line
          x1={center}
          y1={center}
          x2={center + (radius * 0.5) * Math.cos((angles.hour - 90) * (Math.PI / 180))}
          y2={center + (radius * 0.5) * Math.sin((angles.hour - 90) * (Math.PI / 180))}
          stroke="#fff"
          strokeWidth={3.5}
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={center}
          y1={center}
          x2={center + (radius * 0.72) * Math.cos((angles.minute - 90) * (Math.PI / 180))}
          y2={center + (radius * 0.72) * Math.sin((angles.minute - 90) * (Math.PI / 180))}
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Second hand */}
        <line
          x1={center - (radius * 0.15) * Math.cos((angles.second - 90) * (Math.PI / 180))}
          y1={center - (radius * 0.15) * Math.sin((angles.second - 90) * (Math.PI / 180))}
          x2={center + (radius * 0.8) * Math.cos((angles.second - 90) * (Math.PI / 180))}
          y2={center + (radius * 0.8) * Math.sin((angles.second - 90) * (Math.PI / 180))}
          stroke="#ff9500"
          strokeWidth={1.2}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={center} cy={center} r={3.5} fill="#ff9500" />
        <circle cx={center} cy={center} r={1.5} fill="#1c1c1e" />
      </svg>
      <div className="text-white text-sm font-medium tracking-wide">{formatDigitalTime(now)}</div>
    </div>
  );
}

function WorldClockTab() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-4 overflow-y-auto max-h-[calc(100%-48px)]">
      <AnalogClock size={180} />
      <div className="w-full space-y-2 mt-2">
        {WORLD_CITIES.map((city) => {
          const cityTime = new Date(now.toLocaleString('en-US', { timeZone: city.tz }));
          const timeStr = cityTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateStr = cityTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          const isNight = cityTime.getHours() < 6 || cityTime.getHours() >= 20;

          return (
            <div
              key={city.tz}
              className="flex items-center justify-between bg-[#2c2c2e] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{city.emoji}</span>
                <div>
                  <div className="text-white text-sm font-medium">{city.name}</div>
                  <div className="text-gray-400 text-xs">{dateStr}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isNight ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {isNight ? '🌙' : '☀️'}
                </span>
                <span className="text-white text-lg font-light tabular-nums">{timeStr}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlarmTab() {
  const [alarms, setAlarms] = useState<AlarmItem[]>(INITIAL_ALARMS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHour, setNewHour] = useState(7);
  const [newMinute, setNewMinute] = useState(0);
  const [newLabel, setNewLabel] = useState('');
  const [newRepeatDays, setNewRepeatDays] = useState<string[]>([]);
  const [firingAlarmId, setFiringAlarmId] = useState<string | null>(null);
  const [hoveredAlarmId, setHoveredAlarmId] = useState<string | null>(null);

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const simulateFire = (id: string) => {
    setFiringAlarmId(id);
    setTimeout(() => setFiringAlarmId(null), 2000);
  };

  const toggleRepeatDay = (day: string) => {
    setNewRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const saveAlarm = () => {
    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      hour: newHour,
      minute: newMinute,
      label: newLabel || 'Alarm',
      enabled: true,
      repeatDays: newRepeatDays,
      firing: false,
    };
    setAlarms((prev) => [...prev, newAlarm]);
    setShowAddForm(false);
    setNewHour(7);
    setNewMinute(0);
    setNewLabel('');
    setNewRepeatDays([]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with Add button */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <span className="text-white text-sm font-semibold">Alarms</span>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-orange-500 text-sm font-medium hover:text-orange-400 transition-colors"
        >
          + Add Alarm
        </button>
      </div>

      {/* Firing alarm indicator */}
      {firingAlarmId && (
        <div className="mx-4 mb-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 animate-pulse flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <span className="text-orange-400 text-sm font-medium">Alarm Ringing!</span>
          <button
            onClick={() => setFiringAlarmId(null)}
            className="ml-auto text-orange-300 text-xs hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Alarm Form */}
      {showAddForm && (
        <div className="mx-4 mb-3 bg-[#2c2c2e] rounded-xl p-4 space-y-4 shrink-0">
          <div className="text-white text-sm font-medium">New Alarm</div>

          {/* Time picker */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center">
              <button
                onClick={() => setNewHour((h) => (h >= 23 ? 0 : h + 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▲
              </button>
              <div className="text-white text-4xl font-extralight tabular-nums w-16 text-center">
                {String(newHour === 0 ? 12 : newHour > 12 ? newHour - 12 : newHour).padStart(2, '0')}
              </div>
              <button
                onClick={() => setNewHour((h) => (h <= 0 ? 23 : h - 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▼
              </button>
            </div>
            <span className="text-white text-3xl font-extralight mb-1">:</span>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setNewMinute((m) => (m >= 59 ? 0 : m + 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▲
              </button>
              <div className="text-white text-4xl font-extralight tabular-nums w-16 text-center">
                {String(newMinute).padStart(2, '0')}
              </div>
              <button
                onClick={() => setNewMinute((m) => (m <= 0 ? 59 : m - 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▼
              </button>
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <button
                onClick={() => { if (newHour >= 12) setNewHour(newHour - 12); }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${newHour < 12 ? 'bg-orange-500 text-white' : 'bg-[#3a3a3c] text-gray-400'}`}
              >
                AM
              </button>
              <button
                onClick={() => { if (newHour < 12) setNewHour(newHour + 12); }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${newHour >= 12 ? 'bg-orange-500 text-white' : 'bg-[#3a3a3c] text-gray-400'}`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Label input */}
          <div>
            <label className="text-gray-400 text-xs block mb-1">Label</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Alarm"
              className="w-full bg-[#1c1c1e] text-white text-sm rounded-lg px-3 py-2 border border-[#3a3a3c] focus:border-orange-500 focus:outline-none placeholder:text-gray-500 transition-colors"
            />
          </div>

          {/* Repeat day selector */}
          <div>
            <label className="text-gray-400 text-xs block mb-2">Repeat</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleRepeatDay(day)}
                  className={`w-8 h-8 rounded-full text-[10px] font-medium transition-colors ${
                    newRepeatDays.includes(day)
                      ? 'bg-orange-500 text-white'
                      : 'bg-[#3a3a3c] text-gray-400 hover:bg-[#4a4a4c]'
                  }`}
                  title={DAY_FULL[i]}
                >
                  {day.charAt(0)}
                </button>
              ))}
            </div>
            <div className="text-gray-500 text-xs mt-1.5">
              {getRepeatLabel(newRepeatDays)}
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewHour(7);
                setNewMinute(0);
                setNewLabel('');
                setNewRepeatDays([]);
              }}
              className="flex-1 py-2 rounded-lg bg-[#3a3a3c] text-gray-300 text-sm font-medium hover:bg-[#4a4a4c] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveAlarm}
              className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Alarm list */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
        {alarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="text-3xl mb-2">⏰</span>
            <span className="text-sm">No alarms set</span>
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`relative bg-[#2c2c2e] rounded-xl px-4 py-3 transition-all duration-200 ${
                alarm.enabled ? '' : 'opacity-50'
              } ${firingAlarmId === alarm.id ? 'ring-2 ring-orange-500 bg-orange-500/10' : ''}`}
              onMouseEnter={() => setHoveredAlarmId(alarm.id)}
              onMouseLeave={() => setHoveredAlarmId(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-extralight tabular-nums ${alarm.enabled ? 'text-white' : 'text-gray-400'}`}>
                      {formatAlarmTime(alarm.hour, alarm.minute)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${alarm.enabled ? 'text-gray-300' : 'text-gray-500'}`}>
                      {alarm.label}
                    </span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className={`text-xs ${alarm.enabled ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getRepeatLabel(alarm.repeatDays)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Delete button (visible on hover) */}
                  {hoveredAlarmId === alarm.id && (
                    <button
                      onClick={() => deleteAlarm(alarm.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Delete alarm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Fire test button */}
                  {alarm.enabled && hoveredAlarmId === alarm.id && (
                    <button
                      onClick={() => simulateFire(alarm.id)}
                      className="text-orange-400 hover:text-orange-300 transition-colors p-1"
                      title="Test alarm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  )}

                  {/* Toggle switch */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAlarm(alarm.id); }}
                    className="relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: alarm.enabled ? '#ff9500' : '#555',
                      padding: '2px',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{
                        transform: alarm.enabled ? 'translateX(20px)' : 'translateX(0px)',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StopwatchTab() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = () => {
    startTimeRef.current = Date.now() - elapsed;
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (running) {
      setLaps((prev) => [elapsed, ...prev]);
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4 h-full">
      {/* Time display */}
      <div className="text-white text-5xl font-extralight tabular-nums tracking-tight mt-4">
        {formatStopwatch(elapsed)}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-8 mt-2">
        <button
          onClick={running ? handleLap : handleReset}
          className="w-20 h-20 rounded-full bg-[#333] text-white text-sm font-medium flex items-center justify-center border-2 border-[#555] hover:bg-[#444] transition-colors"
        >
          {running ? 'Lap' : 'Reset'}
        </button>
        <button
          onClick={running ? handleStop : handleStart}
          className={`w-20 h-20 rounded-full text-white text-sm font-medium flex items-center justify-center border-2 transition-colors ${
            running
              ? 'bg-red-600/30 border-red-500 hover:bg-red-600/50'
              : 'bg-green-600/30 border-green-500 hover:bg-green-600/50'
          }`}
        >
          {running ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="w-full max-w-xs mt-2 overflow-y-auto max-h-48">
          <div className="space-y-1">
            {laps.map((lap, i) => (
              <div key={i} className="flex justify-between text-sm px-3 py-1.5 bg-[#2c2c2e] rounded-lg">
                <span className="text-gray-400">Lap {laps.length - i}</span>
                <span className="text-white tabular-nums">{formatStopwatch(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimerTab() {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const handleStart = () => {
    if (!started) {
      const total = minutes * 60 + seconds;
      if (total <= 0) return;
      setTotalSeconds(total);
      setRemaining(total);
      endTimeRef.current = Date.now() + total * 1000;
      setStarted(true);
      setRunning(true);
    } else {
      // Resume
      endTimeRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };

  const handlePause = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    setStarted(false);
    setRemaining(0);
    setTotalSeconds(0);
    setMinutes(5);
    setSeconds(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const rem = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setRemaining(rem);
        if (rem <= 0) {
          setRunning(false);
          setStarted(false);
        }
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const progress = started && totalSeconds > 0 ? remaining / totalSeconds : 1;
  const circumference = 2 * Math.PI * 90;
  const displayTime = started ? formatTimerDisplay(remaining) : formatTimerDisplay(minutes * 60 + seconds);

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4 h-full">
      {!started ? (
        <>
          {/* Time picker */}
          <div className="flex items-center gap-2 mt-6">
            <div className="flex flex-col items-center">
              <button
                onClick={() => setMinutes((m) => Math.min(99, m + 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▲
              </button>
              <div className="text-white text-5xl font-extralight tabular-nums w-20 text-center">
                {String(minutes).padStart(2, '0')}
              </div>
              <button
                onClick={() => setMinutes((m) => Math.max(0, m - 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▼
              </button>
              <span className="text-gray-500 text-xs mt-1">min</span>
            </div>
            <span className="text-white text-4xl font-extralight mb-5">:</span>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setSeconds((s) => Math.min(59, s + 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▲
              </button>
              <div className="text-white text-5xl font-extralight tabular-nums w-20 text-center">
                {String(seconds).padStart(2, '0')}
              </div>
              <button
                onClick={() => setSeconds((s) => Math.max(0, s - 1))}
                className="text-gray-400 hover:text-white text-lg px-3 py-1 transition-colors"
              >
                ▼
              </button>
              <span className="text-gray-500 text-xs mt-1">sec</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 mt-4">
            {[1, 3, 5, 10, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => { setMinutes(m); setSeconds(0); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  minutes === m && seconds === 0
                    ? 'bg-orange-500 text-white'
                    : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Circular progress */}
          <div className="relative mt-6">
            <svg width={200} height={200} viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#333" strokeWidth="4" />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#ff9500"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 100 100)"
                className="transition-all duration-200"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-4xl font-extralight tabular-nums">{displayTime}</span>
            </div>
          </div>
        </>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-8 mt-4">
        <button
          onClick={handleReset}
          className="w-16 h-16 rounded-full bg-[#333] text-white text-xs font-medium flex items-center justify-center border-2 border-[#555] hover:bg-[#444] transition-colors"
        >
          Reset
        </button>
        <button
          onClick={running ? handlePause : handleStart}
          className={`w-16 h-16 rounded-full text-white text-xs font-medium flex items-center justify-center border-2 transition-colors ${
            running
              ? 'bg-orange-600/30 border-orange-500 hover:bg-orange-600/50'
              : 'bg-green-600/30 border-green-500 hover:bg-green-600/50'
          }`}
        >
          {running ? 'Pause' : started ? 'Resume' : 'Start'}
        </button>
      </div>
    </div>
  );
}

export default function Clock() {
  const [activeTab, setActiveTab] = useState<Tab>('world');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'world', label: 'World Clock', icon: '🌍' },
    { id: 'alarm', label: 'Alarm', icon: '⏰' },
    { id: 'stopwatch', label: 'Stopwatch', icon: '⏱' },
    { id: 'timer', label: 'Timer', icon: '⏲' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#1c1c1e] rounded-xl overflow-hidden select-none">
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'world' && <WorldClockTab />}
        {activeTab === 'alarm' && <AlarmTab />}
        {activeTab === 'stopwatch' && <StopwatchTab />}
        {activeTab === 'timer' && <TimerTab />}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center justify-around bg-[#2c2c2e]/90 border-t border-[#3a3a3c] px-2 py-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              activeTab === tab.id ? 'text-orange-500' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
