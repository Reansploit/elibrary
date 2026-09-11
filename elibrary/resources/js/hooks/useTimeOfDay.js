/**
 * Returns the current time-of-day period.
 *
 * @returns {'morning' | 'afternoon' | 'evening' | 'night'}
 */
export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

/**
 * useTimeOfDay — reactive hook that returns the current period
 * and updates every N minutes.
 */
import { useState, useEffect } from 'react';

export function useTimeOfDay(intervalMs = 60_000) {
  const [period, setPeriod] = useState(getTimeOfDay);

  useEffect(() => {
    const id = setInterval(() => setPeriod(getTimeOfDay()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return period;
}

/**
 * Theme descriptor for each time-of-day period.
 */
const themeMap = {
  morning: {
    label: 'Pagi',
    filter: 'hue-rotate(-8deg) saturate(1.08) brightness(1.03)',
    overlay: 'rgba(255, 200, 100, 0.04)',
    backgroundColor: '#F0ECF9',
  },
  afternoon: {
    label: 'Siang',
    filter: 'none',
    overlay: 'transparent',
    backgroundColor: '#F3F1F8',
  },
  evening: {
    label: 'Sore',
    filter: 'hue-rotate(8deg) saturate(1.03) brightness(0.97)',
    overlay: 'rgba(255, 150, 50, 0.06)',
    backgroundColor: '#EDE8F5',
  },
  night: {
    label: 'Malam',
    filter: 'hue-rotate(25deg) brightness(0.8) saturate(0.85)',
    overlay: 'rgba(30, 30, 80, 0.08)',
    backgroundColor: '#1A1A2E',
  },
};

export function getTimeTheme(period) {
  return themeMap[period] || themeMap.afternoon;
}
