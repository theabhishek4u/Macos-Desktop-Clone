'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  addWeeks,
  subWeeks,
  getDate,
  getDay,
  getHours,
  getMinutes,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, GripVertical } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type CalendarCategory = 'work' | 'personal' | 'family' | 'health';

interface CalendarCategoryConfig {
  id: CalendarCategory;
  label: string;
  dot: string;
  bg: string;
  border: string;
  eventBg: string;
}

const CALENDAR_CATEGORIES: CalendarCategoryConfig[] = [
  { id: 'work', label: 'Work', dot: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-300', eventBg: 'bg-blue-100 border-blue-300' },
  { id: 'personal', label: 'Personal', dot: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-300', eventBg: 'bg-green-100 border-green-300' },
  { id: 'family', label: 'Family', dot: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-300', eventBg: 'bg-orange-100 border-orange-300' },
  { id: 'health', label: 'Health', dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-300', eventBg: 'bg-red-100 border-red-300' },
];

interface CalendarEvent {
  id: string;
  date: string; // ISO date string yyyy-MM-dd
  title: string;
  time: string; // e.g. "9:00 AM"
  hour: number; // 0-23 for sorting
  duration: number; // hours
  category: CalendarCategory;
}

type ViewMode = 'month' | 'week';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const period = i >= 12 ? 'PM' : 'AM';
  const h = i === 0 ? 12 : i > 12 ? i - 12 : i;
  return { value: i, label: `${h}:00 ${period}` };
});

const WEEKDAY_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8AM to 8PM
const HOUR_HEIGHT = 40; // px per hour row

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function getCategoryConfig(cat: CalendarCategory): CalendarCategoryConfig {
  return CALENDAR_CATEGORIES.find((c) => c.id === cat) || CALENDAR_CATEGORIES[0];
}

function makeSampleEvents(): CalendarEvent[] {
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const tomorrowKey = format(today.getTime() + 86400000, 'yyyy-MM-dd');
  const yesterdayKey = format(today.getTime() - 86400000, 'yyyy-MM-dd');
  const nextWeekKey = format(today.getTime() + 7 * 86400000, 'yyyy-MM-dd');
  const dayAfterKey = format(today.getTime() + 2 * 86400000, 'yyyy-MM-dd');

  return [
    { id: 's1', date: todayKey, title: 'Team Standup', time: '9:00 AM', hour: 9, duration: 1, category: 'work' },
    { id: 's2', date: todayKey, title: 'Lunch with Alex', time: '12:00 PM', hour: 12, duration: 1, category: 'personal' },
    { id: 's3', date: todayKey, title: 'Design Review', time: '3:00 PM', hour: 15, duration: 2, category: 'work' },
    { id: 's4', date: tomorrowKey, title: 'Sprint Planning', time: '10:00 AM', hour: 10, duration: 1, category: 'work' },
    { id: 's5', date: tomorrowKey, title: 'Coffee Chat', time: '2:00 PM', hour: 14, duration: 1, category: 'personal' },
    { id: 's6', date: yesterdayKey, title: 'Dentist Appointment', time: '11:00 AM', hour: 11, duration: 1, category: 'health' },
    { id: 's7', date: nextWeekKey, title: 'Project Deadline', time: '5:00 PM', hour: 17, duration: 1, category: 'work' },
    { id: 's8', date: dayAfterKey, title: 'Family Dinner', time: '6:00 PM', hour: 18, duration: 2, category: 'family' },
    { id: 's9', date: todayKey, title: 'Gym Session', time: '7:00 AM', hour: 7, duration: 1, category: 'health' },
    { id: 's10', date: nextWeekKey, title: 'Yoga Class', time: '8:00 AM', hour: 8, duration: 1, category: 'health' },
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
  eventDates,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  eventDates: Map<string, CalendarEvent[]>;
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
          const dayEvents = eventDates.get(dateKey(day)) || [];
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={`
                h-5 w-5 flex items-center justify-center text-[10px] rounded-full mx-auto transition-colors relative
                ${!inMonth ? 'text-gray-300' : ''}
                ${inMonth && !isToday && !isSelected ? 'text-gray-700 hover:bg-gray-100' : ''}
                ${isToday && !isSelected ? 'bg-blue-500 text-white font-semibold' : ''}
                ${isSelected && !isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                ${isSelected && isToday ? 'bg-blue-500 text-white font-semibold' : ''}
              `}
            >
              {getDate(day)}
              {hasEvents && !isSelected && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Year View Mini ──────────────────────────────────────────────────────────

function YearViewMini({
  year,
  eventDates,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  eventDates: Map<string, CalendarEvent[]>;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  return (
    <div className="grid grid-cols-3 gap-2 px-3 pb-2">
      {months.map((month, mi) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calStart = startOfWeek(monthStart);
        const calEnd = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: calStart, end: calEnd });
        const today = new Date();

        return (
          <div key={mi} className="text-center">
            <div className="text-[8px] font-semibold text-gray-500 mb-0.5">
              {format(month, 'MMM')}
            </div>
            <div className="grid grid-cols-7 gap-0">
              {days.map((day, di) => {
                const inMonth = isSameMonth(day, month);
                const isToday = isSameDay(day, today);
                const isSelected = isSameDay(day, selectedDate);
                const dayEvents = eventDates.get(dateKey(day)) || [];
                const hasEvents = dayEvents.length > 0;

                return (
                  <button
                    key={di}
                    onClick={() => onSelectDate(day)}
                    className={`
                      h-2.5 w-2.5 flex items-center justify-center text-[5px] rounded-sm mx-auto transition-colors
                      ${!inMonth ? 'text-transparent' : ''}
                      ${inMonth && !isToday && !isSelected && hasEvents ? 'bg-blue-200 text-blue-600' : ''}
                      ${inMonth && !isToday && !isSelected && !hasEvents ? 'text-gray-400 hover:bg-gray-100' : ''}
                      ${isToday && !isSelected ? 'bg-blue-500 text-white' : ''}
                      ${isSelected ? 'bg-blue-400 text-white' : ''}
                    `}
                    title={inMonth ? format(day, 'MMM d') : ''}
                  >
                    {inMonth ? getDate(day) : ''}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Week View ───────────────────────────────────────────────────────────────

function WeekView({
  selectedDate,
  events,
  filteredEvents,
  onAddEvent,
  onUpdateEvent,
  categoryFilter,
}: {
  selectedDate: Date;
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  onAddEvent: (date: string, hour: number, duration: number) => void;
  onUpdateEvent: (id: string, title: string) => void;
  categoryFilter: Set<CalendarCategory>;
}) {
  const weekStart = startOfWeek(selectedDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: addWeeks(weekStart, 1) - 1 as any }).slice(0, 7);
  // Recompute using startOfWeek + 6 days
  const weekDaysArray = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date();
  const nowHour = getHours(today);
  const nowMinute = getMinutes(today);
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startHour: number;
    endHour: number;
    dayIndex: number;
  } | null>(null);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Build event map for week view
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of filteredEvents) {
      const arr = map.get(ev.date) || [];
      arr.push(ev);
      map.set(ev.date, arr);
    }
    return map;
  }, [filteredEvents]);

  // Scroll to current time on mount
  useEffect(() => {
    if (gridRef.current) {
      const scrollTo = Math.max(0, (nowHour - 8) * HOUR_HEIGHT);
      gridRef.current.scrollTop = scrollTo;
    }
  }, [nowHour]);

  // Handle drag to create
  const handleMouseDown = useCallback((dayIndex: number, hour: number, e: React.MouseEvent) => {
    e.preventDefault();
    setDragState({ isDragging: true, startHour: hour, endHour: hour, dayIndex });
  }, []);

  const handleMouseMove = useCallback((hour: number) => {
    if (dragState?.isDragging) {
      setDragState((prev) => prev ? { ...prev, endHour: hour } : null);
    }
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    if (dragState?.isDragging) {
      const { startHour, endHour, dayIndex } = dragState;
      const minHour = Math.min(startHour, endHour);
      const maxHour = Math.max(startHour, endHour) + 1;
      const day = weekDaysArray[dayIndex];
      if (day) {
        onAddEvent(dateKey(day), minHour, maxHour - minHour);
      }
      setDragState(null);
    }
  }, [dragState, weekDaysArray, onAddEvent]);

  // Handle event click to edit
  const handleEventClick = (ev: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEventId(ev.id);
    setEditTitle(ev.title);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const handleEditSave = () => {
    if (editingEventId && editTitle.trim()) {
      onUpdateEvent(editingEventId, editTitle.trim());
    }
    setEditingEventId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingEventId(null);
    setEditTitle('');
  };

  // Current time indicator position
  const currentTimeTop = ((nowHour - 8) + nowMinute / 60) * HOUR_HEIGHT;
  const isCurrentWeek = weekDaysArray.some((d) => isSameDay(d, today));

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Day headers row */}
      <div className="flex shrink-0 border-b border-gray-200 bg-white">
        <div className="w-[52px] shrink-0" />
        {weekDaysArray.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={i} className="flex-1 text-center py-1.5 border-l border-gray-100">
              <div className="text-[9px] font-semibold text-gray-400 uppercase">
                {format(day, 'EEE')}
              </div>
              <div
                className={`
                  text-[13px] font-semibold mx-auto w-7 h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-blue-500 text-white' : 'text-gray-700'}
                `}
              >
                {getDate(day)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div
        ref={gridRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (dragState?.isDragging) handleMouseUp(); }}
      >
        <div className="flex relative" style={{ height: WEEKDAY_HOURS.length * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-[52px] shrink-0">
            {WEEKDAY_HOURS.map((hour) => {
              const period = hour >= 12 ? 'PM' : 'AM';
              const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              return (
                <div
                  key={hour}
                  className="text-[9px] text-gray-400 text-right pr-2 -mt-2"
                  style={{ height: HOUR_HEIGHT }}
                >
                  {h} {period}
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {weekDaysArray.map((day, dayIndex) => {
            const dayKey = dateKey(day);
            const dayEvents = eventMap.get(dayKey) || [];

            return (
              <div
                key={dayIndex}
                className="flex-1 border-l border-gray-100 relative"
              >
                {/* Hour rows (clickable for drag-to-create) */}
                {WEEKDAY_HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-gray-50 cursor-pointer hover:bg-blue-50/30 transition-colors"
                    style={{ height: HOUR_HEIGHT }}
                    onMouseDown={(e) => handleMouseDown(dayIndex, hour, e)}
                    onMouseMove={() => handleMouseMove(hour)}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((ev) => {
                  const catConfig = getCategoryConfig(ev.category);
                  const top = (ev.hour - 8) * HOUR_HEIGHT;
                  const height = ev.duration * HOUR_HEIGHT - 2;
                  const isEditing = editingEventId === ev.id;

                  return (
                    <div
                      key={ev.id}
                      className={`absolute left-0.5 right-0.5 rounded-md border px-1 py-0.5 cursor-pointer overflow-hidden transition-shadow hover:shadow-md ${catConfig.eventBg}`}
                      style={{ top, height: Math.max(height, 18) }}
                      onClick={(e) => handleEventClick(ev, e)}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          onBlur={handleEditSave}
                          className="w-full text-[10px] bg-white/80 rounded px-0.5 outline-none border border-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="text-[10px] font-semibold text-gray-800 truncate leading-tight">
                            {ev.title}
                          </div>
                          {ev.duration > 1 && (
                            <div className="text-[8px] text-gray-500 mt-0.5">
                              {ev.time} · {ev.duration}h
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Drag preview */}
                {dragState?.isDragging && dragState.dayIndex === dayIndex && (
                  <div
                    className="absolute left-0.5 right-0.5 bg-blue-200/50 border border-blue-400 border-dashed rounded-md pointer-events-none"
                    style={{
                      top: (Math.min(dragState.startHour, dragState.endHour) - 8) * HOUR_HEIGHT,
                      height: (Math.abs(dragState.endHour - dragState.startHour) + 1) * HOUR_HEIGHT,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Current time indicator */}
          {isCurrentWeek && currentTimeTop >= 0 && currentTimeTop <= WEEKDAY_HOURS.length * HOUR_HEIGHT && (
            <div
              className="absolute left-[52px] right-0 h-[2px] bg-red-500 z-10 pointer-events-none"
              style={{ top: currentTimeTop }}
            >
              <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-red-500" />
            </div>
          )}
        </div>
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
  const [newCategory, setNewCategory] = useState<CalendarCategory>('work');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [categoryFilter, setCategoryFilter] = useState<Set<CalendarCategory>>(
    new Set(['work', 'personal', 'family', 'health'])
  );
  const [showYearView, setShowYearView] = useState(false);

  // For inline event editing in month view
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();

  // ── Filtered events based on category ──
  const filteredEvents = useMemo(
    () => events.filter((e) => categoryFilter.has(e.category)),
    [events, categoryFilter]
  );

  // ── Derived data ──
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedKey = dateKey(selectedDate);
  const selectedEvents = useMemo(
    () =>
      filteredEvents
        .filter((e) => e.date === selectedKey)
        .sort((a, b) => a.hour - b.hour),
    [filteredEvents, selectedKey]
  );

  // Build a map of date -> has events
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
  const goToPrevMonth = useCallback(() => {
    if (viewMode === 'week') {
      setCurrentDate((d) => subWeeks(d, 1));
      setSelectedDate((d) => subWeeks(d, 1));
    } else {
      setCurrentDate((d) => subMonths(d, 1));
    }
  }, [viewMode]);

  const goToNextMonth = useCallback(() => {
    if (viewMode === 'week') {
      setCurrentDate((d) => addWeeks(d, 1));
      setSelectedDate((d) => addWeeks(d, 1));
    } else {
      setCurrentDate((d) => addMonths(d, 1));
    }
  }, [viewMode]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  }, []);

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    setIsAdding(false);
    setEditingEventId(null);
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
      duration: 1,
      category: newCategory,
    };
    setEvents((prev) => [...prev, ev]);
    setNewTitle('');
    setNewHour(9);
    setNewCategory('work');
    setIsAdding(false);
  }, [newTitle, newHour, newCategory, selectedDate]);

  const handleQuickAddEvent = useCallback((date: string, hour: number, duration: number) => {
    const hourData = HOURS.find((h) => h.value === hour)!;
    const ev: CalendarEvent = {
      id: generateId(),
      date,
      title: 'New Event',
      time: hourData.label,
      hour,
      duration,
      category: 'work',
    };
    setEvents((prev) => [...prev, ev]);
    // Immediately enter edit mode
    setEditingEventId(ev.id);
    setEditTitle(ev.title);
    setTimeout(() => editInputRef.current?.focus(), 100);
  }, []);

  const handleUpdateEvent = useCallback((id: string, title: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, title } : e))
    );
    setEditingEventId(null);
    setEditTitle('');
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleMiniCalSelect = useCallback((d: Date) => {
    setSelectedDate(d);
    setCurrentDate(startOfMonth(d));
    setIsAdding(false);
    setEditingEventId(null);
  }, []);

  const toggleCategory = useCallback((cat: CalendarCategory) => {
    setCategoryFilter((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  // ── Inline edit handlers for month view ──
  const handleEventClickMonth = useCallback((ev: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEventId(ev.id);
    setEditTitle(ev.title);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const handleEditSaveMonth = useCallback(() => {
    if (editingEventId && editTitle.trim()) {
      handleUpdateEvent(editingEventId, editTitle.trim());
    }
    setEditingEventId(null);
    setEditTitle('');
  }, [editingEventId, editTitle, handleUpdateEvent]);

  const handleEditCancelMonth = useCallback(() => {
    setEditingEventId(null);
    setEditTitle('');
  }, []);

  // ── Weeks chunking for main grid ──
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // ── Color helpers ──
  const getCategoryDot = (cat: CalendarCategory) =>
    getCategoryConfig(cat).dot;

  const getCategoryBg = (cat: CalendarCategory) =>
    getCategoryConfig(cat).eventBg;

  return (
    <div className="flex h-full w-full bg-white overflow-hidden select-none">
      {/* ── Sidebar ── */}
      <div className="hidden md:flex flex-col w-[200px] min-w-[200px] bg-gray-50 border-r border-gray-200 overflow-y-auto">
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
          eventDates={eventDates}
        />

        {/* Separator */}
        <div className="mx-3 border-t border-gray-200 my-1" />

        {/* Calendar Categories */}
        <div className="px-3 pt-2 pb-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Calendars
          </span>
        </div>
        <div className="px-3 pb-2">
          {CALENDAR_CATEGORIES.map((cat) => {
            const isActive = categoryFilter.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center gap-2 py-1 w-full text-left group"
              >
                <span
                  className={`
                    h-2.5 w-2.5 rounded-full transition-all shrink-0
                    ${cat.dot}
                    ${!isActive ? 'opacity-30' : ''}
                  `}
                />
                <span
                  className={`text-[11px] transition-colors ${
                    isActive ? 'text-gray-700' : 'text-gray-400 line-through'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="mx-3 border-t border-gray-200 my-1" />

        {/* Year View Toggle */}
        <div className="px-3 pt-2 pb-1">
          <button
            onClick={() => setShowYearView(!showYearView)}
            className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
          >
            {showYearView ? '▾' : '▸'} Year View
          </button>
        </div>

        {showYearView && (
          <YearViewMini
            year={currentDate.getFullYear()}
            eventDates={eventDates}
            selectedDate={selectedDate}
            onSelectDate={handleMiniCalSelect}
          />
        )}

        {!showYearView && (
          <>
            {/* Separator */}
            <div className="mx-3 border-t border-gray-200 my-1" />

            {/* Upcoming events summary */}
            <div className="px-3 pt-2 pb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Today&apos;s Events
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {filteredEvents
                .filter((e) => e.date === todayStr())
                .sort((a, b) => a.hour - b.hour)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getCategoryDot(ev.category)}`} />
                    <span className="text-[10px] text-gray-700 truncate">{ev.title}</span>
                    <span className="text-[9px] text-gray-400 ml-auto shrink-0">{ev.time}</span>
                  </div>
                ))}
              {filteredEvents.filter((e) => e.date === todayStr()).length === 0 && (
                <p className="text-[10px] text-gray-400 px-1 py-1">No events today</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              className="p-1 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600"
              title={viewMode === 'week' ? 'Previous Week' : 'Previous Month'}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600"
              title={viewMode === 'week' ? 'Next Week' : 'Next Month'}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-sm font-semibold text-gray-800">
            {viewMode === 'week'
              ? `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')}
          </h2>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Week
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {viewMode === 'week' ? (
          /* Week View */
          <WeekView
            selectedDate={selectedDate}
            events={events}
            filteredEvents={filteredEvents}
            onAddEvent={handleQuickAddEvent}
            onUpdateEvent={handleUpdateEvent}
            categoryFilter={categoryFilter}
          />
        ) : (
          /* Month View */
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
                      const filteredDayEvents = dayEvents.filter((e) => categoryFilter.has(e.category));
                      const hasEvents = filteredDayEvents.length > 0;

                      // Show up to 3 colored dots for events on this day
                      const eventDots = filteredDayEvents.slice(0, 3);

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
                                  className={`h-1 w-1 rounded-full ${getCategoryDot(ev.category)}`}
                                />
                              ))}
                              {filteredDayEvents.length > 3 && (
                                <span className="text-[7px] text-gray-400 ml-0.5">
                                  +{filteredDayEvents.length - 3}
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

            {/* ── Events Panel (Month View) ── */}
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
                    setNewCategory('work');
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

                    {/* Category Picker */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {CALENDAR_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setNewCategory(cat.id)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium transition-all ${
                            newCategory === cat.id
                              ? `${cat.bg} ${cat.border} border ring-1 ring-offset-0 ring-gray-300`
                              : 'border border-transparent hover:bg-gray-100'
                          }`}
                          title={cat.label}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                          {cat.label}
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

                {selectedEvents.map((ev) => {
                  const catConfig = getCategoryConfig(ev.category);
                  const isEditing = editingEventId === ev.id;

                  return (
                    <div
                      key={ev.id}
                      className={`group flex items-start gap-2 px-3 py-2 border-l-2 mx-2 my-1 rounded-r-md border ${catConfig.eventBg} transition-colors hover:shadow-sm cursor-pointer`}
                      onClick={(e) => handleEventClickMonth(ev, e)}
                    >
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSaveMonth();
                              if (e.key === 'Escape') handleEditCancelMonth();
                            }}
                            onBlur={handleEditSaveMonth}
                            className="w-full text-[11px] bg-white/80 rounded px-1 py-0.5 outline-none border border-blue-300"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="text-[11px] font-semibold text-gray-800 truncate">
                            {ev.title}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {ev.time}
                          {ev.duration > 1 && ` · ${ev.duration}h`}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(ev.id);
                        }}
                        className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                        title="Delete Event"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                <span className="text-[10px] text-gray-400">
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
