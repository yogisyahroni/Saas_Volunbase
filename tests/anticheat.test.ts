import { describe, it, expect } from 'vitest';
import { isStarterEventDayLimitViolated } from '@/lib/utils';

describe('anti-cheat helper', () => {
  it('returns false when only current event exists in day window', () => {
    const found = [{ eventId: 'E1' }];
    expect(isStarterEventDayLimitViolated(found, 'E1')).toBe(false);
  });

  it('returns true when another event exists same day', () => {
    const found = [{ eventId: 'E1' }, { eventId: 'E2' }];
    expect(isStarterEventDayLimitViolated(found, 'E1')).toBe(true);
  });
});

