import React, { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { useI18n } from '../lib/i18n';

const CapturablePostCard = forwardRef(({ post }, ref) => {
  const { t } = useI18n();
  return (
    <ViewShot
      ref={ref}
      options={{ format: 'jpg', quality: 0.9 }}
      style={styles.shotWrapper}
    >
      <View style={styles.card}>
        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={styles.image} resizeMode="cover" />
        ) : null}

        <View style={styles.textBlock}>
          <Text style={styles.author} numberOfLines={1}>
            {post.author}
          </Text>
          <Text style={styles.excerpt} numberOfLines={4}>
            {post.content}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.brand}>Vmeste App</Text>
          <Text style={styles.cta}>{t('postCard.downloadCta')}</Text>
        </View>
      </View>
    </ViewShot>
  );
});

export default CapturablePostCard;

const styles = StyleSheet.create({
  shotWrapper: {
    backgroundColor: '#fff',
  },
  card: {
    width: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 280,
  },
  textBlock: {
    padding: 16,
  },
  author: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C2BD9',
  },
  cta: {
    fontSize: 11,
    color: '#888',
  },
});
