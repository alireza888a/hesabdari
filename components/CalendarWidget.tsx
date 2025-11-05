import React, { useState, useMemo } from 'react';

// --- START: Jalali Calendar Logic ---
// A self-contained, standard, and accurate Jalali calendar implementation.

/**
 * Integer division
 */
const div = (a: number, b: number): number => {
  return Math.floor(a / b);
};

/**
 * Converts a Gregorian date to a Jalali date.
 * @param gy Gregorian year.
 * @param gm Gregorian month (1-12).
 * @param gd Gregorian day.
 * @returns An object { jy, jm, jd } for Jalali year, month, and day.
 */
const gregorianToJalali = (gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } => {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + div(gy2, 4) - div(gy2, 100) + div(gy2, 400) + g_d_m[gm - 1] + gd - 79;
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  jy += div(days - 1, 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = (days < 186) ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { jy, jm, jd };
};


/**
 * Converts a Jalali date to a Gregorian JS Date object.
 * @param jy Jalali year.
 * @param jm Jalali month (1-12).
 * @param jd Jalali day.
 * @returns A JavaScript Date object.
 */
const jalaliToGregorian = (jy: number, jm: number, jd: number): Date => {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  let days = (365 * jy) + (div(jy, 33) * 8) + div((jy % 33 + 3), 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  gy += div(days - 1, 365);
  if (days > 365) days = (days - 1) % 365;
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return new Date(gy, gm - 1, gd);
};

/**
 * Checks if a given Jalali year is a leap year using the 33-year cycle approximation.
 * @param year The Jalali year.
 * @returns True if the year is a leap year.
 */
const isLeapJalali = (year: number): boolean => {
  const remainder = year % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(remainder);
};

/**
 * Returns the number of days in a specific Jalali month.
 * @param year The Jalali year (needed for Esfand).
 * @param month The Jalali month (1-12).
 * @returns The number of days in the month.
 */
const getDaysInJalaliMonth = (year: number, month: number): number => {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  if (month === 12) return isLeapJalali(year) ? 30 : 29;
  return 0;
};

// --- END: Jalali Calendar Logic ---

const JALALI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];
const DAYS_OF_WEEK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// Helper to convert JS Date to Jalali object
const convertDateToJalali = (date: Date) => {
    return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

interface CalendarWidgetProps {
    onDateSelect?: (date: { jy: number; jm: number; jd: number }) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onDateSelect }) => {
  const [today] = useState(convertDateToJalali(new Date()));
  const [viewDate, setViewDate] = useState({ year: today.jy, month: today.jm });

  const changeMonth = (amount: number) => {
    setViewDate(current => {
      let newMonth = current.month + amount;
      let newYear = current.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      return { year: newYear, month: newMonth };
    });
  };
  
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInJalaliMonth(viewDate.year, viewDate.month);
    const firstDayOfMonthG = jalaliToGregorian(viewDate.year, viewDate.month, 1);
    
    // JS .getDay() -> Sun:0, Mon:1, ..., Sat:6
    // We want Sat:0, Sun:1, ...
    const firstDayOfWeek = (firstDayOfMonthG.getDay() + 1) % 7;

    const grid = [];

    // Add empty placeholders for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push({
        day: 0, // Value doesn't matter
        isCurrentMonth: false
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({ day: i, isCurrentMonth: true });
    }
    
    return grid;

  }, [viewDate]);
  
  const monthName = JALALI_MONTH_NAMES[viewDate.month - 1];
  const year = new Intl.NumberFormat('fa-IR').format(viewDate.year);
  const isDatePicker = !!onDateSelect;


  return (
    <div className={`bg-white p-6 rounded-2xl shadow-md h-full ${isDatePicker ? 'border' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">تقویم</h2>
        <div className="flex items-center">
          <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
          <span className="w-32 text-center font-semibold text-sm text-[var(--color-primary-start)]">{monthName} {year}</span>
          <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {DAYS_OF_WEEK.map(day => {
          const greenDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ'];
          const isRed = day === 'ج';
          
          let colorClass;
          if (greenDays.includes(day)) {
            colorClass = 'bg-gradient-to-br from-green-400 to-green-600';
          } else if (isRed) {
            colorClass = 'bg-gradient-to-br from-red-500 to-red-700';
          } else {
            colorClass = 'bg-gradient-to-br from-[var(--color-primary-start)] to-[var(--color-primary-end)]';
          }

          return (
            <div
              key={day}
              className={`flex items-center justify-center h-9 w-9 mx-auto rounded-full text-white font-bold text-sm ${colorClass}`}
            >
              {day}
            </div>
          );
        })}
        {calendarGrid.map((d, index) => {
          if (!d.isCurrentMonth) {
            return <div key={index} className="h-9 w-9" />;
          }
          const isToday = d.isCurrentMonth && d.day === today.jd && viewDate.month === today.jm && viewDate.year === today.jy;
          
          const commonClasses = "flex items-center justify-center h-9 w-9 mx-auto rounded-full text-sm transition-colors duration-150";
          const todayClasses = 'bg-gradient-to-br from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white font-bold shadow-lg';
          const regularDayClasses = `text-gray-700 ${isDatePicker ? 'hover:bg-gray-200' : 'hover:bg-gray-100'}`;

          if (isDatePicker) {
            return (
              <button
                type="button"
                key={index}
                onClick={() => onDateSelect({ jy: viewDate.year, jm: viewDate.month, jd: d.day })}
                className={`${commonClasses} ${isToday ? todayClasses : regularDayClasses}`}
              >
                {new Intl.NumberFormat('fa-IR').format(d.day)}
              </button>
            )
          }

          return (
            <div
              key={index}
              className={`${commonClasses} ${ isToday ? todayClasses : regularDayClasses }`}
            >
              {new Intl.NumberFormat('fa-IR').format(d.day)}
            </div>
          )}
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;