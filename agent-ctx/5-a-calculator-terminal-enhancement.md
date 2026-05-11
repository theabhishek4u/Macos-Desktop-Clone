# Task 5-a: Calculator & Terminal Enhancement Agent

## Task Description
Enhance two macOS desktop apps: Calculator (Scientific Mode + Memory Functions) and Terminal (new commands, tab completion, styling improvements).

## Work Completed

### Calculator Enhancements (`/src/components/macos/apps/Calculator.tsx`)
- **Scientific Mode Toggle**: Small button at top-left switches between "◁ Basic" and "Scientific ▷"
- **Scientific Buttons** (3 rows above basic calculator):
  - Row 1: sin, cos, tan, π
  - Row 2: log, ln, √, x²
  - Row 3: (, ), e, xʸ
- **Scientific Functions**:
  - sin/cos/tan: Apply Math.sin/cos/tan (radians) to current display value
  - π: Insert Math.PI, e: Insert Math.E
  - log: Math.log10, ln: Math.log
  - √: Math.sqrt, x²: square the value
  - xʸ: power function (Math.pow)
  - Parentheses tracking with openParens state and visual indicator
- **Memory Functions**: MC, MR, M+, M-
  - Basic mode: row above display
  - Scientific mode: compact row above scientific buttons
  - Memory indicator "M" when non-zero
- **Responsive Layout**: Buttons resize smaller in scientific mode (44px height, tighter gaps)

### Terminal Enhancements (`/src/components/macos/apps/Terminal.tsx`)
- **New Commands**:
  - `hostname` → "MacBook-Pro.local"
  - `cowsay <msg>` → ASCII cow with word-wrapped speech bubble
  - `fortune` → Random quote from 15 programming quotes
  - `matrix` → 4 lines of katakana + "Wake up, Neo..."
  - `uname -a` → Full Darwin kernel info string
- **Improved echo**: Handles single/double quotes properly
- **Tab Completion**:
  - First word: completes from command names
  - Subsequent words: completes from current directory entries
  - Multiple matches shown below prompt
  - Directories get trailing "/" suffix
- **Command History**: Verified Up/Down arrow cycling works
- **Styling**:
  - Font: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace
  - Prompt: green user@MacBook-Pro, blue directory path
  - Blinking cursor with CSS animation
  - Updated title bar text

## Verification
- `bun run lint` passes cleanly
- Dev server compiles 200 OK
- Worklog updated with full details
