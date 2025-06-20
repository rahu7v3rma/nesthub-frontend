'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, FormEvent, useRef } from 'react';

import { setPasswordVerify, setPasswordConfirm } from '@/services/api';
import Button from '@/shared/Button';
import Input from '@/shared/Input';

export default function SetPasswordRedirectPage() {
  const params = useParams();
  const router = useRouter();

  const token = typeof params?.token === 'string' ? params.token : '';

  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null,
  );
  const [passwordSetSuccess, setPasswordSetSuccess] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerRedirect = (path: string, delay: number = 3000) => {
    setIsRedirecting(true);
    const destination = path === '/auth/signin' ? 'sign in page' : 'homepage';
    setRedirectMessage(
      `You will be redirected to the ${destination} shortly...`,
    );

    // Clear any existing timeout before setting a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      router.push(path);
    }, delay);
  };

  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage('This password reset link seems invalid or incomplete.');
        setMessageType('error');
        setIsTokenValid(false);
        setIsLoading(false);
        triggerRedirect('/'); // Redirect on invalid token in URL
        return;
      }

      setIsLoading(true);
      setMessage(null);
      setMessageType(null);
      setIsTokenValid(false);
      setIsRedirecting(false);
      setRedirectMessage(null);

      try {
        const result = await setPasswordVerify(token);
        if (result && result.success) {
          setIsTokenValid(true);
          setMessage(null);
        } else {
          setMessage('This password reset link is invalid or has expired.');
          setMessageType('error');
          setIsTokenValid(false);
          triggerRedirect('/'); // Redirect on verification fail
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setMessage(
          'An error occurred while verifying the link. Please try again later or request a new link.',
        );
        setMessageType('error');
        setIsTokenValid(false);
        triggerRedirect('/'); // Redirect on verification error
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password || !isTokenValid || passwordSetSuccess || isRedirecting) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setMessageType(null);
    setIsRedirecting(false);
    setRedirectMessage(null);

    try {
      const result = await setPasswordConfirm(password, token);
      if (result && result.success) {
        setPasswordSetSuccess(true);
        setMessage('Your password has been set successfully!');
        setMessageType('success');
        setPassword('');
        triggerRedirect('/auth/signin'); // Redirect on success
      } else {
        setMessage('Failed to set your new password. Please try again.');
        setMessageType('error');
        triggerRedirect('/'); // Redirect on set password fail
      }
    } catch (error) {
      console.error('Set password error:', error);
      setMessage(
        'An unexpected error occurred while setting your password. Please try again.',
      );
      setMessageType('error');
      triggerRedirect('/'); // Redirect on set password error
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageClasses = () => {
    if (!message) return 'hidden';
    let baseClasses = 'p-3 mb-6 rounded-lg text-sm text-center w-full';
    if (messageType === 'success') {
      return `${baseClasses} bg-green-100 text-green-700 border border-green-200`;
    }
    if (messageType === 'error') {
      return `${baseClasses} bg-red-100 text-red-700 border border-red-200`;
    }
    return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
  };

  const renderContent = () => {
    // Show loading spinner only during initial token verification
    if (isLoading && !isTokenValid && !message && !isRedirecting) {
      return <p className="text-gray-600 p-4 text-center">Verifying link...</p>;
    }

    // Show messages and redirection info if redirecting or if there's a final message
    if (message || isRedirecting) {
      return (
        <div className="text-center w-full flex flex-col items-center">
          {message && <div className={getMessageClasses()}>{message}</div>}
          {redirectMessage && (
            <p className="text-gray-600 text-sm mt-2">{redirectMessage}</p>
          )}
        </div>
      );
    }

    // Only show form if token is valid and not currently submitting/redirecting
    if (isTokenValid && !passwordSetSuccess && !isRedirecting) {
      return (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6 w-full"
        >
          <Input
            label="New Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Enter your new password"
            disabled={isLoading || passwordSetSuccess || isRedirecting}
            className="w-full h-[48px]"
          />
          <Button
            type="submit"
            isLoading={isLoading} // Show spinner only when submitting password
            disabled={
              isLoading ||
              !password ||
              password.length < 8 ||
              passwordSetSuccess ||
              isRedirecting
            }
            className="w-full max-w-xs h-[48px] bg-[#2D2C31] rounded-[48px] text-[13px] font-bold uppercase text-white mt-2"
          >
            Set New Password
          </Button>
        </form>
      );
    }

    // Fallback should ideally not be reached if logic covers all states
    return <p className="text-gray-500 text-center">Loading interface...</p>;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-16 md:pt-20 px-4">
      <main className="w-full flex justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center">
          <h1 className="text-2xl font-semibold mb-8 text-center text-gray-800">
            Set Your Password
          </h1>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
