# Task 2-a: Safari Real Web Capabilities

## Summary
Made the Safari browser app fully functional with real web capabilities.

## Files Created
- `/src/app/api/safari/search/route.ts` — API route for web search using z-ai-web-dev-sdk
- `/src/app/api/safari/read/route.ts` — API route for page reading using z-ai-web-dev-sdk

## Files Modified
- `/src/components/macos/apps/Safari.tsx` — Complete rewrite with real web capabilities

## Key Changes

### 1. API Routes (Backend)
- **`/api/safari/search`**: GET endpoint, params `q` (query) and `num` (max results), uses `zai.functions.invoke('web_search', ...)`
- **`/api/safari/read`**: GET endpoint, param `url`, uses `zai.functions.invoke('page_reader', ...)`
- Both use dynamic `import('z-ai-web-dev-sdk')` to keep it server-side only

### 2. Safari.tsx Frontend (Complete Rewrite)
- **Smart URL detection**: `isUrl()` checks for protocol, TLDs, localhost to distinguish search vs URL
- **Real web search**: Non-URL input → calls `/api/safari/search` → Google-like results page
- **Real page reading**: URL input → calls `/api/safari/read` → renders extracted content
- **YouTube iframe embedding**: Detects youtube.com/youtu.be URLs → extracts video ID → embeds iframe
- **Reader Mode**: Toggle in URL bar switches to serif-font clean reading view
- **Back/Forward navigation**: Per-tab history stack, re-fetches content on navigation
- **Preserved features**: FaviconIcon, bookmarks bar, favorites grid, tabs, tab overview, loading progress

### 3. Testing
- Search API verified: `GET /api/safari/search?q=test&num=3` returns real results
- Read API verified: `GET /api/safari/read?url=https://en.wikipedia.org/wiki/Test` returns 282KB content
- Safari.tsx lint passes cleanly
- Dev server compiles 200 OK
