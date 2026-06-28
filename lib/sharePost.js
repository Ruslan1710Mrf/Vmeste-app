import * as ExpoLinking from 'expo-linking';
import { Platform, Share } from 'react-native';

export function getPostShareUrl(postId) {
  return ExpoLinking.createURL('/', {
    queryParams: { post: String(postId) },
  });
}

function buildShareMessage(post, url) {
  const preview =
    post.content.length > 140 ? `${post.content.slice(0, 140)}…` : post.content;
  return `${post.author} · ${post.category}\n\n${preview}\n\n${url}`;
}

export async function sharePost(post) {
  try {
    const url = getPostShareUrl(post.id);
    const message = buildShareMessage(post, url);

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: 'Vmeste',
        text: message,
        url,
      });
      return;
    }

    const payload = Platform.select({
      ios: {
        title: 'Vmeste',
        message: buildShareMessage(post, ''),
        url,
      },
      default: {
        title: 'Vmeste',
        message,
      },
    });

    await Share.share(payload);
  } catch {
    // Пользователь отменил шаринг или API недоступен
  }
}
