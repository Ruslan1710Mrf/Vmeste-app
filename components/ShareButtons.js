import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Linking,
  Alert,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { useI18n } from '../lib/i18n';

const APP_NAME = 'Vmeste App';

function buildWhatsAppUrl(text) {
  const encoded = encodeURIComponent(text);
  return Platform.select({
    ios: `whatsapp://send?text=${encoded}`,
    android: `whatsapp://send?text=${encoded}`,
    default: `https://wa.me/?text=${encoded}`,
  });
}

function buildTelegramUrl(url, text) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
}

function buildFacebookUrl(url) {
  const encodedUrl = encodeURIComponent(url);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
}

function buildTwitterUrl(text, url) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
}

async function openWithFallback(appUrl, webUrl, t) {
  try {
    const supported = await Linking.canOpenURL(appUrl);
    if (supported) {
      await Linking.openURL(appUrl);
    } else if (webUrl) {
      await Linking.openURL(webUrl);
    } else {
      await Linking.openURL(appUrl);
    }
  } catch (error) {
    if (webUrl) {
      await Linking.openURL(webUrl);
    } else {
      Alert.alert(t('shareButtons.openAppErrorTitle'), t('shareButtons.openAppErrorMessage'));
    }
  }
}

async function shareImageTo(platform, localImageUri, t) {
  if (!localImageUri) {
    Alert.alert(
      t('shareButtons.noImageTitle'),
      t('shareButtons.noImageMessage', {
        value: platform === 'instagram' ? 'Instagram' : 'TikTok',
      })
    );
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    Alert.alert(t('shareButtons.sharingUnavailable'));
    return;
  }

  await Sharing.shareAsync(localImageUri, {
    dialogTitle: platform === 'instagram' ? t('shareButtons.shareToInstagram') : t('shareButtons.shareToTikTok'),
    mimeType: 'image/jpeg',
  });
}

export default function ShareButtons({ title, url, imageUri, style }) {
  const { t } = useI18n();
  const [loadingPlatform, setLoadingPlatform] = useState(null);

  const shareText = `${title}\n\n${url}\n\n${t('shareButtons.downloadCta', { value: APP_NAME })}`;

  const handlePress = async (platform) => {
    setLoadingPlatform(platform);
    try {
      switch (platform) {
        case 'whatsapp':
          await openWithFallback(
            buildWhatsAppUrl(shareText),
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            t
          );
          break;
        case 'telegram':
          await openWithFallback(buildTelegramUrl(url, shareText), undefined, t);
          break;
        case 'facebook':
          await openWithFallback(buildFacebookUrl(url), undefined, t);
          break;
        case 'twitter':
          await openWithFallback(buildTwitterUrl(title, url), undefined, t);
          break;
        case 'instagram':
          await shareImageTo('instagram', imageUri, t);
          break;
        case 'tiktok':
          await shareImageTo('tiktok', imageUri, t);
          break;
        default:
          break;
      }
    } finally {
      setLoadingPlatform(null);
    }
  };

  const buttons = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
    { key: 'telegram', label: 'Telegram', color: '#229ED9' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2' },
    { key: 'twitter', label: 'X', color: '#000000' },
    { key: 'instagram', label: 'Instagram', color: '#E1306C' },
    { key: 'tiktok', label: 'TikTok', color: '#010101' },
  ];

  return (
    <View style={[styles.row, style]}>
      {buttons.map((btn) => (
        <TouchableOpacity
          key={btn.key}
          style={[styles.button, { backgroundColor: btn.color }]}
          onPress={() => handlePress(btn.key)}
          disabled={loadingPlatform === btn.key}
          activeOpacity={0.8}
        >
          {loadingPlatform === btn.key ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{btn.label}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
