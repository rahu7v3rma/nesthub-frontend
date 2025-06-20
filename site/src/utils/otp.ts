'use server';

import { cookies } from 'next/headers';

const OTP_VERIFIED_KEY = 'isOTPVerified';

/**
 * Helper function to set the OTP verification status in Next.js cookies.
 */
export const setOTPVerified = async (isVerified: boolean) => {
  const cookieStore = await cookies();

  cookieStore.set(OTP_VERIFIED_KEY, String(isVerified), {
    path: '/',
    httpOnly: true,
  });
};

/**
 * Helper function to get the OTP verification status from Next.js cookies.
 */
export const getOTPVerified = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const otpVerifiedCookie = cookieStore.get(OTP_VERIFIED_KEY);
  return otpVerifiedCookie?.value === 'true';
};

/**
 * Helper function to delete the OTP verification status from cookies.
 */
export const deleteOTPVerified = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(OTP_VERIFIED_KEY);
};
