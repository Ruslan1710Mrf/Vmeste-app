// Свой пост — только по authorId. Пометку «(вы)» в имени автора не учитываем:
// в базе есть старые посты с «(вы)» прямо в author, и любой пользователь
// видел их «своими», а сохранить/удалить не мог (rules сверяют authorId).
export function isOwnPost(post, authorId) {
  const postAuthorId = post?.authorId != null ? String(post.authorId).trim() : '';
  const currentId = authorId != null ? String(authorId).trim() : '';

  return Boolean(postAuthorId && currentId && postAuthorId === currentId);
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
