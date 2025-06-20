'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useEffect } from 'react';
import OTPInput from 'react-otp-input';
import { toast } from 'react-toastify';

import { ROUTES } from '@/constants';
import { verifyOtp, sendOtp } from '@/services/api';
import Button from '@/shared/Button';
import Text from '@/shared/Text';

import styles from './page.module.css';

const OTPVerification: React.FC = () => {
  const OTP_LENGTH = 6;
  const OTP_RESEND_TIMER_SECONDS = 20;

  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [timer, setTimer] = useState(OTP_RESEND_TIMER_SECONDS);

  const handleChange = (otp: string) => {
    setOtp(otp);
  };

  const handleSubmit = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    try {
      await verifyOtp(otp);
      router.push(ROUTES.applications);
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    }
  }, [otp, router]);

  const handleResendOtp = async () => {
    try {
      await sendOtp();
      toast.success('OTP resent successfully');
      setIsResendEnabled(false);
      setTimer(OTP_RESEND_TIMER_SECONDS);
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      setIsResendEnabled(true);
    }
  }, [timer]);

  return (
    <div className="flex flex-col items-center">
      <Text className="!text-3xl !font-black !text-navy_blue">Verify OTP</Text>
      <p className="text-gray-500 mt-2">
        Please enter the 6-digit code sent to your email
      </p>

      <div className="my-5">
        <OTPInput
          value={otp}
          onChange={handleChange}
          numInputs={OTP_LENGTH}
          inputType="number"
          renderInput={(props) => (
            <input
              {...props}
              className="!w-12 h-12 my-0 mx-2 text-2xl border border-solid border-[#ddd] rounded text-center appearance-none"
            />
          )}
        />
      </div>

      <Button
        disabled={otp.length !== OTP_LENGTH}
        onClick={handleSubmit}
        className={`w-[100%] mt-2 rounded-xl h-12 ${
          otp.length === OTP_LENGTH
            ? 'bg-[#ED6943]'
            : 'bg-[#ED6943] opacity-50 cursor-not-allowed'
        }`}
      >
        Verify OTP
      </Button>

      {/* Resend OTP Link */}
      <div className="mt-4">
        {isResendEnabled ? (
          <button onClick={handleResendOtp} className="text-blue-500 text-sm">
            Resend OTP
          </button>
        ) : (
          <span className="text-gray-500 text-sm">
            Resend OTP in {timer} seconds
          </span>
        )}
      </div>
      <div className="mt-2">
        <button
          onClick={() => {
            router.push(ROUTES.signin);
          }}
          className="text-blue-500 text-sm"
        >
          Go back to Login
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
