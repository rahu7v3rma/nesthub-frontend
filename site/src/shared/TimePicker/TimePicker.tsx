import { useState, useRef, useEffect, useCallback } from 'react';
import { FaRegClock } from 'react-icons/fa6';

type TimePickerProps = {
  value?: string | null;
  onChange: (value: string) => void;
};

const hours = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, '0'),
);
const minutes = [
  '00',
  '05',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
];
const periods = ['AM', 'PM'];

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [hourInput, setHourInput] = useState('');
  const [minuteInput, setMinuteInput] = useState('');
  const [periodInput, setPeriodInput] = useState('');

  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLInputElement>(null);

  const formatTimeString = useCallback(
    (hour: string, minute: string, period: string) => {
      if (!hour || !minute || !period) return '';

      let hourNum = parseInt(hour, 10);
      if (period === 'PM' && hourNum < 12) {
        hourNum += 12;
      } else if (period === 'AM' && hourNum === 12) {
        hourNum = 0;
      }

      return `${hourNum.toString().padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    },
    [],
  );

  useEffect(() => {
    const timeString = formatTimeString(hourInput, minuteInput, periodInput);
    if (timeString) {
      onChange(timeString);
    }
  }, [hourInput, minuteInput, periodInput, formatTimeString, onChange]);

  useEffect(() => {
    if (value) {
      // Parse the "HH:mm:ss" format
      const [hourStr, minuteStr] = value.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = minuteStr;

      // Convert to 12-hour format for display
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      const period = hour >= 12 ? 'PM' : 'AM';

      setHourInput(displayHour.toString().padStart(2, '0'));
      setMinuteInput(minute);
      setPeriodInput(period);
    } else {
      setHourInput('');
      setMinuteInput('');
      setPeriodInput('');
    }
  }, [value]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHourSelect = (hour: string) => {
    setHourInput(hour);
  };

  const handleMinuteSelect = (minute: string) => {
    setMinuteInput(minute);
  };

  const handlePeriodSelect = (period: string) => {
    setPeriodInput(period);
    setIsOpen(false);
  };

  const validateAndSetHour = (val: string) => {
    const numVal = parseInt(val, 10);
    if (val === '' || (numVal >= 1 && numVal <= 12)) {
      setHourInput(val);
      if (val.length === 2) minuteRef.current?.focus();
    }
  };

  const validateAndSetMinute = (val: string) => {
    const numVal = parseInt(val, 10);
    if (val === '' || (numVal >= 0 && numVal <= 59)) {
      setMinuteInput(val);
      if (val.length === 2) periodRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="w-full flex flex-col gap-2">
        <label className="text-medium text-foreground">Time</label>
        <div className="relative">
          <div className="flex items-center gap-2 bg-gray-100 px-3 w-full min-h-12 h-12 rounded-full">
            <div className="flex items-center gap-1 w-full text-gray-900">
              <input
                ref={hourRef}
                type="text"
                value={hourInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 2) {
                    validateAndSetHour(val);
                  }
                }}
                placeholder="--"
                maxLength={2}
                className="w-8 bg-transparent text-center outline-none text-medium font-normal text-gray-500 placeholder-gray-400"
              />
              <span className="text-gray-400">:</span>
              <input
                ref={minuteRef}
                type="text"
                value={minuteInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 2) {
                    validateAndSetMinute(val);
                  }
                }}
                placeholder="--"
                maxLength={2}
                className="w-8 bg-transparent text-center outline-none text-medium font-normal text-gray-500 placeholder-gray-400"
              />
              <input
                ref={periodRef}
                type="text"
                value={periodInput}
                onChange={(e) => {
                  const val = e.target.value
                    .toUpperCase()
                    .replace(/[^APM]/g, '');
                  if (val.length <= 2) {
                    setPeriodInput(val);
                  }
                }}
                placeholder="AM"
                maxLength={2}
                className="w-10 bg-transparent text-center outline-none text-medium font-normal text-gray-500 placeholder-gray-400"
              />
            </div>
            <FaRegClock
              className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-700 transition-colors duration-200"
              onClick={() => setIsOpen((prev) => !prev)}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-gray-100 border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-3">
            <div className="flex justify-between space-x-3 max-h-32">
              {/* Hours Column */}
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 mb-2 text-center">
                  Hour
                </div>
                <div className="overflow-y-auto max-h-24 scrollbar-hide">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      onClick={() => handleHourSelect(hour)}
                      className={`py-1.5 px-2 cursor-pointer text-center text-sm rounded-lg transition-all duration-150 ${
                        hourInput === hour
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 mb-2 text-center">
                  Min
                </div>
                <div className="overflow-y-auto max-h-24 scrollbar-hide">
                  {minutes.map((minute) => (
                    <div
                      key={minute}
                      onClick={() => handleMinuteSelect(minute)}
                      className={`py-1.5 px-2 cursor-pointer text-center text-sm rounded-lg transition-all duration-150 ${
                        minuteInput === minute
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {minute}
                    </div>
                  ))}
                </div>
              </div>

              {/* Period Column */}
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 mb-2 text-center">
                  Period
                </div>
                <div className="space-y-1">
                  {periods.map((period) => (
                    <div
                      key={period}
                      onClick={() => handlePeriodSelect(period)}
                      className={`py-1.5 px-2 cursor-pointer text-center text-sm rounded-lg transition-all duration-150 ${
                        periodInput === period
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
