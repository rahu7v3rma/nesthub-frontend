'use client';

import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

import { verifyAccountRequest } from '@/services/api';
import Button from '@/shared/Button';
import SupportText from '@/shared/SupportText';
import Text from '@/shared/Text';

const ResendEmail: React.FC = () => {
  const resendEmailHandler = useCallback(() => {
    const unverifiedAuthToken = localStorage.getItem('unverifiedAuthToken');
    if (unverifiedAuthToken) {
      verifyAccountRequest(unverifiedAuthToken)
        .then(() => toast.success('Resend link successfully'))
        .catch(() =>
          toast.error('Oops, something went wrong. Please try again later.'),
        );
    }
  }, []);

  return (
    <div className="px-4 md:px-[15%] flex items-center">
      <div className="flex flex-col items-center">
        <Text
          color="text-black"
          variant="h2"
          weight="bold"
          className={`leading-[32.5px] mb-[15px] text-[25px]`}
        >
          Verify your email
        </Text>
        <Text
          color="text-[#6C8093]"
          align="center"
          className={`text-[17px] leading-[22.24px] mb-[30px]`}
        >
          Please check your email and click the link to activate your NH account
        </Text>
        {/* <Button
          onClick={resendEmailHandler}
          className="!font-bold text-[17px] mb-[30px] leading-[22.24px] bg-[#ED6943]"
        >
          Resend link
        </Button> */}
        <SupportText />
      </div>
    </div>
  );
};

export default ResendEmail;
