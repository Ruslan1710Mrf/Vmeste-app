import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../lib/ThemeContext';

export default function Avatar({ name, uri, size = 44, style }) {
  const { colors } = useTheme();
  const [failedUri, setFailedUri] = useState(null);
  const initials = String(name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join('').toUpperCase() || '?';
  return <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}>
    {uri && uri !== failedUri ? <Image source={{ uri }} style={{ width: size, height: size }} onError={() => setFailedUri(uri)} /> : <Text style={{ color: colors.tabActive, fontSize: Math.round(size * .34), fontWeight: '700' }}>{initials}</Text>}
  </View>;
}
