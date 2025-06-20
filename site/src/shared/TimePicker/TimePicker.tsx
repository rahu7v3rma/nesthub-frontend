import { useState, useRef, useEffect } from 'react';
import { FaRegClock } from 'react-icons/fa6';

type TimePickerProps = {
  value?: string | null; // Expecting format "HH:mm:ss"
  onChange: (value: string) => void; // Will return "HH:mm:ss"
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

  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const [hourInput, setHourInput] = useState('');
  const [minuteInput, setMinuteInput] = useState('');
  const [periodInput, setPeriodInput] = useState('');

  const [hasUserSelected, setHasUserSelected] = useState(false);

  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLInputElement>(null);

  // Convert current inputs to output format
  const formatTimeString = (hour: string, minute: string, period: string) => {
    if (!hour || !minute || !period) return '';

    let hourNum = parseInt(hour, 10);
    if (period === 'PM' && hourNum < 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }

    return `${hourNum.toString().padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  };

  // Trigger onChange when inputs change
  useEffect(() => {
    const timeString = formatTimeString(hourInput, minuteInput, periodInput);
    if (timeString) {
      onChange(timeString);
    }
  }, [hourInput, minuteInput, periodInput]);

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

  const openDropdown = () => {
    setSelectedHour(null);
    setSelectedMinute(null);
    setSelectedPeriod(null);
    setHasUserSelected(false);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (hasUserSelected) {
      const h = selectedHour ?? hourInput;
      const m = selectedMinute ?? minuteInput;
      const p = selectedPeriod ?? periodInput;

      const newTime = formatTimeString(h, m, p);
      if (newTime) {
        onChange(newTime);
        setHourInput(h);
        setMinuteInput(m);
        setPeriodInput(p);
      }
    }
    setIsOpen(false);
  };

  const getHighlight = (
    val: string,
    input: string,
    selected: string | null,
  ) => {
    return selected === val || (!selected && input === val);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="w-full flex flex-col gap-[0.375rem]">
        <label className="text-[1rem] text-gray-600 font-medium">Time</label>
        <div className="flex items-center gap-2 bg-gray-100 px-3 w-full min-h-12 h-12 rounded-full">
          <div className="flex items-center gap-1 w-full">
            <input
              ref={hourRef}
              type="text"
              value={hourInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 2) {
                  setHourInput(val);
                  if (val.length === 2) minuteRef.current?.focus();
                }
              }}
              placeholder="--"
              maxLength={2}
              className="w-8 bg-transparent text-center outline-none"
            />
            :
            <input
              ref={minuteRef}
              type="text"
              value={minuteInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 2) {
                  setMinuteInput(val);
                  if (val.length === 2) periodRef.current?.focus();
                }
              }}
              placeholder="--"
              maxLength={2}
              className="w-8 bg-transparent text-center outline-none"
            />
            <input
              ref={periodRef}
              type="text"
              value={periodInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^APM]/g, '');
                if (val.length <= 2) {
                  setPeriodInput(val);
                }
              }}
              placeholder="AM"
              maxLength={2}
              className="w-10 bg-transparent text-center outline-none"
            />
          </div>
          <FaRegClock
            className="w-5 h-5 text-gray-400 cursor-pointer"
            onClick={() => setIsOpen((prev) => !prev)}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute mt-2 w-full bg-gray-100 text-gray-500 rounded-lg shadow-xl p-4"
          style={{ zIndex: '1000' }}
        >
          <div className="flex justify-between space-x-4 overflow-hidden max-h-[9rem]">
            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory text-center">
              {hours.map((hour) => (
                <div
                  key={hour}
                  onClick={() => {
                    setSelectedHour(hour);
                    setHasUserSelected(true);
                  }}
                  className={`py-2 snap-start cursor-pointer ${
                    getHighlight(hour, hourInput, selectedHour)
                      ? 'bg-blue-500 text-white rounded'
                      : ''
                  }`}
                >
                  {hour}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory text-center">
              {minutes.map((minute) => (
                <div
                  key={minute}
                  onClick={() => {
                    setSelectedMinute(minute);
                    setHasUserSelected(true);
                  }}
                  className={`py-2 snap-start cursor-pointer ${
                    getHighlight(minute, minuteInput, selectedMinute)
                      ? 'bg-blue-500 text-white rounded'
                      : ''
                  }`}
                >
                  {minute}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory text-center">
              {periods.map((period) => (
                <div
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setHasUserSelected(true);
                  }}
                  className={`py-2 snap-start cursor-pointer ${
                    getHighlight(period, periodInput, selectedPeriod)
                      ? 'bg-blue-500 text-white rounded'
                      : ''
                  }`}
                >
                  {period}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-300 mt-4 text-sm">
            <button onClick={() => setIsOpen(false)} className="text-blue-400">
              CANCEL
            </button>
            <button onClick={handleConfirm} className="text-blue-400 font-bold">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
