import { Track } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function durationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

function extractArtist(title: string, channelTitle: string): string {
  const separators = [' - ', ' – ', ' — ', ' | ', ' // '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      return title.split(sep)[0].trim();
    }
  }
  return channelTitle.replace(/ - Topic$/, '').replace(/VEVO$/i, '').trim();
}

function cleanTitle(title: string): string {
  const separators = [' - ', ' – ', ' — ', ' | ', ' // '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep);
      parts.shift();
      return parts.join(sep)
        .replace(/\(Official.*?\)/gi, '')
        .replace(/\[Official.*?\]/gi, '')
        .replace(/\(Lyrics.*?\)/gi, '')
        .replace(/\[Lyrics.*?\]/gi, '')
        .replace(/\(Audio.*?\)/gi, '')
        .replace(/\[Audio.*?\]/gi, '')
        .replace(/\(Visualizer.*?\)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }
  return title
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\[Official.*?\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function searchYouTube(
  query: string,
  pageToken?: string,
  maxResults: number = 20
): Promise<{ tracks: Track[]; nextPageToken?: string; totalResults: number }> {
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: `${query} music`,
    type: 'video',
    videoCategoryId: '10',
    maxResults: maxResults.toString(),
    key: API_KEY || '',
    ...(pageToken ? { pageToken } : {}),
  });

  const searchRes = await fetch(`${BASE_URL}/search?${searchParams}`);
  if (!searchRes.ok) throw new Error('YouTube search failed');
  const searchData = await searchRes.json();

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  const detailsParams = new URLSearchParams({
    part: 'contentDetails,snippet',
    id: videoIds,
    key: API_KEY || '',
  });

  const detailsRes = await fetch(`${BASE_URL}/videos?${detailsParams}`);
  if (!detailsRes.ok) throw new Error('YouTube details failed');
  const detailsData = await detailsRes.json();

  const tracks: Track[] = detailsData.items
    .filter((item: any) => {
      const seconds = durationToSeconds(item.contentDetails.duration);
      return seconds > 30 && seconds < 900;
    })
    .map((item: any) => ({
      id: item.id,
      title: cleanTitle(item.snippet.title),
      artist: extractArtist(item.snippet.title, item.snippet.channelTitle),
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: parseDuration(item.contentDetails.duration),
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
    }));

  return {
    tracks,
    nextPageToken: searchData.nextPageToken,
    totalResults: searchData.pageInfo.totalResults,
  };
}

export async function getTrendingMusic(): Promise<Track[]> {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: '10',
    regionCode: 'BR',
    maxResults: '30',
    key: API_KEY || '',
  });

  const res = await fetch(`${BASE_URL}/videos?${params}`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data = await res.json();

  return data.items
    .filter((item: any) => {
      const seconds = durationToSeconds(item.contentDetails.duration);
      return seconds > 30 && seconds < 900;
    })
    .map((item: any) => ({
      id: item.id,
      title: cleanTitle(item.snippet.title),
      artist: extractArtist(item.snippet.title, item.snippet.channelTitle),
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: parseDuration(item.contentDetails.duration),
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
    }));
}

export async function getRelatedVideos(videoId: string): Promise<Track[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    relatedToVideoId: videoId,
    type: 'video',
    videoCategoryId: '10',
    maxResults: '15',
    key: API_KEY || '',
  });

  try {
    const searchRes = await fetch(`${BASE_URL}/search?${params}`);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();

    const videoIds = searchData.items
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => item.id.videoId)
      .join(',');

    if (!videoIds) return [];

    const detailsParams = new URLSearchParams({
      part: 'contentDetails,snippet',
      id: videoIds,
      key: API_KEY || '',
    });

    const detailsRes = await fetch(`${BASE_URL}/videos?${detailsParams}`);
    if (!detailsRes.ok) return [];
    const detailsData = await detailsRes.json();

    return detailsData.items
      .filter((item: any) => {
        const seconds = durationToSeconds(item.contentDetails.duration);
        return seconds > 30 && seconds < 900;
      })
      .map((item: any) => ({
        id: item.id,
        title: cleanTitle(item.snippet.title),
        artist: extractArtist(item.snippet.title, item.snippet.channelTitle),
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        duration: parseDuration(item.contentDetails.duration),
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
      }));
  } catch {
    return [];
  }
}
