import { once } from 'lodash';

const warnLocalBackend = once(() =>
  console.warn('Working with a local backend'),
);

export const COMMON = {
  get apiBaseUrl() {
    if (process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
      return process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    } else {
      warnLocalBackend();
      return 'http://127.0.0.1:8000/';
    }
  },
  stringFormat(s: string, ...args: (number | string)[]) {
    return s.replace(/{([0-9]+)}/g, (match, index) =>
      (typeof args[index] === 'undefined' ? match : args[index]).toString(),
    );
  },
  jsonToUrlParams(json: any) {
    return Object.keys(json)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(json[key]),
      )
      .join('&');
  },
  cleanupTest(text: string) {
    let cleanedText = text.replace(/<\/?[^>]+(>|$)/g, '');
    cleanedText = cleanedText.replace(/&[^;]+;/g, '');
    return cleanedText.trim();
  },
};

/**
 * Returns the last tax year based on whether the user has children.
 */
export const getLastTaxYear = (hasChildren: boolean): number => {
  return hasChildren ? 2024 : 2023;
};
