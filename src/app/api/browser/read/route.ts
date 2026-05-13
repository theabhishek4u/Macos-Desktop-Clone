import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const result = await zai.functions.invoke('page_reader', {
      url: url,
    })

    return NextResponse.json({
      success: true,
      data: {
        title: result.data?.title || '',
        url: result.data?.url || url,
        html: result.data?.html || '',
        publishedTime: result.data?.publishedTime || '',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
