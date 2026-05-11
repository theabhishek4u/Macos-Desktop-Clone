'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  NotebookPen,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

const SAMPLE_NOTES: Note[] = [
  {
    id: '1',
    title: 'Welcome to Notes',
    content:
      'This is your new Notes app. You can create, edit, and delete notes here.\n\nTry creating a new note with the + button in the sidebar!',
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content:
      'Team standup - Monday\n\n- Discussed Q2 roadmap\n- Design review scheduled for Wednesday\n- New feature specs need approval\n- Follow up with engineering on timeline',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    title: 'Recipe: Pasta Carbonara',
    content:
      'Ingredients:\n- 400g spaghetti\n- 200g guanciale\n- 4 egg yolks\n- 100g pecorino romano\n- Black pepper\n\nCook pasta al dente. Crisp guanciale. Mix yolks with cheese. Combine off heat.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '4',
    title: 'Book Recommendations',
    content:
      '1. Designing Data-Intensive Applications - Martin Kleppmann\n2. The Pragmatic Programmer - Hunt & Thomas\n3. Clean Code - Robert C. Martin\n4. Refactoring - Martin Fowler',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function getDisplayTitle(note: Note): string {
  if (note.title.trim()) return note.title;
  const firstLine = note.content.trim().split('\n')[0];
  return firstLine || 'New Note';
}

function getPreviewText(note: Note): string {
  const lines = note.content.trim().split('\n');
  // Skip the first line if it's used as the auto-title
  const startIdx = note.title.trim() ? 0 : 1;
  const preview = lines.slice(startIdx).join(' ').trim();
  return preview || 'No additional text';
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(SAMPLE_NOTES);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        getDisplayTitle(n).toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const handleAddNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: '',
      content: '',
      updatedAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
  }, []);

  const handleDeleteNote = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        if (selectedId === id && updated.length > 0) {
          setSelectedId(updated[0].id);
        } else if (updated.length === 0) {
          setSelectedId('');
        }
        return updated;
      });
    },
    [selectedId]
  );

  const handleUpdateTitle = useCallback(
    (title: string) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId ? { ...n, title, updatedAt: new Date() } : n
        )
      );
    },
    [selectedId]
  );

  const handleUpdateContent = useCallback(
    (content: string) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId ? { ...n, content, updatedAt: new Date() } : n
        )
      );
    },
    [selectedId]
  );

  return (
    <div className="flex h-full w-full overflow-hidden rounded-inherit">
      {/* Sidebar */}
      <div
        className="flex w-[180px] min-w-[180px] flex-col border-r border-[#d6cfc2]"
        style={{ backgroundColor: '#f5f0e8' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#d6cfc2]/60">
          <NotebookPen className="h-4 w-4 text-amber-700" />
          <button
            onClick={handleAddNote}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-700/10 text-amber-800 transition-colors hover:bg-amber-700/20 active:bg-amber-700/30"
            title="New Note"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1.5 rounded-md bg-black/5 px-2 py-1">
            <Search className="h-3 w-3 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[11px] text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredNotes.length === 0 && (
            <div className="px-3 py-6 text-center text-[11px] text-gray-400">
              {searchQuery ? 'No matching notes' : 'No notes yet'}
            </div>
          )}
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              className={`group relative w-full px-3 py-2 text-left transition-colors border-l-2 ${
                note.id === selectedId
                  ? 'bg-yellow-100/50 border-amber-500'
                  : 'bg-transparent border-transparent hover:bg-yellow-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-gray-800 leading-tight">
                    {getDisplayTitle(note)}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {formatDate(note.updatedAt)}
                    </span>
                    <span className="truncate text-[10px] text-gray-400">
                      {getPreviewText(note).slice(0, 30)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 hover:text-red-500 text-gray-400"
                  title="Delete Note"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-[#d6cfc2]/60 px-3 py-1.5">
          <span className="text-[10px] text-gray-400">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col bg-white min-w-0">
        {selectedNote ? (
          <>
            {/* Format Toolbar */}
            <div className="flex items-center gap-0.5 border-b border-gray-100 px-3 py-1.5 bg-gray-50/50">
              <button
                className="rounded p-1.5 text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-colors"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-colors"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-colors"
                title="Underline"
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              <div className="mx-1 h-4 w-px bg-gray-200" />
              <button
                className="rounded p-1.5 text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-colors"
                title="Bulleted List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-colors"
                title="Align Left"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Title */}
            <div className="px-6 pt-5 pb-1">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none"
              />
              <div className="mt-1 text-[11px] text-gray-400">
                {formatDate(selectedNote.updatedAt)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pb-4 pt-2 min-h-0">
              <textarea
                value={selectedNote.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                placeholder="Start writing..."
                className="h-full w-full resize-none text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 focus:outline-none font-sans"
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center text-gray-300 gap-3">
            <NotebookPen className="h-12 w-12" />
            <div className="text-sm">No Note Selected</div>
            <button
              onClick={handleAddNote}
              className="mt-1 rounded-md bg-amber-700/10 px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-700/20"
            >
              Create a Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
