import { deleteOTPVerified } from './otp';

export const setAuthToken = (token: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof document !== 'undefined') {
      document.cookie = `authToken=${token};path=/;secure;samesite=strict`;
    }
    resolve(true);
  });
};

export const getAuthToken = (): Promise<string | null> => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; authToken=`);
  const cookie =
    parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
  return Promise.resolve(cookie);
};

export const AUTHORIZATION_HEADER_NAME = 'X-Authorization';

export const constructAuthorizationHeaderValue = (token: string | null) =>
  `Token ${token || ''}`;

export const getAuthorizationHeaderValue = async () => {
  try {
    const authToken = await getAuthToken();
    return constructAuthorizationHeaderValue(authToken);
  } catch {
    return undefined;
  }
};

export const resetAuthToken = async () => {
  await deleteOTPVerified();
  document.cookie =
    'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
};
