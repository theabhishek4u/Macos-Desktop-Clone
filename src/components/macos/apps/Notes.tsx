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
  FolderClosed,
  Clock,
  Cloud,
  Share2,
  Table,
  TextQuote,
  ListChecks,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  folderId: string;
}

interface Folder {
  id: string;
  name: string;
  icon: 'all' | 'notes' | 'trash' | 'custom';
  count?: number;
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All iCloud', icon: 'all' },
  { id: 'notes', name: 'Notes', icon: 'notes' },
  { id: 'trash', name: 'Recently Deleted', icon: 'trash' },
];

const SAMPLE_NOTES: Note[] = [
  {
    id: '1',
    title: 'Welcome to Notes',
    content:
      'This is your new Notes app. You can create, edit, and delete notes here.\n\nTry creating a new note with the + button in the toolbar!',
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    folderId: 'notes',
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content:
      'Team standup - Monday\n\n- Discussed Q2 roadmap\n- Design review scheduled for Wednesday\n- New feature specs need approval\n- Follow up with engineering on timeline',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    folderId: 'notes',
  },
  {
    id: '3',
    title: 'Recipe: Pasta Carbonara',
    content:
      'Ingredients:\n- 400g spaghetti\n- 200g guanciale\n- 4 egg yolks\n- 100g pecorino romano\n- Black pepper\n\nCook pasta al dente. Crisp guanciale. Mix yolks with cheese. Combine off heat.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    folderId: 'notes',
  },
  {
    id: '4',
    title: 'Book Recommendations',
    content:
      '1. Designing Data-Intensive Applications - Martin Kleppmann\n2. The Pragmatic Programmer - Hunt & Thomas\n3. Clean Code - Robert C. Martin\n4. Refactoring - Martin Fowler',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    folderId: 'notes',
  },
  {
    id: '5',
    title: 'Project Ideas',
    content:
      'Build a weather dashboard with real-time data\nCreate a habit tracker with streaks\nDesign a personal portfolio site',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    folderId: 'notes',
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
  const startIdx = note.title.trim() ? 0 : 1;
  const preview = lines.slice(startIdx).join(' ').trim();
  return preview || 'No additional text';
}

function getTimeGroup(date: Date): 'today' | 'week' | 'month' | 'older' {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays < 7) return 'week';
  if (diffDays < 30) return 'month';
  return 'older';
}

