import { RecurringFrequency } from '../types';

const div = (a: number, b: number): number => Math.floor(a / b);

export const gregorianToJalali = (gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } => {
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

export const jalaliToGregorian = (jy: number, jm: number, jd: number): Date => {
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

const formatJalali = (jy: number, jm: number, jd: number): string => {
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
};

export const getTodayJalali = (): string => {
    const today = new Date();
    const { jy, jm, jd } = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return formatJalali(jy, jm, jd);
};

export const getNextRunDate = (currentRunDate: string, frequency: RecurringFrequency, interval: number): string => {
    const [year, month, day] = currentRunDate.split('/').map(Number);
    let newMonth = month;
    let newYear = year;

    if (frequency === RecurringFrequency.Monthly) {
        newMonth += interval;
        while (newMonth > 12) {
            newMonth -= 12;
            newYear++;
        }
    } else if (frequency === RecurringFrequency.Yearly) {
        newYear += interval;
    }

    return formatJalali(newYear, newMonth, day);
};

export const getFuturePersianMonths = (count: number): { year: number; month: number; name: string }[] => {
    const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    try {
        const todayParts = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/');
        let currentYear = parseInt(todayParts[0], 10);
        let currentMonth = parseInt(todayParts[1], 10);

        const months = [];
        for (let i = 0; i < count; i++) {
            const monthIndex = currentMonth - 1;
            months.push({ year: currentYear, month: currentMonth, name: monthNames[monthIndex] });

            currentMonth++;
            if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
            }
        }
        return months;
    } catch(e) {
        return [];
    }
};

export const getPastPersianMonths = (count: number): { year: number; month: number; name: string }[] => {
    const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    try {
        const todayParts = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/');
        let currentYear = parseInt(todayParts[0], 10);
        let currentMonth = parseInt(todayParts[1], 10);

        const months = [];
        for (let i = 0; i < count; i++) {
            const monthIndex = currentMonth - 1;
            months.push({ year: currentYear, month: currentMonth, name: monthNames[monthIndex] });

            currentMonth--;
            if (currentMonth === 0) {
                currentMonth = 12;
                currentYear--;
            }
        }
        return months;
    } catch(e) {
        return [];
    }
};
