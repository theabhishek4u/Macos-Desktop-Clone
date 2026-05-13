import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || url.trim().length === 0) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  // Validate URL format
  let targetUrl = url.trim()
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl
  }

  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const result = await zai.functions.invoke('page_reader', {
      url: targetUrl,
    })

    const data = result?.data ?? result

    return NextResponse.json({
      title: data.title ?? '',
      url: data.url ?? targetUrl,
      html: data.html ?? '',
      publishedTime: data.publishedTime ?? '',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to read page'
    console.error('Safari read error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
