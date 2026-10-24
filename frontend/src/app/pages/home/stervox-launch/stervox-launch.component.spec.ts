import { countdownDigits, countdownParts, STERVOX_RELEASE_AT } from './stervox-launch.component';

describe('Stervox launch countdown', () => {
  const values = (at: number) => countdownParts(at).map((part) => part.value);

  it('changes only the individual digits that need to flip', () => {
    expect(countdownDigits(28, 29).map((digit) => digit.changed)).toEqual([false, true]);
    expect(countdownDigits(19, 20).map((digit) => digit.changed)).toEqual([true, true]);
    expect(countdownDigits(3, 3).map((digit) => digit.changed)).toEqual([false, false]);
  });

  it('uses the absolute 5 January 2027 UK deadline', () => {
    expect(STERVOX_RELEASE_AT).toBe(Date.parse('2027-01-05T00:00:00Z'));
    expect(values(Date.parse('2026-10-24T00:00:00Z'))).toEqual([73, 0, 0, 0]);
    expect(values(Date.parse('2026-10-24T00:00:01Z'))).toEqual([72, 23, 59, 59]);
  });

  it('borrows correctly across hours and minutes without accumulating elapsed ticks', () => {
    expect(values(STERVOX_RELEASE_AT - 3_600_000)).toEqual([0, 1, 0, 0]);
    expect(values(STERVOX_RELEASE_AT - 3_599_000)).toEqual([0, 0, 59, 59]);
    expect(values(STERVOX_RELEASE_AT - 60_000)).toEqual([0, 0, 1, 0]);
    expect(values(STERVOX_RELEASE_AT - 59_000)).toEqual([0, 0, 0, 59]);
  });

  it('rounds partial seconds up and never displays negative time after the deadline', () => {
    expect(values(STERVOX_RELEASE_AT - 1)).toEqual([0, 0, 0, 1]);
    expect(values(STERVOX_RELEASE_AT)).toEqual([0, 0, 0, 0]);
    expect(values(STERVOX_RELEASE_AT + 86_400_000)).toEqual([0, 0, 0, 0]);
  });
});
