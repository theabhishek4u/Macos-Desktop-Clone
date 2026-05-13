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

    const results = await zai.functions.invoke('web_search', {
      query: query.trim(),
      num,
    })

    const formatted = Array.isArray(results)
      ? results.map((item: { url?: string; name?: string; snippet?: string; host_name?: string; rank?: number; date?: string; favicon?: string }) => ({
          url: item.url ?? '',
          title: item.name ?? '',
          snippet: item.snippet ?? '',
          hostName: item.host_name ?? '',
          rank: item.rank ?? 0,
          date: item.date ?? '',
          favicon: item.favicon ?? '',
        }))
      : []

    return NextResponse.json({ results: formatted, query: query.trim() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed'
    console.error('Safari search error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
