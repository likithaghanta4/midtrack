/**
 * Converts a numerical mark (0 to 30) into examination capital words standard
 * e.g.,
 * 30 -> "THREE ZERO"
 * 27 -> "TWO SEVEN"
 * 29 -> "TWO NINE"
 * 25.5 -> "TWO FIVE POINT FIVE"
 * 8 -> "ZERO EIGHT"
 * 0 -> "ZERO ZERO"
 */

const DIGIT_WORDS: { [key: string]: string } = {
  '0': 'ZERO',
  '1': 'ONE',
  '2': 'TWO',
  '3': 'THREE',
  '4': 'FOUR',
  '5': 'FIVE',
  '6': 'SIX',
  '7': 'SEVEN',
  '8': 'EIGHT',
  '9': 'NINE',
  '.': 'POINT',
};

export const markToWords = (mark: number | string | null | undefined): string => {
  if (mark === null || mark === undefined || mark === '') {
    return '—';
  }

  const num = typeof mark === 'string' ? parseFloat(mark) : mark;
  if (isNaN(num)) return '—';

  // Format with leading zero if single digit integer
  let str = num.toString();
  if (num >= 0 && num < 10 && !str.includes('.')) {
    str = '0' + str;
  }

  return str
    .split('')
    .map((char) => DIGIT_WORDS[char] || char)
    .join(' ');
};

/**
 * Maps semester to the official SRKR Class/Sem string
 * Standard 4-Year B.Tech:
 * Sem 8 -> "IV B.TECH - II"
 * Sem 7 -> "IV B.TECH - I"
 * Sem 6 -> "III B.TECH - II"
 * Sem 5 -> "III B.TECH - I"
 * Sem 4 -> "II B.TECH - II"
 * Sem 3 -> "II B.TECH - I"
 * Sem 2 -> "I B.TECH - II"
 * Sem 1 -> "I B.TECH - I"
 */
export const getSRKRClassSem = (semester: number): string => {
  switch (semester) {
    case 8:
      return 'IV B.TECH - II';
    case 7:
      return 'IV B.TECH - I';
    case 6:
      return 'III B.TECH - II';
    case 5:
      return 'III B.TECH - I';
    case 4:
      return 'II B.TECH - II';
    case 3:
      return 'II B.TECH - I';
    case 2:
      return 'I B.TECH - II';
    case 1:
      return 'I B.TECH - I';
    default:
      return `B.TECH SEM-${semester}`;
  }
};
