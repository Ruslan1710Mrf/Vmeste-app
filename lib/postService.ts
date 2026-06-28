import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { POSTS } from '../data/posts';
import { formatPostTime } from './timeUtils';
import { db } from './firestore';

export type PostReply = {
  id: string;
  author: string;
  authorId?: string;
  text: string;
  createdAt: string;
  time?: string;
};

export type PostRecord = {
  id: string;
  authorId?: string;
  author: string;
  city: string;
  content: string;
  category: string;
  imageUri?: string | null;
  likes: number;
  createdAt: string;
  time: string;
  replies: PostReply[];
};

type PostDoc = {
  authorId?: string;
  author: string;
  city: string;
  content: string;
  category: string;
  imageUri?: string | null;
  likes: number;
  createdAt: string;
  replies: PostReply[];
};

function mapPost(id: string, data: PostDoc): PostRecord {
  return {
    id,
    authorId: data.authorId,
    author: data.author,
    city: data.city,
    content: data.content,
    category: data.category,
    imageUri: data.imageUri ?? null,
    likes: data.likes ?? 0,
    createdAt: data.createdAt,
    time: formatPostTime(data.createdAt),
    replies: (data.replies ?? []).map((reply) => ({
      ...reply,
      time: formatPostTime(reply.createdAt),
    })),
  };
}

export async function seedPostsIfEmpty() {
  const metaRef = doc(db, 'meta', 'posts');
  const meta = await getDoc(metaRef);
  if (meta.exists()) return;

  const batch = writeBatch(db);
  POSTS.forEach((post, index) => {
    const ref = doc(db, 'posts', post.id);
    const createdAt = new Date(Date.now() - (index + 1) * 5 * 3600000).toISOString();
    batch.set(ref, {
      author: post.author,
      city: post.city,
      content: post.content,
      category: post.category,
      likes: post.likes,
      createdAt,
      replies: (post.replies ?? []).map((reply, replyIndex) => ({
        id: reply.id,
        author: reply.author,
        text: reply.text,
        createdAt: new Date(
          Date.now() - (index + 1) * 5 * 3600000 + replyIndex * 3600000,
        ).toISOString(),
      })),
    });
  });
  batch.set(metaRef, { seeded: true, seededAt: new Date().toISOString() });
  await batch.commit();
}

export async function fetchPosts(): Promise<PostRecord[]> {
  await seedPostsIfEmpty();
  const postsQuery = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snapshot = await getDocs(postsQuery);
  return snapshot.docs.map((entry) => mapPost(entry.id, entry.data() as PostDoc));
}

export async function createPost(
  uid: string,
  input: {
    author: string;
    city: string;
    content: string;
    category: string;
    imageUri?: string | null;
  },
): Promise<PostRecord> {
  const ref = doc(collection(db, 'posts'));
  const createdAt = new Date().toISOString();
  const payload: PostDoc = {
    authorId: uid,
    author: input.author,
    city: input.city,
    content: input.content,
    category: input.category,
    imageUri: input.imageUri ?? null,
    likes: 0,
    createdAt,
    replies: [],
  };
  await setDoc(ref, payload);
  return mapPost(ref.id, payload);
}

export async function updatePost(
  postId: string,
  input: { content: string; category: string },
): Promise<PostRecord> {
  const ref = doc(db, 'posts', postId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    throw new Error('Post not found');
  }
  const data = snapshot.data() as PostDoc;
  const nextData: PostDoc = {
    ...data,
    content: input.content,
    category: input.category,
  };
  await updateDoc(ref, {
    content: input.content,
    category: input.category,
  });
  return mapPost(postId, nextData);
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', postId));
}

export async function deleteUserPosts(uid: string): Promise<void> {
  const postsQuery = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(1000),
  );
  const snapshot = await getDocs(postsQuery);
  const batch = writeBatch(db);
  snapshot.docs.forEach((postDoc) => {
    const data = postDoc.data() as PostDoc;
    if (data.authorId === uid) {
      batch.delete(postDoc.ref);
    }
  });
  await batch.commit();
}

export async function addReplyToPost(
  postId: string,
  uid: string,
  input: { author: string; text: string },
): Promise<PostReply> {
  const ref = doc(db, 'posts', postId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    throw new Error('Post not found');
  }
  const data = snapshot.data() as PostDoc;
  const reply: PostReply = {
    id: String(Date.now()),
    author: input.author,
    authorId: uid,
    text: input.text,
    createdAt: new Date().toISOString(),
  };
  await updateDoc(ref, {
    replies: [...(data.replies ?? []), reply],
  });
  return { ...reply, time: formatPostTime(reply.createdAt) };
}
