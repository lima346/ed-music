import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format') || 'mp3';

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '');

    const options = format === 'mp4' 
      ? { filter: (format: any) => format.container === 'mp4' && format.hasAudio && format.hasVideo }
      : { filter: 'audioonly', quality: 'highestaudio' };

    const stream = ytdl(url, options as any);

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${title}.${format}"`);
    headers.set('Content-Type', format === 'mp4' ? 'video/mp4' : 'audio/mpeg');

    // Convert Node.js stream to Web stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(webStream, { headers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao processar o vídeo' }, { status: 500 });
  }
}
