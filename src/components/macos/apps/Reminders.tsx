'use client'

import React, { useState, useMemo } from 'react'
import {
  Plus,
  Flag,
  Calendar,
  Circle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ListPlus,
  AlertCircle,
  X,
} from 'lucide-react'

interface Reminder {
  id: string
  title: string
  completed: boolean
  dueDate: string | null
  flagged: boolean
  priority: 'none' | 'low' | 'medium' | 'high'
  notes: string
  listId: string
  subtasks: { id: string; title: string; completed: boolean }[]
}

interface ReminderList {
  id: string
  name: string
  color: string
}

const DEFAULT_LISTS: ReminderList[] = [
  { id: 'today', name: 'Today', color: '#007AFF' },
  { id: 'scheduled', name: 'Scheduled', color: '#FF9500' },
  { id: 'all', name: 'All', color: '#8E8E93' },
  { id: 'flagged', name: 'Flagged', color: '#FF3B30' },
  { id: 'completed', name: 'Completed', color: '#34C759' },
]

const CUSTOM_LISTS: ReminderList[] = [
  { id: 'work', name: 'Work', color: '#007AFF' },
  { id: 'personal', name: 'Personal', color: '#FF9500' },
  { id: 'shopping', name: 'Shopping', color: '#34C759' },
]

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: '1', title: 'Review project proposal', completed: false, dueDate: 'Today', flagged: true,
    priority: 'high', notes: 'Check budget section carefully', listId: 'work',
    subtasks: [
      { id: 's1', title: 'Read through proposal', completed: true },
      { id: 's2', title: 'Prepare feedback', completed: false },
    ],
  },
  {
    id: '2', title: 'Buy groceries', completed: false, dueDate: 'Today', flagged: false,
    priority: 'none', notes: 'Milk, eggs, bread, vegetables', listId: 'shopping',
    subtasks: [],
  },
  {
    id: '3', title: 'Schedule dentist appointment', completed: false, dueDate: 'Tomorrow', flagged: true,
    priority: 'medium', notes: '', listId: 'personal',
    subtasks: [],
  },
  {
    id: '4', title: 'Prepare quarterly report', completed: false, dueDate: 'Mar 8', flagged: false,
    priority: 'high', notes: 'Include Q4 comparisons', listId: 'work',
    subtasks: [
      { id: 's3', title: 'Gather data from analytics', completed: false },
      { id: 's4', title: 'Create charts', completed: false },
      { id: 's5', title: 'Write summary', completed: false },
    ],
  },
  {
    id: '5', title: 'Call insurance company', completed: true, dueDate: 'Yesterday', flagged: false,
    priority: 'low', notes: 'Ask about home coverage update', listId: 'personal',
    subtasks: [],
  },
  {
    id: '6', title: 'Order new running shoes', completed: false, dueDate: 'Mar 10', flagged: false,
    priority: 'none', notes: 'Nike Pegasus 40 - Size 10', listId: 'shopping',
    subtasks: [],
  },
  {
    id: '7', title: 'Team standup meeting', completed: false, dueDate: 'Today', flagged: false,
    priority: 'medium', notes: '10:00 AM - Conference Room B', listId: 'work',
    subtasks: [],
  },
  {
    id: '8', title: 'Read chapter 5 of design book', completed: false, dueDate: null, flagged: false,
    priority: 'none', notes: '', listId: 'personal',
    subtasks: [],
  },
  {
    id: '9', title: 'Fix login page bug', completed: false, dueDate: 'Today', flagged: true,
    priority: 'high', notes: 'Users reporting 500 error on form submit', listId: 'work',
    subtasks: [
      { id: 's6', title: 'Reproduce the bug', completed: true },
      { id: 's7', title: 'Identify root cause', completed: true },
      { id: 's8', title: 'Deploy fix', completed: false },
    ],
  },
  {
    id: '10', title: 'Pick up dry cleaning', completed: true, dueDate: 'Yesterday', flagged: false,
    priority: 'none', notes: '', listId: 'personal',
    subtasks: [],
  },
]

