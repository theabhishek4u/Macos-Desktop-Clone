'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  getDate,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Calendar } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  date: string; // ISO date string yyyy-MM-dd
  title: string;
  time: string; // e.g. "9:00 AM"
  hour: number; // 0-23 for sorting
  color: EventColor;
}

type EventColor = 'red' | 'blue' | 'green' | 'orange' | 'purple';

const EVENT_COLORS: { value: EventColor; label: string; dot: string; bg: string }[] = [
  { value: 'red', label: 'Red', dot: 'bg-red-500', bg: 'bg-red-50 border-red-200' },
  { value: 'blue', label: 'Blue', dot: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200' },
  { value: 'green', label: 'Green', dot: 'bg-green-500', bg: 'bg-green-50 border-green-200' },
  { value: 'orange', label: 'Orange', dot: 'bg-orange-500', bg: 'bg-orange-50 border-orange-200' },
  { value: 'purple', label: 'Purple', dot: 'bg-purple-500', bg: 'bg-purple-50 border-purple-200' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const period = i >= 12 ? 'PM' : 'AM';
  const h = i === 0 ? 12 : i > 12 ? i - 12 : i;
  return { value: i, label: `${h}:00 ${period}` };
});

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Sample Events ───────────────────────────────────────────────────────────

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function makeSampleEvents(): CalendarEvent[] {
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const tomorrowKey = format(addMonths(today, 0).getTime() + 86400000, 'yyyy-MM-dd');
  const yesterdayKey = format(addMonths(today, 0).getTime() - 86400000, 'yyyy-MM-dd');
  const nextWeekKey = format(today.getTime() + 7 * 86400000, 'yyyy-MM-dd');

  return [
    { id: 's1', date: todayKey, title: 'Team Standup', time: '9:00 AM', hour: 9, color: 'blue' },
    { id: 's2', date: todayKey, title: 'Lunch with Alex', time: '12:00 PM', hour: 12, color: 'green' },
    { id: 's3', date: todayKey, title: 'Design Review', time: '3:00 PM', hour: 15, color: 'purple' },
    { id: 's4', date: tomorrowKey, title: 'Sprint Planning', time: '10:00 AM', hour: 10, color: 'orange' },
    { id: 's5', date: tomorrowKey, title: 'Coffee Chat', time: '2:00 PM', hour: 14, color: 'red' },
    { id: 's6', date: yesterdayKey, title: 'Dentist Appointment', time: '11:00 AM', hour: 11, color: 'red' },
    { id: 's7', date: nextWeekKey, title: 'Project Deadline', time: '5:00 PM', hour: 17, color: 'orange' },
  ];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function dateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

// ─── Mini Calendar ───────────────────────────────────────────────────────────

function MiniCalendar({
  currentDate,
  selectedDate,
  onSelectDate,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const today = new Date();

  return (
    <div className="px-3 pb-2">
      <div className="grid grid-cols-7 gap-0">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] font-semibold text-gray-400 uppercase tracking-wide pb-1"
          >
            {d.charAt(0)}
          </div>
        ))}
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={`
                h-5 w-5 flex items-center justify-center text-[10px] rounded-full mx-auto transition-colors
                ${!inMonth ? 'text-gray-300' : ''}
                ${inMonth && !isToday && !isSelected ? 'text-gray-700 hover:bg-gray-100' : ''}
                ${isToday && !isSelected ? 'bg-blue-500 text-white font-semibold' : ''}
                ${isSelected && !isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                ${isSelected && isToday ? 'bg-blue-500 text-white font-semibold' : ''}
              `}
            >
              {getDate(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(makeSampleEvents);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHour, setNewHour] = useState(9);
  const [newColor, setNewColor] = useState<EventColor>('blue');

  const today = new Date();

  // ── Derived data ──
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedKey = dateKey(selectedDate);
  const selectedEvents = useMemo(
    () =>
      events
        .filter((e) => e.date === selectedKey)
        .sort((a, b) => a.hour - b.hour),
    [events, selectedKey]
  );

  // Build a map of date -> has events for showing dots on the calendar grid
  const eventDates = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const arr = map.get(ev.date) || [];
      arr.push(ev);
      map.set(ev.date, arr);
    }
    return map;
  }, [events]);

  // ── Handlers ──
  const goToPrevMonth = useCallback(() => setCurrentDate((d) => subMonths(d, 1)), []);
  const goToNextMonth = useCallback(() => setCurrentDate((d) => addMonths(d, 1)), []);
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    setIsAdding(false);
  }, []);

  const handleAddEvent = useCallback(() => {
    if (!newTitle.trim()) return;
    const hourData = HOURS.find((h) => h.value === newHour)!;
    const ev: CalendarEvent = {
      id: generateId(),
      date: dateKey(selectedDate),
      title: newTitle.trim(),
      time: hourData.label,
      hour: newHour,
      color: newColor,
    };
    setEvents((prev) => [...prev, ev]);
    setNewTitle('');
    setNewHour(9);
    setNewColor('blue');
    setIsAdding(false);
  }, [newTitle, newHour, newColor, selectedDate]);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleMiniCalSelect = useCallback((d: Date) => {
    setSelectedDate(d);
    setCurrentDate(startOfMonth(d));
    setIsAdding(false);
  }, []);

  // ── Weeks chunking for main grid ──
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // ── Color helpers ──
  const getColorDot = (color: EventColor) =>
    EVENT_COLORS.find((c) => c.value === color)?.dot ?? 'bg-blue-500';

  const getColorBg = (color: EventColor) =>
    EVENT_COLORS.find((c) => c.value === color)?.bg ?? 'bg-blue-50 border-blue-200';

  return (
    <div className="flex h-full w-full bg-white overflow-hidden select-none">
      {/* ── Sidebar ── */}
      <div className="hidden md:flex flex-col w-[200px] min-w-[200px] bg-gray-50 border-r border-gray-200">
        {/* Mini Calendar Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <span className="text-[11px] font-semibold text-gray-700">
            {format(currentDate, 'MMM yyyy')}
          </span>
        </div>

        {/* Mini Calendar */}
        <MiniCalendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={handleMiniCalSelect}
        />

        {/* Separator */}
        <div className="mx-3 border-t border-gray-200 my-1" />

        {/* Upcoming events summary */}
        <div className="px-3 pt-2 pb-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Today&apos;s Events
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {events
            .filter((e) => e.date === todayStr())
            .sort((a, b) => a.hour - b.hour)
            .map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-gray-100 transition-colors"
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getColorDot(ev.color)}`} />
                <span className="text-[10px] text-gray-700 truncate">{ev.title}</span>
                <span className="text-[9px] text-gray-400 ml-auto shrink-0">{ev.time}</span>
              </div>
            ))}
          {events.filter((e) => e.date === todayStr()).length === 0 && (
            <p className="text-[10px] text-gray-400 px-1 py-1">No events today</p>
          )}
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              className="p-1 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-sm font-semibold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>

          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Calendar + Events Split */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-100 shrink-0">
              {DAY_HEADERS.map((d, i) => (
                <div
                  key={d}
                  className={`py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide ${
                    i === 0 || i === 6 ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Date Cells */}
            <div className="flex-1 grid grid-rows-[repeat(6,1fr)]">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-b-0">
                  {week.map((day, di) => {
                    const inMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, today);
                    const isSelected = isSameDay(day, selectedDate);
                    const dayEvents = eventDates.get(dateKey(day)) || [];
                    const hasEvents = dayEvents.length > 0;

                    // Show up to 3 colored dots for events on this day
                    const eventDots = dayEvents.slice(0, 3);

                    return (
                      <button
                        key={di}
                        onClick={() => handleSelectDate(day)}
                        className={`
                          relative flex flex-col items-center justify-start pt-1.5 pb-1 transition-colors
                          ${!inMonth ? 'bg-gray-50/50' : ''}
                          ${inMonth && !isSelected ? 'hover:bg-gray-50' : ''}
                          ${isSelected && inMonth ? 'bg-blue-50/60' : ''}
                          ${isSelected && !inMonth ? 'bg-blue-50/30' : ''}
                        `}
                      >
                        {/* Date number circle */}
                        <span
                          className={`
                            h-7 w-7 flex items-center justify-center text-[12px] rounded-full transition-colors
                            ${!inMonth ? 'text-gray-300' : ''}
                            ${inMonth && !isToday && !isSelected ? 'text-gray-700' : ''}
                            ${isToday && !isSelected ? 'bg-blue-500 text-white font-semibold' : ''}
                            ${isSelected && !isToday && inMonth ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                            ${isSelected && isToday ? 'bg-blue-500 text-white font-semibold' : ''}
                            ${isSelected && !inMonth ? 'text-blue-400 font-semibold' : ''}
                          `}
                        >
                          {getDate(day)}
                        </span>

                        {/* Event dots */}
                        {hasEvents && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {eventDots.map((ev, idx) => (
                              <span
                                key={idx}
                                className={`h-1 w-1 rounded-full ${getColorDot(ev.color)}`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[7px] text-gray-400 ml-0.5">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Events Panel ── */}
          <div className="w-[220px] min-w-[220px] border-l border-gray-200 bg-white flex flex-col">
            {/* Selected Date Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0">
              <div>
                <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  {format(selectedDate, 'EEEE')}
                </div>
                <div className="text-[13px] font-semibold text-gray-800">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setNewTitle('');
                  setNewHour(9);
                  setNewColor('blue');
                }}
                className="p-1 rounded-md hover:bg-blue-50 active:bg-blue-100 text-blue-500 transition-colors"
                title="Add Event"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto">
              {/* Inline Add Form */}
              {isAdding && (
                <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Event title"
                    className="w-full text-[12px] px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEvent();
                      if (e.key === 'Escape') setIsAdding(false);
                    }}
                  />

                  {/* Time Select */}
                  <select
                    value={newHour}
                    onChange={(e) => setNewHour(Number(e.target.value))}
                    className="w-full text-[11px] px-2 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400 mb-2 bg-white"
                  >
                    {HOURS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>

                  {/* Color Picker */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setNewColor(c.value)}
                        className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                          newColor === c.value
                            ? 'ring-2 ring-offset-1 ring-gray-400 scale-110'
                            : 'hover:scale-110'
                        }`}
                        title={c.label}
                      >
                        <span className={`h-3 w-3 rounded-full ${c.dot}`} />
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddEvent}
                      disabled={!newTitle.trim()}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Event Cards */}
              {selectedEvents.length === 0 && !isAdding && (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <Calendar className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-[11px] text-gray-400">No events</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    Click + to add an event
                  </p>
                </div>
              )}

              {selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`group flex items-start gap-2 px-3 py-2 border-l-2 mx-2 my-1 rounded-r-md border ${getColorBg(ev.color)} transition-colors hover:shadow-sm`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-gray-800 truncate">
                      {ev.title}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{ev.time}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete Event"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50/50 shrink-0">
              <span className="text-[10px] text-gray-400">
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
