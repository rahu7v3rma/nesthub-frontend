import { COMMON } from '@/utils/common';

export const getFullImageUrl = (relativePath: string | null): string => {
  if (!relativePath) {
    return '/avatar.png';
  }

  if (
    relativePath.startsWith('http://') ||
    relativePath.startsWith('https://')
  ) {
    return relativePath;
  }

  if (relativePath.startsWith('/media/')) {
    return `/api${relativePath}`;
  }

  try {
    const url = new URL(COMMON.apiBaseUrl);
    const origin = url.origin;
    return `${origin}${relativePath}`;
  } catch (e) {
    console.warn(
      'Could not parse COMMON.apiBaseUrl for origin, using fallback strategy. Original URL:',
      COMMON.apiBaseUrl,
    );
    const baseUrl = COMMON.apiBaseUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${relativePath}`;
  }
};
