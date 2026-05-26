# macOS Desktop Clone

A fully functional macOS desktop clone built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, and **shadcn/ui**. Features 20+ interactive applications, realistic window management, dock with magnification, and authentic macOS styling.

![macOS Desktop Clone](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## Features

### Desktop Environment
- Realistic macOS Sonoma wallpaper with gradient
- Interactive dock with magnification effect and bounce animations
- Menu bar with app-specific menus
- Desktop icons (Macintosh HD, Documents, Downloads, Pictures)
- Right-click context menu
- Spotlight search (Cmd+Space)
- Mission Control (F11/Cmd+F3)
- Login/Boot screen with auto-login
- Dark Mode toggle
- Cmd+Tab app switcher
- Global keyboard shortcuts

### Window Management
- Draggable and resizable windows
- Traffic light buttons (close, minimize, maximize) with hover icons
- Window shadows with active/inactive states
- Light and dark window chrome variants
- Minimize-to-dock animation
- Smooth maximize transitions

### Applications (20+)

| App | Features |
|-----|----------|
| **Safari** | Tabbed browser, bookmarks, search, YouTube embed support |
| **Chrome** | Full browser with tabs, search, bookmarks |
| **Finder** | Column view, file operations, image/video preview |
| **System Preferences** | 21 preference panes, Dark Mode toggle |
| **Calculator** | Basic/Scientific modes, exact macOS colors |
| **Notes** | Rich text editing, folders, search |
| **Terminal** | Command history, tab completion, themed prompts |
| **Calendar** | Month/Week views, drag-to-create, categories |
| **Music** | Player, playlists, lyrics, queue, shuffle/repeat |
| **Photos** | Albums, grid view, zoom, detail view |
| **Weather** | Animated icons, hourly forecast, SVG graphs |
| **Clock** | World Clock, Alarm, Stopwatch, Timer |
| **Maps** | SVG map, directions, nearby places, zoom |
| **Reminders** | Smart lists, priorities, subtasks, flags |
| **TextEdit** | Document tabs, find/replace, font size, auto-save |
| **Apple TV** | Movie browser, categories, detail view |
| **App Store** | Featured apps, categories, search |
| **FaceTime** | Call interface, contacts, recent calls |
| **Messages** | Chat interface, conversations, emoji |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Space` | Spotlight Search |
| `Cmd+W` | Close Window |
| `Cmd+M` | Minimize Window |
| `Cmd+N` | New Finder Window |
| `Cmd+Q` | Quit App |
| `Cmd+Tab` | App Switcher |
| `Cmd+,` | System Preferences |
| `F11` / `Cmd+F3` | Mission Control |
| `Ctrl+←/→` | Navigate Windows |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Prisma ORM (SQLite)
- **Fonts**: SF Pro Display / SF Pro Text

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Open in browser
open http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main desktop composition
│   └── layout.tsx            # Root layout
├── components/
│   ├── macos/
│   │   ├── Window.tsx        # Window chrome & management
│   │   ├── Dock.tsx          # Dock with magnification
│   │   ├── MenuBar.tsx       # Top menu bar
│   │   ├── Desktop.tsx       # Desktop with wallpaper
│   │   ├── Spotlight.tsx     # Spotlight search
│   │   ├── MissionControl.tsx # Mission Control overlay
│   │   ├── LoginScreen.tsx   # Login/Boot screen
│   │   └── KeyboardShortcuts.tsx # Global shortcuts
│   ├── apps/
│   │   ├── Safari.tsx
│   │   ├── Chrome.tsx
│   │   ├── Finder.tsx
│   │   ├── SystemPreferences.tsx
│   │   ├── Calculator.tsx
│   │   └── ... (20+ apps)
│   └── ui/                   # shadcn/ui components
├── store/
│   └── macos-store.ts        # Zustand state management
└── lib/
    └── utils.ts              # Utility functions
```

## License

MIT
