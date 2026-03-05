import { getCode } from 'country-list';

export function getCountryFlag(countryName: string): string {
  if (!countryName) return '🏳️';

  // OpenSky Network sometimes uses names that don't exactly match standard lists
  const overrides: Record<string, string> = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Russian Federation': 'RU',
    'South Korea': 'KR',
    'North Korea': 'KP',
    'Czech Republic': 'CZ',
    'Vietnam': 'VN',
    'Iran': 'IR',
    'Syria': 'SY',
    'Taiwan': 'TW',
    'Venezuela': 'VE',
    'Bolivia': 'BO',
    'Tanzania': 'TZ',
    'Moldova': 'MD',
    'Macedonia': 'MK',
    'Ivory Coast': 'CI',
    'Democratic Republic of the Congo': 'CD',
    'Republic of the Congo': 'CG',
    'Brunei': 'BN',
    'Laos': 'LA',
    'Swaziland': 'SZ',
    'Vatican': 'VA',
    'Micronesia': 'FM',
    'Palestine': 'PS',
    'Kosovo': 'XK',
  };

  const code = overrides[countryName] || getCode(countryName);
  
  if (!code) return '🏳️'; // Fallback white flag

  // Convert 2-letter ISO code to regional indicator emojis
  return code
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join('');
}
