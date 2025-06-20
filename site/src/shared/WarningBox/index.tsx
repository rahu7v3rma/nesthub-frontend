import React, { useCallback, useRef } from 'react';

export interface WarningMessageProps {
  message: string;
  countdown?: number;
  isAuthPage?: boolean;
  setShowWarning?: (value: boolean) => void; // Expecting a function that takes a boolean
}

const WarningBox: React.FC<WarningMessageProps> = ({
  message,
  countdown = 0,
  isAuthPage = false,
  setShowWarning,
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDismiss = () => {
    localStorage.removeItem('showWarning');

    if (setShowWarning) {
      setShowWarning(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[999]"></div>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 shadow-lg z-[1000] rounded-3xl w-96 bg-[rgb(216,216,216)]">
        <p className="text-xl font-semibold text-center my-2">Warning!</p>

        <p className="text-md text-center my-4">{message}</p>

        <hr className="my-6 border-t-2 border-[rgb(165,170,178)]" />

        {isAuthPage ? (
          <>
            <button
              className="text-center text-blue-700 w-full"
              onClick={handleDismiss}
            >
              OK
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Auto logout in:{' '}
              <span className="font-bold text-red-600">
                {formatTime(countdown)}
              </span>
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default WarningBox;
