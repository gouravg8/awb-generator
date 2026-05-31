import type { AWBSettings } from '../types';

export function generateAWB(settings: AWBSettings): string {
  const { maxLength, includeUppercase, includeLowercase, includeNumbers, includeHyphen, includeUnderscore, prefix, suffix } = settings;

  let charset = '';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';

  if (!charset) charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const specials: string[] = [];
  if (includeHyphen) specials.push('-');
  if (includeUnderscore) specials.push('_');

  const length = Math.max(4, Math.min(maxLength, 32));

  let result = '';
  if (prefix) result = prefix + "-";
  for (let i = 0; i < length; i++) {
    if (specials.length > 0 && i > 0 && i < length - 1 && Math.random() < 0.15) {
      result += specials[Math.floor(Math.random() * specials.length)];
    } else {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  if (suffix) result = result + suffix;

  return result;
}
