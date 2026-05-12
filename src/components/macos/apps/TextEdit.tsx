'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FilePlus,
  FolderOpen,
  Save,
  Type,
  Palette,
  X,
  ChevronDown,
  Search,
  Replace,
  FileText,
  Clock,
  Check,
  Loader2,
} from 'lucide-react';

const FONT_LIST = [
  'System UI',
  'Helvetica Neue',
  'Georgia',
  'Courier New',
  'Times New Roman',
  'Arial',
  'Verdana',
  'Trebuchet MS',
  'Palatino',
  'Menlo',
  'Monaco',
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

const PRESET_COLORS = [
  '#000000', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#795548',
];

interface Document {
  id: string;
  name: string;
  text: string;
  fontName: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  lastModified: Date;
}

const createDocument = (name: string, text: string = ''): Document => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
  name,
  text,
  fontName: 'System UI',
  fontSize: 14,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  textAlign: 'left',
  textColor: '#000000',
  lastModified: new Date(),
});

const SAMPLE_TEXT = `Welcome to TextEdit

TextEdit is a simple text editor that comes with your Mac. You can use it to create and edit plain text or rich text documents.

Getting Started
To create a new document, click the New button in the toolbar or choose File > New. You can also open existing documents by clicking Open or choosing File > Open.

Formatting Text
TextEdit supports basic text formatting. Use the toolbar to change fonts, adjust sizes, and apply bold, italic, or underline styles. You can also align your text to the left, center, right, or justify it across the page.

Features:
• Rich text editing with multiple fonts and sizes
• Text alignment options (left, center, right, justify)
• Color picker for text customization
• Word and character count in the status bar
• Save your documents for later

Tips:
1. Use keyboard shortcuts for faster formatting
2. Click the color swatch to change text color
3. All formatting controls are in the toolbar above

TextEdit makes it easy to create beautiful documents on your Mac. Enjoy writing!`;

const NOTES_TEXT = `Meeting Notes - March 5

Attendees: Alice, Bob, Charlie

Agenda:
1. Project status update
2. Sprint planning for next week
3. Design review feedback
4. Open discussion

Action Items:
- Alice: Complete the API integration by Friday
- Bob: Review the design mockups
- Charlie: Set up the staging environment

Next meeting: March 12 at 10:00 AM`;

const TODO_TEXT = `Todo List

Today:
☐ Review pull requests
☐ Update documentation
☐ Fix the login bug
☐ Team standup at 2pm
☐ Prepare presentation slides

This Week:
☐ Complete feature implementation
☐ Write unit tests
☐ Deploy to staging
☐ Code review session

Done:
☑ Set up development environment
☑ Create project repository
☑ Define coding standards`;

