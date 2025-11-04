import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isStarterEventDayLimitViolated(found: Array<{ eventId?: string }>, currentEventId: string) {
  return found.some((s) => s.eventId && s.eventId !== currentEventId);
}
