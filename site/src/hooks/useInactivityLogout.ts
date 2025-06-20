import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityLogoutProps {
  warningTime?: number;
  logoutTime?: number;
  onLogout: () => void;
  onWarning: () => void;
}

const useInactivityLogout = ({
  warningTime = 25 * 60 * 1000, // 25 minutes
  logoutTime = 30 * 60 * 1000, // 30 minutes
  onLogout,
  onWarning,
}: UseInactivityLogoutProps) => {
  const warningTimeoutRef = useRef<number | null>(null);
  const logoutTimeoutRef = useRef<number | null>(null);

  const resetTimers = useCallback(() => {
    if (warningTimeoutRef.current !== null) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (logoutTimeoutRef.current !== null) {
      clearTimeout(logoutTimeoutRef.current);
    }

    warningTimeoutRef.current = window.setTimeout(() => {
      onWarning();
    }, warningTime);

    logoutTimeoutRef.current = window.setTimeout(() => {
      onLogout();
    }, logoutTime);
  }, [warningTime, logoutTime, onLogout, onWarning]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimers();

    events.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );

    resetTimers();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );

      if (warningTimeoutRef.current !== null) {
        clearTimeout(warningTimeoutRef.current);
      }

      if (logoutTimeoutRef.current !== null) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, [resetTimers]);

  return { resetTimers };
};

export default useInactivityLogout;
