export type CountryCode = {
  id: string;
  dialCode: string;
  flag: string;
  name: string;
};

export const COUNTRY_CODES: CountryCode[] = [
  { id: 'us', dialCode: '+1', flag: '🇺🇸', name: 'США' },
  { id: 'ru', dialCode: '+7', flag: '🇷🇺', name: 'Россия' },
  { id: 'kz', dialCode: '+7', flag: '🇰🇿', name: 'Казахстан' },
  { id: 'kg', dialCode: '+996', flag: '🇰🇬', name: 'Кыргызстан' },
  { id: 'uz', dialCode: '+998', flag: '🇺🇿', name: 'Узбекистан' },
  { id: 'ua', dialCode: '+380', flag: '🇺🇦', name: 'Украина' },
  { id: 'by', dialCode: '+375', flag: '🇧🇾', name: 'Беларусь' },
  { id: 'am', dialCode: '+374', flag: '🇦🇲', name: 'Армения' },
  { id: 'az', dialCode: '+994', flag: '🇦🇿', name: 'Азербайджан' },
  { id: 'tj', dialCode: '+992', flag: '🇹🇯', name: 'Таджикистан' },
  { id: 'tm', dialCode: '+993', flag: '🇹🇲', name: 'Туркменистан' },
  { id: 'md', dialCode: '+373', flag: '🇲🇩', name: 'Молдова' },
  { id: 'ge', dialCode: '+995', flag: '🇬🇪', name: 'Грузия' },
];

export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0];
