# Task 13-a: Safari & Window Chrome Polish Agent

## Summary
Enhanced Safari app visual fidelity with pill-shaped tabs matching real macOS Safari, and polished Window chrome across all apps with improved title bar gradients, traffic lights, and inactive state handling.

## Files Modified
- `src/components/macos/apps/Safari.tsx` — Pill-shaped tabs, improved start page, bookmarks bar polish, URL bar enhancement
- `src/components/macos/Window.tsx` — Title bar gradient, traffic light refinement, inactive dimming, LIGHT_WINDOW_APPS update

## Key Changes

### Safari.tsx
1. **Pill-shaped tabs**: Replaced rectangular tabs with rounded-rectangle pill shapes (active: white bg + shadow, inactive: gray bg), moved tab bar above toolbar
2. **Start page**: Added SF Pro Display font, prominent search bar, macOS-style gradient background, refined favicon containers with better spacing
3. **Bookmarks bar**: Pill-shaped hover backgrounds (rounded-full), consistent 11.5px font
4. **URL bar**: Rounded-lg with multi-layered shadow, focus glow, better placeholder text

### Window.tsx
1. **Title bar gradient**: Subtle top-to-bottom gradient for both light and dark windows, active and inactive variants
2. **Traffic lights**: 12px buttons with 3D depth shadows, improved hover area padding
3. **Inactive state**: More noticeable dimming (opacity-85 + saturate-[0.85]), lighter title text
4. **LIGHT_WINDOW_APPS**: Added 'maps' and 'reminders'

## Lint Status
- Both modified files pass lint cleanly
- Dev server compiles 200 OK
