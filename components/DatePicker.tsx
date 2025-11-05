import React, { useState, useRef, useEffect } from 'react';
import CalendarWidget from './CalendarWidget';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleDateSelect = (date: { jy: number; jm: number; jd: number }) => {
    const formattedDate = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date(date.jy, date.jm -1, date.jd));

    setSelectedDate(formattedDate);
    setIsOpen(false);
  };
  
  const handleInputClick = () => {
      setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={selectedDate}
          onClick={handleInputClick}
          readOnly
          placeholder="تاریخ را انتخاب کنید"
          className="w-full bg-gray-50 rounded-lg py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-start)] cursor-pointer"
        />
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 z-20 w-full min-w-[340px] right-0">
          <CalendarWidget onDateSelect={handleDateSelect} />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