const TIME_LABELS: Record<string, string> = {
  today: 'Today',
  week: 'Previous 7 Days',
  month: 'Previous 30 Days',
  older: 'Older',
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(SAMPLE_NOTES);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [folders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [iCloudExpanded, setICloudExpanded] = useState(true);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  const folderFilteredNotes = useMemo(() => {
    if (selectedFolderId === 'all') return notes.filter((n) => n.folderId !== 'trash');
    if (selectedFolderId === 'trash') return notes.filter((n) => n.folderId === 'trash');
    return notes.filter((n) => n.folderId === selectedFolderId);
  }, [notes, selectedFolderId]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return folderFilteredNotes;
    const q = searchQuery.toLowerCase();
    return folderFilteredNotes.filter(
      (n) =>
        getDisplayTitle(n).toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [folderFilteredNotes, searchQuery]);

  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    for (const note of filteredNotes) {
      const group = getTimeGroup(note.updatedAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(note);
    }
    // Sort within each group by date
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    return groups;
  }, [filteredNotes]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notes.filter((n) => n.folderId !== 'trash').length,
      notes: notes.filter((n) => n.folderId === 'notes').length,
      trash: notes.filter((n) => n.folderId === 'trash').length,
    };
    return counts;
  }, [notes]);

  const handleAddNote = useCallback(() => {
    const targetFolder = selectedFolderId === 'all' || selectedFolderId === 'trash' ? 'notes' : selectedFolderId;
    const newNote: Note = {
      id: generateId(),
      title: '',
      content: '',
      updatedAt: new Date(),
      folderId: targetFolder,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
  }, [selectedFolderId]);

  const handleDeleteNote = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setNotes((prev) => {
        const note = prev.find((n) => n.id === id);
        // If in trash, permanently delete; otherwise move to trash
        if (note?.folderId === 'trash') {
          const updated = prev.filter((n) => n.id !== id);
          if (selectedId === id && updated.length > 0) {
            const nonTrash = updated.filter((n) => n.folderId !== 'trash');
            setSelectedId(nonTrash.length > 0 ? nonTrash[0].id : updated[0].id);
          } else if (updated.length === 0) {
            setSelectedId('');
          }
          return updated;
        } else {
          const updated = prev.map((n) =>
            n.id === id ? { ...n, folderId: 'trash', updatedAt: new Date() } : n
          );
          if (selectedId === id) {
            const remaining = updated.filter((n) => n.folderId !== 'trash');
            setSelectedId(remaining.length > 0 ? remaining[0].id : '');
          }
          return updated;
        }
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

  const getFolderIcon = (folder: Folder) => {
    switch (folder.icon) {
      case 'all':
        return <FolderClosed className="h-3.5 w-3.5 text-blue-500" />;
      case 'notes':
        return <FolderClosed className="h-3.5 w-3.5 text-yellow-500" />;
      case 'trash':
        return <Trash2 className="h-3.5 w-3.5 text-gray-400" />;
      default:
        return <FolderClosed className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-inherit">
      {/* Column 1: Folders Sidebar */}
      <div
        className="flex w-[140px] min-w-[140px] flex-col border-r border-[#d4cec3]"
        style={{ backgroundColor: '#efe9dd' }}
      >
        {/* Folders Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#d4cec3]/60">
          <NotebookPen className="h-4 w-4 text-blue-600" />
          <button
            onClick={handleAddNote}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 transition-colors hover:bg-blue-500/20 active:bg-blue-500/30"
            title="New Note"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* iCloud Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
          {/* iCloud Header */}
          <button
            onClick={() => setICloudExpanded(!iCloudExpanded)}
            className="flex w-full items-center gap-1 px-3 py-1.5 text-left hover:bg-black/[0.04] transition-colors"
          >
            {iCloudExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
            )}
            <Cloud className="h-3 w-3 text-blue-400 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
              iCloud
            </span>
          </button>

          {/* Folder List */}
          {iCloudExpanded && (
            <div className="mt-0.5">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`group flex w-full items-center gap-2 px-3 pl-7 py-[5px] text-left transition-all duration-150 ${
                    folder.id === selectedFolderId
                      ? 'bg-blue-500/15 text-blue-700'
                      : 'text-gray-700 hover:bg-black/[0.04]'
                  }`}
                >
                  {getFolderIcon(folder)}
                  <span className="text-[12px] font-medium truncate flex-1">
                    {folder.name}
                  </span>
                  <span
                    className={`text-[10px] shrink-0 ${
                      folder.id === selectedFolderId
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {folderCounts[folder.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Notes List */}
      <div
        className="flex w-[200px] min-w-[200px] flex-col border-r border-[#d4cec3]"
        style={{ backgroundColor: '#f5f0e8' }}
      >
        {/* Search Bar */}
        <div className="px-2.5 py-2">
          <div className="flex items-center gap-1.5 rounded-full bg-black/[0.05] px-2.5 py-[5px]">
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

        {/* Notes List with Groups */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredNotes.length === 0 && (
            <div className="px-3 py-8 text-center text-[11px] text-gray-400">
              {searchQuery ? 'No matching notes' : 'No notes yet'}
            </div>
          )}

          {(['today', 'week', 'month', 'older'] as const).map((group) => {
            const groupNotes = groupedNotes[group];
            if (!groupNotes || groupNotes.length === 0) return null;

            return (
              <div key={group}>
                {/* Section Header */}
                <div className="px-3 pt-3 pb-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {TIME_LABELS[group]}
                  </span>
                </div>

                {/* Notes in this group */}
                {groupNotes.map((note) => (
                  <div
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(note.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(note.id) }}
                    className={`group relative w-full px-3 py-2 text-left transition-all duration-150 border-l-[3px] rounded-r-md mx-1 cursor-default ${
                      note.id === selectedId
                        ? 'bg-blue-50/70 border-blue-500'
                        : 'bg-transparent border-transparent hover:bg-black/[0.03]'
                    }`}
                    style={{ width: 'calc(100% - 8px)' }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-[12px] font-semibold leading-tight ${
                            note.id === selectedId ? 'text-gray-900' : 'text-gray-800'
                          }`}
                        >
                          {getDisplayTitle(note)}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatDate(note.updatedAt)}
                          </span>
                          <span className="truncate text-[10px] text-gray-400/70">
                            {getPreviewText(note).slice(0, 28)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 rounded hover:bg-red-100 hover:text-red-500 text-gray-400"
                        title={note.folderId === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Notes Count Footer */}
        <div className="border-t border-[#d4cec3]/60 px-3 py-1.5">
          <span className="text-[10px] text-gray-400">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Column 3: Editor */}
      <div className="flex flex-1 flex-col bg-white min-w-0">
        {selectedNote ? (
          <>
            {/* Format Toolbar */}
            <div className="flex items-center gap-0.5 border-b border-gray-200/80 px-4 py-1.5 bg-white">
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Title"
              >
                <TextQuote className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Underline"
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              <div className="mx-1 h-4 w-px bg-gray-200" />
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Bulleted List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Checklist"
              >
                <ListChecks className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Table"
              >
                <Table className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Align Left"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <div className="mx-1 h-4 w-px bg-gray-200" />
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="Share"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <div className="flex-1" />
              <button
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
                title="More"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Title Area */}
            <div className="border-b border-gray-100 px-8 pt-6 pb-3">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-200 focus:outline-none tracking-tight"
              />
              <div className="mt-1.5 text-[11px] text-gray-400">
                {formatDate(selectedNote.updatedAt)}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-8 pb-6 pt-3 min-h-0">
              <textarea
                value={selectedNote.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                placeholder="Start writing…"
                className="h-full w-full resize-none text-[14px] leading-[1.7] text-gray-700 placeholder:text-gray-300 focus:outline-none font-sans"
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center text-gray-300 gap-3">
            <NotebookPen className="h-12 w-12" />
            <div className="text-sm font-medium">No Note Selected</div>
            <div className="text-xs text-gray-300">Select a note or create a new one</div>
            <button
              onClick={handleAddNote}
              className="mt-2 rounded-lg bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-600 transition-colors duration-150 hover:bg-blue-500/20 active:bg-blue-500/30"
            >
              Create a Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
