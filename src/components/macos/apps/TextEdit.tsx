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

const FONT_SIZES = [9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

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

export default function TextEdit() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [fontName, setFontName] = useState('System UI');
  const [fontSize, setFontSize] = useState(14);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [textColor, setTextColor] = useState('#000000');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const wordCount = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [text]);

  const charCount = text.length;

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const fontFamilyStyle = fontName === 'System UI' ? 'system-ui, -apple-system, sans-serif' : `'${fontName}', sans-serif`;

  const PRESET_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-100 px-2 py-1.5 shrink-0">
        {/* File operations */}
        <div className="flex items-center gap-0.5 mr-2">
          <button
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
            }}
            className="flex items-center gap-1 rounded-md bg-white border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm min-w-[110px]"
            title="Select Font"
          >
            <Type className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="truncate">{fontName}</span>
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
                    setFontName(font);
                    setShowFontMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-blue-50 transition-colors ${
                    fontName === font ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
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
            }}
            className="flex items-center gap-1 rounded-md bg-white border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm min-w-[52px]"
            title="Font Size"
          >
            <span>{fontSize}</span>
            <svg className="h-3 w-3 text-gray-400 shrink-0 ml-auto" viewBox="0 0 12 12" fill="none">
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 max-h-56 w-16 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl custom-scrollbar">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setFontSize(size);
                    setShowSizeMenu(false);
                  }}
                  className={`w-full px-2 py-1 text-center text-[12px] hover:bg-blue-50 transition-colors ${
                    fontSize === size ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
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
            onClick={() => setIsBold(!isBold)}
            className={`rounded p-1.5 transition-colors ${
              isBold
                ? 'bg-gray-300/80 text-gray-900'
                : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
            }`}
            title="Bold (⌘B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`rounded p-1.5 transition-colors ${
              isItalic
                ? 'bg-gray-300/80 text-gray-900'
                : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
            }`}
            title="Italic (⌘I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={`rounded p-1.5 transition-colors ${
              isUnderline
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
          <button
            onClick={() => setTextAlign('left')}
            className={`rounded p-1.5 transition-colors ${
              textAlign === 'left'
                ? 'bg-gray-300/80 text-gray-900'
                : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTextAlign('center')}
            className={`rounded p-1.5 transition-colors ${
              textAlign === 'center'
                ? 'bg-gray-300/80 text-gray-900'
                : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTextAlign('right')}
            className={`rounded p-1.5 transition-colors ${
              textAlign === 'right'
                ? 'bg-gray-300/80 text-gray-900'
                : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
            }`}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTextAlign('justify')}
            className={`rounded p-1.5 transition-colors ${
              textAlign === 'justify'
                ? 'bg-gray-300/80 text-gray-900'
                : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 active:bg-gray-300/60'
            }`}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-300 mx-1" />

        {/* Color picker */}
        <div className="relative" ref={colorPickerRef}>
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowFontMenu(false);
              setShowSizeMenu(false);
            }}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/60 transition-colors"
            title="Text Color"
          >
            <Palette className="h-3.5 w-3.5" />
            <span
              className="h-4 w-4 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: textColor }}
            />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
              <div className="grid grid-cols-10 gap-1 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setTextColor(color);
                    }}
                    className={`h-5 w-5 rounded-sm border transition-transform hover:scale-125 ${
                      textColor === color ? 'border-gray-800 ring-1 ring-gray-400 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
                <span className="text-[10px] text-gray-500">Custom:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border border-gray-200"
                />
                <span className="text-[10px] text-gray-500 font-mono">{textColor}</span>
              </div>
            </div>
          )}
        </div>
      </div>

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
          value={text}
          onChange={handleTextChange}
          className="h-full w-full resize-none focus:outline-none leading-relaxed"
          style={{
            fontFamily: fontFamilyStyle,
            fontSize: `${fontSize}px`,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
            textAlign,
            color: textColor,
            caretColor: textColor,
          }}
          spellCheck
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-1 shrink-0">
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span>Words: {wordCount()}</span>
          <span>Characters: {charCount}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span>{fontName}</span>
          <span>•</span>
          <span>{fontSize}pt</span>
        </div>
      </div>
    </div>
  );
}
