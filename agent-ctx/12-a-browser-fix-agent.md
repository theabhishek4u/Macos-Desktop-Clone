# Task 12-a: Safari & Chrome Browser Fix Agent

## Summary
Fixed and improved Safari and Chrome browser apps to enable actual web browsing and YouTube video playback.

## Key Changes

### Safari.tsx (Complete Rewrite)
- Added working search input on start page (previously non-functional)
- Created YouTubeBrowseView component with video grid, thumbnails, and YouTube search
- Smart YouTube detection: searches containing "youtube" or "video" auto-route to YouTube search API
- YouTube homepage (youtube.com) shows YouTube browse view with trending videos
- YouTube videos play via youtube.com/embed/ URLs in iframes (which work!)
- Added YouTubeSearchResult type with videoId, thumbnail, channelName
- Added `youtube-browse` PageType
- Safari now uses /api/safari/search and /api/safari/read endpoints
- Search results with YouTube video URLs show red play icon

### Chrome.tsx (Complete Rewrite)
- Same YouTube browse view integration
- Smart YouTube search detection
- YouTube homepage shows browse view
- New tab page differentiates URLs from search queries
- Search results page has editable search bar
- WebPageContent sanitizes HTML (removes scripts, iframes, event handlers)
- handlePlayYouTubeVideo and handleYouTubeSearch callbacks

### API Routes (No Changes)
- /api/safari/search — web search using z-ai-web-dev-sdk
- /api/safari/read — page reader using z-ai-web-dev-sdk
- /api/safari/youtube-search — YouTube-specific search with video IDs and thumbnails
- /api/browser/search and /api/browser/read — Chrome uses these

## Files Modified
- /src/components/macos/apps/Safari.tsx
- /src/components/macos/apps/Chrome.tsx

## Files NOT Modified
- macos-store.ts, page.tsx, any API routes, any other components
