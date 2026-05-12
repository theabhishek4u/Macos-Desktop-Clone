# Task 13-b: Enhanced Terminal, Spotlight, and Control Center

## Summary
Enhanced three macOS desktop simulation components with significant new functionality.

## Changes Made

### 1. Terminal.tsx — Major Enhancement
- **13+ new commands**: cp, mv, grep (with regex highlighting), man (20+ pages), curl, ping, df -h, which, env, export, history
- **Pipe support**: `ls | grep pattern`, `cat file | sort`, `command | wc`, `command | head/tail`, `command | uniq`
- **Environment variables**: Full system with default vars, `export VAR=value`, `$VAR` expansion in echo
- **Command history**: Up/Down arrow navigation with savedInput preservation when navigating
- **Color-coded output**: Directories in blue (#5ac8fa), executables in green (#28c840), errors in red, grep matches highlighted
- **File system**: Added .bash_profile, executable flag on app.js
- **Manual pages**: 20+ formatted man pages with blue section headers

### 2. Spotlight.tsx — Major Enhancement
- **4 search categories**: Applications, Documents, System Preferences, Suggestions
- **AppIcon component**: Colored rounded-square backgrounds with white Lucide icons
- **Calculator**: Math expression evaluation (2+2, 5*3, etc.) shown at top of results
- **System Preferences**: 14 searchable preference panes with descriptions
- **Web suggestions**: "Search the web for..." and "Search Wikipedia for..."
- **Better result styling**: Icon + title + description + category badge per result
- **Clear button**: X button in search bar
- **Improved empty state**: Helpful text when no results found

### 3. ControlCenter.tsx — Major Enhancement
- **Screen Mirroring toggle**: New toggle tile with Airplay icon
- **Keyboard Brightness slider**: New slider with keyboard icons
- **Sound output selector**: Dropdown for Internal Speakers / AirPods Pro
- **Display brightness**: Slider with sun icons (SunDim low, Sun high)
- **Gradient slider fills**: Dynamic gradient fill based on value
- **Compact styling**: Smaller icons, rounded-[14px] cards, tighter spacing
- **Now Playing**: Compact card with gradient album art

## Files Modified
- `/home/z/my-project/src/components/macos/apps/Terminal.tsx`
- `/home/z/my-project/src/components/macos/Spotlight.tsx`
- `/home/z/my-project/src/components/macos/ControlCenter.tsx`
- `/home/z/my-project/worklog.md`

## Verification
- Lint passes cleanly (0 errors, 0 warnings)
- Dev server compiles 200 OK
