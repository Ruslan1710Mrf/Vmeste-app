import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../lib/ThemeContext';

const paths = {
  home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
  briefcase: 'M8 7V4h8v3M3 12h18M10 12v3h4v-3M3 7h18v14H3Z',
  grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  sparkles: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4',
  user: 'M4 21v-2a8 8 0 0 1 16 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  users: 'M3 21v-2a6 6 0 0 1 12 0v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 4a4 4 0 0 1 0 8M18 15a5 5 0 0 1 3 5v1',
  search: 'M21 21l-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14',
  message: 'M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  image: 'M3 3h18v18H3ZM3 17l5-5 4 4 3-3 6 6M16 7h.01',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  share: 'M15 3h6v6M21 3 10 14M10 5H3v16h16v-7',
  book: 'M12 5v16M12 5C8 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-1-10 1Z',
  globe: 'M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  bookmark: 'M6 3h12v18l-6-4-6 4Z',
  edit: 'm15 4 5 5M4 20l1-6L17 2l5 5-12 12Z',
  calendar: 'M3 5h18v16H3ZM3 10h18M7 2v6M17 2v6',
  check: 'm5 12 4 4L19 6',
  help: 'M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 18h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 2h6l1 3 3 1 3 3v6l-3 3-3 1-1 3H9l-1-3-3-1-3-3V9l3-3 3-1Z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2',
  moon: 'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z',
  phone: 'M6 2h12v20H6ZM10 18h4',
  chevron: 'm9 5 7 7-7 7',
  back: 'm15 5-7 7 7 7',
  mail: 'M2 4h20v16H2ZM2 4l10 9L22 4',
  pin: 'M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
};
export default function Icon({ name, size = 22, color, filled = false }) {
  const { colors } = useTheme();
  const stroke = color || colors.textSecondary;
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" accessible={false}>
    {name === 'more' ? [5,12,19].map(x => <Circle key={x} cx={x} cy={12} r={1.4} fill={stroke} />) : <Path d={paths[name] || paths.grid} fill={filled ? stroke : 'none'} />}
  </Svg>;
}
