---
Task ID: 12-b
Agent: Features Addition Agent
Task: Add window snapping, About This Mac dialog, enhanced Notification Center, desktop icon drag & drop

Work Log:
- Read worklog.md and all referenced files (Window.tsx, AboutThisMac.tsx, NotificationCenter.tsx, DesktopIcons.tsx, macos-store.ts, page.tsx)
- Feature 1: Window Snapping
  - Added `snapPosition?: 'left' | 'right' | null` to WindowState interface in macos-store.ts
  - Added `snapWindow(windowId, position)` action to store: saves prevBounds, sets position/size for left/right half snap
  - Added `unsnapWindow(windowId)` action to store: restores prevBounds, clears snapPosition
  - Modified Window.tsx drag handler: during drag, checks if mouse is within 20px of screen edges (SNAP_ZONE_SIZE)
  - Added `snapPreview` state: 'left' | 'right' | 'top' | null — tracks which snap zone mouse is near
  - Added visual snap preview overlay (semi-transparent blue rectangle with border) that appears while dragging near edges
  - On mouse up: if in top zone → maximizeWindow, if in left zone → snapWindow('left'), if in right zone → snapWindow('right')
  - Snapped windows: hide resize handles, remove rounded corners, double-click title bar unsnaps instead of maximizing
  - Unsnapping: when dragging a snapped window, first unsnaps and restores prevBounds, then allows free drag
  - Green traffic light button unsnaps if window is snapped
- Feature 2: About This Mac Dialog Enhancement
  - Replaced plain dialog with macOS Sonoma-styled dialog featuring wallpaper gradient background
  - Top section: Sonoma gradient (deep purple → magenta → orange → gold), large white Apple logo, "macOS Sonoma" title, "Version 14.5" subtitle
  - Info section: light #f5f5f7 background, MacBook Pro with laptop icon, 2-column spec grid (Chip: Apple M3 Pro, Memory: 18 GB, Serial Number: C02ZXXXXXX, macOS: Sonoma 14.5)
  - Bottom section: System Report... and Software Update... buttons with blue link styling
  - Close button repositioned to top-left with translucent white background
  - Wider dialog (540px) matching real macOS proportions, improved shadow
- Feature 3: Enhanced Notification Center
  - Added ClockWidget: real-time clock with 1s interval, large 48px extralight time, date string, Clock icon
  - Added WeatherWidget: temperature display (72°), Cupertino location, humidity/wind/UV stats, H/L temperatures
  - Added CalendarWidget: mini calendar with current month, day headers, today highlighted with red circle, previous/next month days dimmed
  - Added RemindersWidget: 3 sample reminders with colored circles, done/undone states, strikethrough for completed
  - Added ScreenTimeWidget: 5h 23m display, 7-day bar chart with Saturday highlighted, weekly comparison
  - All widgets use frosted glass styling: bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] rounded-xl
  - Calendar and Reminders widgets in side-by-side row layout
  - Added "Edit Widgets" button at bottom with Pencil icon
  - Notifications section preserved below widgets
- Feature 4: Desktop Icon Drag & Drop
  - Icons now use absolute positioning with stored positions (positions state Record<string, {x, y}>)
  - Default positions: right-aligned, top to bottom with 90px vertical grid
  - MouseDown starts drag tracking, 5px movement threshold before drag begins
  - During drag: icon scales to 1.08x with elevated shadow (8px 20px), z-index 50
  - On drop: snaps to 100px horizontal, 90px vertical grid
  - Double-click opens Finder (preserved), single click selects
  - Used didDragRef to prevent double-click from firing after a drag
  - Window resize resets positions to defaults
- All lint checks pass cleanly
- Dev server compiles 200 OK

Stage Summary:
- **Window Snapping**: Drag to screen edges shows blue preview overlay; left/right snap to 50% screen; top snap maximizes; unsnapping restores previous size; snapped windows have no rounded corners or resize handles
- **About This Mac**: Sonoma gradient wallpaper background, MacBook Pro with 2-column spec grid (M3 Pro, 18GB, Serial), proper System Report/Software Update buttons, 540px wide dialog
- **Notification Center**: 5 new widgets (Clock, Weather, Calendar, Reminders, Screen Time) with frosted glass styling, Edit Widgets button at bottom
- **Desktop Icons**: Full drag & drop with grid snapping (100x90px), scale+shadow feedback during drag, double-click preserved for opening apps
- No breaking changes to existing functionality
