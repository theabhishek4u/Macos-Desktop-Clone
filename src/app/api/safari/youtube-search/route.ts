import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  const numParam = request.nextUrl.searchParams.get('num')
  const num = numParam ? Math.min(parseInt(numParam) || 10, 20) : 10

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    // Search specifically for YouTube videos - use broader query without site: prefix
    // to get more results, then filter for YouTube URLs
    const youtubeQuery = `${query.trim()} youtube video`
    const results = await zai.functions.invoke('web_search', {
      query: youtubeQuery,
      num: Math.min(num * 2, 20), // Request more to filter down
    })

    const formatted = Array.isArray(results)
      ? results
          .filter((item: { url?: string }) => {
            const url = (item.url ?? '').toLowerCase()
            return url.includes('youtube.com/watch') || url.includes('youtu.be/')
          })
          .slice(0, num) // Limit to requested number
          .map((item: { url?: string; name?: string; snippet?: string; host_name?: string; rank?: number; date?: string; favicon?: string }) => {
            const url = item.url ?? ''
            // Extract video ID
            let videoId = ''
            try {
              if (url.includes('youtu.be/')) {
                const parts = url.split('youtu.be/')
                videoId = parts[1]?.split(/[?&#]/)[0] ?? ''
              } else {
                const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url)
                videoId = urlObj.searchParams.get('v') ?? ''
                if (!videoId) {
                  const match = url.match(/\/watch\/([^/?]+)/)
                  videoId = match?.[1] ?? ''
                }
              }
            } catch {
              videoId = ''
            }

            return {
              videoId,
              url,
              title: (item.name ?? '').replace(/ - YouTube$/, ''),
              snippet: item.snippet ?? '',
              hostName: item.host_name ?? 'youtube.com',
              rank: item.rank ?? 0,
              date: item.date ?? '',
              thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '',
              channelName: (item.name ?? '').includes(' - ') ? (item.name ?? '').split(' - ').slice(-1)[0].replace(' YouTube', '').trim() : '',
            }
          })
      : []

    return NextResponse.json({ results: formatted, query: query.trim() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'YouTube search failed'
    console.error('YouTube search error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
