const OWN_POST_MARKER = /\(вы\)/i;

export function isOwnPost(post, authorId) {
  const postAuthorId = post?.authorId != null ? String(post.authorId).trim() : '';
  const currentId = authorId != null ? String(authorId).trim() : '';

  if (postAuthorId && currentId && postAuthorId === currentId) {
    return true;
  }

  return OWN_POST_MARKER.test(post?.author ?? '');
}

export function getOwnPosts(posts, authorId) {
  if (!posts?.length) return [];
  return posts.filter((post) => isOwnPost(post, authorId));
}

export function getPostsByAuthorName(posts, authorName) {
  if (!authorName || !posts?.length) return [];
  const normalizedName = authorName.replace(/\s*\(вы\)\s*$/, '').trim();
  return posts.filter((post) => {
    const postAuthor = post.author?.replace(/\s*\(вы\)\s*$/, '').trim();
    return postAuthor === normalizedName;
  });
}