export default function TextEdit() {
  const [documents, setDocuments] = useState<Document[]>([
    createDocument('Welcome.txt', SAMPLE_TEXT),
    createDocument('Meeting Notes.txt', NOTES_TEXT),
    createDocument('Todo List.txt', TODO_TEXT),
  ]);
  const [activeDocId, setActiveDocId] = useState<string>(documents[0].id);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDocSidebar, setShowDocSidebar] = useState(true);
  const [showFindBar, setShowFindBar] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findMatchIndex, setFindMatchIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'editing'>('saved');
  const [showColorSwatch, setShowColorSwatch] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorSwatchRef = useRef<HTMLDivElement>(null);
  const findInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  // Auto-save simulation
  const triggerAutoSave = useCallback(() => {
    setSaveStatus('editing');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 1500);
  }, []);

  // Update document helper
  const updateDoc = useCallback((docId: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, ...updates, lastModified: new Date() } : d
    ));
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Text change handler
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDoc(activeDocId, { text: e.target.value });
  }, [activeDocId, updateDoc]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) {
        setShowSizeMenu(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (colorSwatchRef.current && !colorSwatchRef.current.contains(e.target as Node)) {
        setShowColorSwatch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ctrl+F for find
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindBar(true);
        setTimeout(() => findInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setShowFindBar(false);
        setFindText('');
        setReplaceText('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Find matches - compute count inline to avoid cascading renders
  const findMatchCount = (() => {
    if (!findText) return 0;
    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = activeDoc.text.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  })();

  const findNext = useCallback(() => {
    if (findMatchCount === 0) return;
    const nextIndex = findMatchIndex >= findMatchCount ? 1 : findMatchIndex + 1;
    setFindMatchIndex(nextIndex);

    // Find the position in text and select it
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let matchIndex = 0;
    let matchPos = -1;
    const text = activeDoc.text;
    let m;
    while ((m = regex.exec(text)) !== null) {
      matchIndex++;
      if (matchIndex === nextIndex) {
        matchPos = m.index;
        break;
      }
    }
    if (matchPos >= 0 && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.setSelectionRange(matchPos, matchPos + findText.length);
    }
  }, [findText, findMatchCount, findMatchIndex, activeDoc.text]);

  const handleReplace = useCallback(() => {
    if (!findText || findMatchCount === 0) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const newText = activeDoc.text.replace(regex, replaceText);
    updateDoc(activeDocId, { text: newText });
  }, [findText, replaceText, findMatchCount, activeDoc.text, activeDocId, updateDoc]);

  const handleReplaceAll = useCallback(() => {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newText = activeDoc.text.replace(regex, replaceText);
    updateDoc(activeDocId, { text: newText });
  }, [findText, replaceText, activeDoc.text, activeDocId, updateDoc]);

  const createNewDoc = useCallback(() => {
    const newDoc = createDocument(`Untitled-${documents.length + 1}.txt`);
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  }, [documents.length]);

  const closeDoc = useCallback((docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (documents.length <= 1) return; // Don't close last document
    const newDocs = documents.filter(d => d.id !== docId);
    setDocuments(newDocs);
    if (activeDocId === docId) {
      setActiveDocId(newDocs[0].id);
    }
  }, [documents, activeDocId]);

  const wordCount = useCallback(() => {
    const trimmed = activeDoc.text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [activeDoc.text]);

  const charCount = activeDoc.text.length;

  const fontFamilyStyle = activeDoc.fontName === 'System UI' ? 'system-ui, -apple-system, sans-serif' : `'${activeDoc.fontName}', sans-serif`;

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Document list sidebar */}
      {showDocSidebar && (
        <div className="w-44 border-r border-gray-200 bg-[#f5f5f5] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Documents</span>
            <button
              onClick={() => setShowDocSidebar(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown size={12} className="rotate-180" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                  doc.id === activeDocId ? 'bg-blue-500/10 text-blue-700' : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <FileText size={14} className={doc.id === activeDocId ? 'text-blue-500' : 'text-gray-400'} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-medium truncate ${doc.id === activeDocId ? 'text-blue-700' : 'text-gray-700'}`}>
                    {doc.name}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {doc.lastModified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={createNewDoc}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-gray-500 hover:bg-gray-200/60 rounded transition-colors"
            >
              <FilePlus size={12} />
              New Document
            </button>
          </div>
        </div>
      )}

      {/* Main editor area */}
      <div className="flex h-full w-full flex-col overflow-hidden bg-white">
        {/* Document Tabs */}
        <div className="flex items-center bg-[#e8e8e8] border-b border-gray-300 shrink-0 overflow-x-auto custom-scrollbar">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-[11px] border-r border-gray-300/60 transition-colors whitespace-nowrap ${
                doc.id === activeDocId
                  ? 'bg-white text-gray-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-200/60'
              }`}
            >
              <FileText size={10} className={doc.id === activeDocId ? 'text-gray-600' : 'text-gray-400'} />
              <span className="max-w-[100px] truncate">{doc.name}</span>
              {saveStatus === 'editing' && doc.id === activeDocId && (
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              )}
              {documents.length > 1 && (
                <button
                  onClick={(e) => closeDoc(doc.id, e)}
                  className="ml-0.5 p-0.5 rounded hover:bg-gray-300/60 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={createNewDoc}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
            title="New Document"
          >
            <FilePlus size={12} />
          </button>
          {!showDocSidebar && (
            <button
              onClick={() => setShowDocSidebar(true)}
              className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
              title="Show Documents"
            >
              <FolderOpen size={12} />
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-100 px-2 py-1.5 shrink-0 flex-wrap">
          {/* File operations */}
          <div className="flex items-center gap-0.5 mr-2">
            <button
              onClick={createNewDoc}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/60 transition-colors"
              title="New Document"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
            <button
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/60 transition-colors"
              title="Open Document"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open</span>
            </button>
            <button
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/60 transition-colors"
              title="Save Document"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          {/* Font selector */}
          <div className="relative" ref={fontMenuRef}>
            <button
              onClick={() => {
                setShowFontMenu(!showFontMenu);
                setShowSizeMenu(false);
                setShowColorPicker(false);
                setShowColorSwatch(false);
              }}
              className="flex items-center gap-1 rounded-md bg-white border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm min-w-[110px]"
              title="Select Font"
            >
              <Type className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{activeDoc.fontName}</span>
              <svg className="h-3 w-3 text-gray-400 shrink-0 ml-auto" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showFontMenu && (
              <div className="absolute top-full left-0 mt-1 z-50 max-h-64 w-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl custom-scrollbar">
                {FONT_LIST.map((font) => (
                  <button
                    key={font}
                    onClick={() => {
                      updateDoc(activeDocId, { fontName: font });
                      setShowFontMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-blue-50 transition-colors ${
                      activeDoc.fontName === font ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                    style={{ fontFamily: font === 'System UI' ? 'system-ui, -apple-system, sans-serif' : `'${font}', sans-serif` }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font size */}
          <div className="relative" ref={sizeMenuRef}>
            <button
              onClick={() => {
                setShowSizeMenu(!showSizeMenu);
                setShowFontMenu(false);
                setShowColorPicker(false);
                setShowColorSwatch(false);
              }}
              className="flex items-center gap-1 rounded-md bg-white border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm min-w-[52px]"
              title="Font Size"
            >
              <span>{activeDoc.fontSize}</span>
              <svg className="h-3 w-3 text-gray-400 shrink-0 ml-auto" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showSizeMenu && (
              <div className="absolute top-full left-0 mt-1 z-50 w-16 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl custom-scrollbar">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      updateDoc(activeDocId, { fontSize: size });
                      setShowSizeMenu(false);
                    }}
                    className={`w-full px-2 py-1 text-center text-[12px] hover:bg-blue-50 transition-colors ${
                      activeDoc.fontSize === size ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          {/* Bold / Italic / Underline */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => updateDoc(activeDocId, { isBold: !activeDoc.isBold })}
              className={`rounded p-1.5 transition-colors ${
                activeDoc.isBold
                  ? 'bg-gray-300/80 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
              }`}
              title="Bold (⌘B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => updateDoc(activeDocId, { isItalic: !activeDoc.isItalic })}
              className={`rounded p-1.5 transition-colors ${
                activeDoc.isItalic
                  ? 'bg-gray-300/80 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
              }`}
              title="Italic (⌘I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => updateDoc(activeDocId, { isUnderline: !activeDoc.isUnderline })}
              className={`rounded p-1.5 transition-colors ${
                activeDoc.isUnderline
                  ? 'bg-gray-300/80 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
              }`}
              title="Underline (⌘U)"
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            {[
              { align: 'left' as const, Icon: AlignLeft, title: 'Align Left' },
              { align: 'center' as const, Icon: AlignCenter, title: 'Align Center' },
              { align: 'right' as const, Icon: AlignRight, title: 'Align Right' },
              { align: 'justify' as const, Icon: AlignJustify, title: 'Justify' },
            ].map(({ align, Icon, title }) => (
              <button
                key={align}
                onClick={() => updateDoc(activeDocId, { textAlign: align })}
                className={`rounded p-1.5 transition-colors ${
                  activeDoc.textAlign === align
                    ? 'bg-gray-300/80 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
                }`}
                title={title}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          {/* Text color swatch */}
          <div className="relative" ref={colorSwatchRef}>
            <button
              onClick={() => {
                setShowColorSwatch(!showColorSwatch);
                setShowFontMenu(false);
                setShowSizeMenu(false);
                setShowColorPicker(false);
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/60 transition-colors"
              title="Text Color"
            >
              <div
                className="h-4 w-4 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: activeDoc.textColor }}
              />
              <span className="hidden sm:inline">Color</span>
            </button>
            {showColorSwatch && (
              <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        updateDoc(activeDocId, { textColor: color });
                        setShowColorSwatch(false);
                      }}
                      className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-110 ${
                        activeDoc.textColor === color ? 'border-gray-800 ring-1 ring-gray-400 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extended color picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowFontMenu(false);
                setShowSizeMenu(false);
                setShowColorSwatch(false);
              }}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/60 transition-colors"
              title="More Colors"
            >
              <Palette className="h-3.5 w-3.5" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeDoc.textColor}
                    onChange={(e) => updateDoc(activeDocId, { textColor: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-gray-200"
                  />
                  <span className="text-[10px] text-gray-500 font-mono">{activeDoc.textColor}</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          {/* Find button */}
          <button
            onClick={() => {
              setShowFindBar(!showFindBar);
              if (!showFindBar) setTimeout(() => findInputRef.current?.focus(), 50);
            }}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
              showFindBar ? 'bg-gray-300/80 text-gray-900' : 'text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/60'
            }`}
            title="Find and Replace (⌘F)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Find</span>
          </button>
        </div>

        {/* Find and Replace Bar */}
        {showFindBar && (
          <div className="flex items-center gap-2 border-b border-gray-200 bg-[#f8f8f8] px-3 py-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
              <Search size={12} className="text-gray-400 flex-shrink-0" />
              <input
                ref={findInputRef}
                type="text"
                value={findText}
                onChange={(e) => { setFindText(e.target.value); setFindMatchIndex(1); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') findNext();
                }}
                placeholder="Find..."
                className="flex-1 px-2 py-1 text-[11px] bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 min-w-0"
              />
              {findText && (
                <span className="text-[10px] text-gray-400 whitespace-nowrap tabular-nums">
                  {findMatchCount > 0 ? `${findMatchIndex} of ${findMatchCount}` : 'No matches'}
                </span>
              )}
              <button
                onClick={findNext}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Find Next"
              >
                <ChevronDown size={12} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
              <Replace size={12} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace..."
                className="flex-1 px-2 py-1 text-[11px] bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 min-w-0"
              />
              <button
                onClick={handleReplace}
                className="px-2 py-1 text-[10px] text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                className="px-2 py-1 text-[10px] text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                All
              </button>
            </div>
            <button
              onClick={() => {
                setShowFindBar(false);
                setFindText('');
                setReplaceText('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Ruler / Margin area */}
        <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-12 py-0.5 shrink-0">
          <div className="h-px flex-1 bg-gray-200 relative">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0"
                style={{ left: `${(i / 20) * 100}%` }}
              >
                <div className={`w-px ${i % 5 === 0 ? 'h-2 bg-gray-400' : 'h-1 bg-gray-300'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-hidden min-h-0 px-12 py-4">
          <textarea
            ref={editorRef}
            value={activeDoc.text}
            onChange={handleTextChange}
            className="h-full w-full resize-none focus:outline-none leading-relaxed"
            style={{
              fontFamily: fontFamilyStyle,
              fontSize: `${activeDoc.fontSize}px`,
              fontWeight: activeDoc.isBold ? 'bold' : 'normal',
              fontStyle: activeDoc.isItalic ? 'italic' : 'normal',
              textDecoration: activeDoc.isUnderline ? 'underline' : 'none',
              textAlign: activeDoc.textAlign,
              color: activeDoc.textColor,
              caretColor: activeDoc.textColor,
            }}
            spellCheck
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-1 shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>Words: {wordCount()}</span>
            <span>Characters: {charCount}</span>
            <span className="flex items-center gap-1">
              {saveStatus === 'saved' ? (
                <>
                  <Check size={10} className="text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              ) : (
                <>
                  <Loader2 size={10} className="text-amber-500 animate-spin" />
                  <span className="text-amber-600">Editing...</span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>{activeDoc.fontName}</span>
            <span>•</span>
            <span>{activeDoc.fontSize}pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
