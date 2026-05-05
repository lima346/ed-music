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
    console.log(`[Download] Iniciando processamento: ${url} (Formato: ${format})`);
    
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim() || 'video';

    console.log(`[Download] Vídeo encontrado: ${title}`);

    const options: ytdl.downloadOptions = format === 'mp4' 
      ? { 
          quality: 'highestvideo',
          filter: (f) => f.container === 'mp4' && f.hasAudio && f.hasVideo 
        }
      : { 
          quality: 'highestaudio',
          filter: 'audioonly' 
        };

    const stream = ytdl.downloadFromInfo(info, options);

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.${format}"`);
    headers.set('Content-Type', format === 'mp4' ? 'video/mp4' : 'audio/mpeg');

    // Convert Node.js stream to Web stream with better chunk handling
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => {
          console.error('[Download Stream Error]', err);
          controller.error(err);
        });
      },
      cancel() {
        stream.destroy();
      }
    });

    return new NextResponse(webStream, { headers });
  } catch (error: any) {
    console.error('[Download Error]', error);
    return NextResponse.json({ 
      error: 'Erro ao processar o vídeo', 
      details: error.message 
    }, { status: 500 });
  }
}
