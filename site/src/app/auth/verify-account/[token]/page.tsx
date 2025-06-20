'use client';

import { usePathname, useRouter as useRouterNavigation } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

import { ROUTES } from '@/constants';
import { verifyAccount } from '@/services/api';

import ResendEmail from './../_components/ResendEmail';

export default function VerifyEmailToken() {
  const navigation = useRouterNavigation();
  const pathname = usePathname();

  useEffect(() => {
    const token = pathname.substring(pathname.lastIndexOf('/') + 1);
    if (token) {
      verifyAccount(token)
        .then(() => {
          toast.success('Email verified successfully.');
          navigation.replace(ROUTES.signin);
        })
        .catch((error) => {
          console.error('Verification error:', error);
          toast.error('Token is expired or invalid.');
          navigation.replace(ROUTES.signin);
        });
    }
  }, [navigation, pathname]);

  return <ResendEmail />;
}