const PRIORITY_CONFIG = {
  none: { icon: null, color: '' },
  low: { icon: <AlertCircle size={12} />, color: '#34C759' },
  medium: { icon: <AlertCircle size={12} />, color: '#FF9500' },
  high: { icon: <AlertCircle size={12} />, color: '#FF3B30' },
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS)
  const [selectedList, setSelectedList] = useState<string>('today')
  const [expandedReminders, setExpandedReminders] = useState<Set<string>>(new Set())
  const [editingReminder, setEditingReminder] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState<string>('Today')
  const [newFlagged, setNewFlagged] = useState(false)
  const [newPriority, setNewPriority] = useState<'none' | 'low' | 'medium' | 'high'>('none')
  const [customLists, setCustomLists] = useState<ReminderList[]>(CUSTOM_LISTS)
  const [showAddList, setShowAddList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListColor, setNewListColor] = useState('#007AFF')

  const allLists = useMemo(() => [...DEFAULT_LISTS, ...customLists], [customLists])

  const todayCount = useMemo(() => reminders.filter(r => !r.completed && r.dueDate === 'Today').length, [reminders])
  const scheduledCount = useMemo(() => reminders.filter(r => !r.completed && r.dueDate && r.dueDate !== 'Today').length, [reminders])
  const allCount = useMemo(() => reminders.filter(r => !r.completed).length, [reminders])
  const flaggedCount = useMemo(() => reminders.filter(r => !r.completed && r.flagged).length, [reminders])
  const completedCount = useMemo(() => reminders.filter(r => r.completed).length, [reminders])

  const smartListCounts: Record<string, number> = {
    today: todayCount,
    scheduled: scheduledCount,
    all: allCount,
    flagged: flaggedCount,
    completed: completedCount,
  }

  const displayedReminders = useMemo(() => {
    switch (selectedList) {
      case 'today':
        return reminders.filter(r => !r.completed && r.dueDate === 'Today')
      case 'scheduled':
        return reminders.filter(r => !r.completed && r.dueDate && r.dueDate !== 'Today')
      case 'all':
        return reminders.filter(r => !r.completed)
      case 'flagged':
        return reminders.filter(r => !r.completed && r.flagged)
      case 'completed':
        return reminders.filter(r => r.completed)
      default:
        return reminders.filter(r => r.listId === selectedList)
    }
  }, [selectedList, reminders])

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    ))
  }

  const toggleFlag = (id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, flagged: !r.flagged } : r
    ))
  }

  const toggleExpand = (id: string) => {
    setExpandedReminders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const startEditing = (reminder: Reminder) => {
    setEditingReminder(reminder.id)
    setEditTitle(reminder.title)
  }

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      setReminders(prev => prev.map(r =>
        r.id === id ? { ...r, title: editTitle.trim() } : r
      ))
    }
    setEditingReminder(null)
  }

  const addReminder = () => {
    if (!newTitle.trim()) return
    const newReminder: Reminder = {
      id: `r-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      dueDate: newDueDate || null,
      flagged: newFlagged,
      priority: newPriority,
      notes: '',
      listId: selectedList === 'today' || selectedList === 'all' || selectedList === 'scheduled' || selectedList === 'flagged' || selectedList === 'completed'
        ? 'personal'
        : selectedList,
      subtasks: [],
    }
    setReminders(prev => [...prev, newReminder])
    setNewTitle('')
    setNewDueDate('Today')
    setNewFlagged(false)
    setNewPriority('none')
    setShowAddReminder(false)
  }

  const addList = () => {
    if (!newListName.trim()) return
    setCustomLists(prev => [...prev, {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      color: newListColor,
    }])
    setNewListName('')
    setNewListColor('#007AFF')
    setShowAddList(false)
  }

  const cyclePriority = (id: string) => {
    const order: Reminder['priority'][] = ['none', 'low', 'medium', 'high']
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r
      const currentIdx = order.indexOf(r.priority)
      const nextPriority = order[(currentIdx + 1) % order.length]
      return { ...r, priority: nextPriority }
    }))
  }

  const selectedListInfo = allLists.find(l => l.id === selectedList)

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 border-r border-gray-200 bg-[#f5f5f7] flex flex-col">
        {/* Smart lists */}
        <div className="py-2">
          {DEFAULT_LISTS.map(list => (
            <button
              key={list.id}
              onClick={() => setSelectedList(list.id)}
              className={`w-full flex items-center gap-2 px-4 py-1.5 text-[13px] transition-colors ${
                selectedList === list.id ? 'bg-blue-500/10 text-blue-600' : 'text-gray-700 hover:bg-gray-200/60'
              }`}
            >
              <div
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: list.color + '20' }}
              >
                <div className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: list.color }} />
              </div>
              <span className="flex-1 text-left">{list.name}</span>
              {smartListCounts[list.id] > 0 && (
                <span className={`text-[11px] min-w-[18px] text-center ${
                  selectedList === list.id ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  {smartListCounts[list.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="h-px bg-gray-200 mx-3" />

        {/* Custom lists */}
        <div className="py-2 flex-1">
          <div className="px-4 mb-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">My Lists</span>
          </div>
          {customLists.map(list => {
            const count = reminders.filter(r => r.listId === list.id && !r.completed).length
            return (
              <button
                key={list.id}
                onClick={() => setSelectedList(list.id)}
                className={`w-full flex items-center gap-2 px-4 py-1.5 text-[13px] transition-colors ${
                  selectedList === list.id ? 'bg-blue-500/10 text-blue-600' : 'text-gray-700 hover:bg-gray-200/60'
                }`}
              >
                <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ backgroundColor: list.color }} />
                <span className="flex-1 text-left">{list.name}</span>
                {count > 0 && (
                  <span className={`text-[11px] ${
                    selectedList === list.id ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          {/* Add list button */}
          {showAddList ? (
            <div className="px-3 pt-1">
              <input
                type="text"
                placeholder="List name"
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addList(); if (e.key === 'Escape') setShowAddList(false) }}
                className="w-full px-2 py-1 text-[12px] bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-400 mb-1"
                autoFocus
              />
              <div className="flex items-center gap-1.5 mb-1.5">
                {['#007AFF', '#FF9500', '#34C759', '#FF3B30', '#AF52DE', '#5AC8FA', '#FFD60A'].map(color => (
                  <button
                    key={color}
                    onClick={() => setNewListColor(color)}
                    className={`w-4 h-4 rounded-full transition-transform ${newListColor === color ? 'scale-125 ring-2 ring-gray-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={addList} className="px-2.5 py-0.5 text-[11px] font-medium text-white bg-blue-500 rounded hover:bg-blue-600">Add</button>
                <button onClick={() => setShowAddList(false)} className="px-2.5 py-0.5 text-[11px] font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddList(true)}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-[13px] text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
            >
              <ListPlus size={14} />
              <span>Add List</span>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {selectedListInfo && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedListInfo.color }}
              />
            )}
            <h2 className="text-[20px] font-bold text-gray-900">
              {selectedListInfo?.name || 'Reminders'}
            </h2>
            <span className="text-[13px] text-gray-400 ml-1">{displayedReminders.length}</span>
          </div>
          <button
            onClick={() => setShowAddReminder(!showAddReminder)}
            className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={14} />
            New Reminder
          </button>
        </div>

        {/* Add Reminder Form */}
        {showAddReminder && (
          <div className="mx-5 mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 shrink-0">
            <input
              type="text"
              placeholder="What do you need to remember?"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addReminder(); if (e.key === 'Escape') setShowAddReminder(false) }}
              className="w-full px-3 py-2 text-[13px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 mb-2"
              autoFocus
            />
            <div className="flex items-center gap-3">
              {/* Date selector */}
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-400" />
                <select
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="text-[11px] text-gray-600 bg-white border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                >
                  <option value="">No date</option>
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Mar 8">Mar 8</option>
                  <option value="Mar 10">Mar 10</option>
                </select>
              </div>

              {/* Flag toggle */}
              <button
                onClick={() => setNewFlagged(!newFlagged)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                  newFlagged ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Flag size={12} />
                {newFlagged && 'Flagged'}
              </button>

              {/* Priority selector */}
              <div className="flex items-center gap-1">
                {(['none', 'low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      newPriority === p
                        ? p === 'none' ? 'bg-gray-200 text-gray-600'
                          : p === 'low' ? 'bg-green-100 text-green-600'
                            : p === 'medium' ? 'bg-orange-100 text-orange-600'
                              : 'bg-red-100 text-red-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {p === 'none' ? '—' : p === 'low' ? '!' : p === 'medium' ? '!!' : '!!!'}
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              <button
                onClick={addReminder}
                disabled={!newTitle.trim()}
                className="px-3 py-0.5 text-[11px] font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddReminder(false)}
                className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Reminders list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {displayedReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-[48px] mb-2">📋</div>
              <p className="text-[14px]">No reminders</p>
              <p className="text-[12px] mt-1">Click &quot;New Reminder&quot; to add one</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {displayedReminders.map(reminder => {
                const isExpanded = expandedReminders.has(reminder.id)
                const isEditing = editingReminder === reminder.id
                const priorityConfig = PRIORITY_CONFIG[reminder.priority]
                const hasSubtasks = reminder.subtasks.length > 0
                const completedSubtasks = reminder.subtasks.filter(s => s.completed).length

                return (
                  <div
                    key={reminder.id}
                    className={`group rounded-xl border transition-colors ${
                      reminder.completed ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-gray-150 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 px-3 py-2.5">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(reminder.id)}
                        className="mt-0.5 shrink-0"
                      >
                        {reminder.completed ? (
                          <CheckCircle2 size={18} className="text-gray-400" />
                        ) : (
                          <Circle size={18} className="text-gray-300 hover:text-gray-400" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(reminder.id); if (e.key === 'Escape') setEditingReminder(null) }}
                              onBlur={() => saveEdit(reminder.id)}
                              className="flex-1 text-[13px] bg-white border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => startEditing(reminder)}
                              className={`text-[13px] cursor-text ${
                                reminder.completed ? 'line-through text-gray-400' : 'text-gray-900'
                              }`}
                            >
                              {reminder.title}
                            </span>
                          )}

                          {/* Priority */}
                          {!reminder.completed && priorityConfig.icon && (
                            <button onClick={() => cyclePriority(reminder.id)} title={`Priority: ${reminder.priority}`}>
                              <span style={{ color: priorityConfig.color }}>{priorityConfig.icon}</span>
                            </button>
                          )}

                          {/* Flag */}
                          {!reminder.completed && (
                            <button
                              onClick={() => toggleFlag(reminder.id)}
                              className={`transition-colors ${
                                reminder.flagged ? 'text-orange-500' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                              }`}
                              title={reminder.flagged ? 'Remove flag' : 'Flag'}
                            >
                              <Flag size={14} />
                            </button>
                          )}
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-2 mt-0.5">
                          {reminder.dueDate && (
                            <span className={`flex items-center gap-1 text-[11px] ${
                              reminder.completed ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              <Calendar size={10} />
                              {reminder.dueDate}
                            </span>
                          )}
                          {hasSubtasks && (
                            <button
                              onClick={() => toggleExpand(reminder.id)}
                              className="flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                              {completedSubtasks}/{reminder.subtasks.length}
                            </button>
                          )}
                          {reminder.listId && (selectedList === 'today' || selectedList === 'all' || selectedList === 'scheduled' || selectedList === 'flagged' || selectedList === 'completed') && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: allLists.find(l => l.id === reminder.listId)?.color || '#8E8E93' }} />
                              {allLists.find(l => l.id === reminder.listId)?.name}
                            </span>
                          )}
                        </div>

                        {/* Notes */}
                        {reminder.notes && (
                          <p className={`text-[11px] mt-1 ${reminder.completed ? 'text-gray-300' : 'text-gray-500'}`}>
                            {reminder.notes}
                          </p>
                        )}

                        {/* Subtasks */}
                        {isExpanded && hasSubtasks && (
                          <div className="mt-2 ml-3 space-y-1 border-l-2 border-gray-100 pl-3">
                            {reminder.subtasks.map(sub => (
                              <div key={sub.id} className="flex items-center gap-2">
                                <button onClick={() => {
                                  setReminders(prev => prev.map(r => {
                                    if (r.id !== reminder.id) return r
                                    return {
                                      ...r,
                                      subtasks: r.subtasks.map(s =>
                                        s.id === sub.id ? { ...s, completed: !s.completed } : s
                                      ),
                                    }
                                  }))
                                }}>
                                  {sub.completed ? (
                                    <CheckCircle2 size={14} className="text-gray-400" />
                                  ) : (
                                    <Circle size={14} className="text-gray-300" />
                                  )}
                                </button>
                                <span className={`text-[12px] ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
