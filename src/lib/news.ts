import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'news'>;

export const CATEGORIES = {
  notice: { label: '공지', en: 'NOTICE' },
  press: { label: '보도자료', en: 'PRESS' },
  news: { label: '사업소식', en: 'NEWS' },
} as const;
export type CategoryKey = keyof typeof CATEGORIES;

export const PER_PAGE = 9;
export const MAX_PINNED = 3;
const NEW_DAYS = 7;

/** 발행된 글을 최신순으로. 개발 서버에서는 draft 글도 포함합니다. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('news', (p) => import.meta.env.DEV || !p.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || b.id.localeCompare(a.id));
}

/** 목록 상단 고정 띠(최대 3건)와 카드 목록을 나눕니다. 고정 글은 카드에 중복 표시하지 않습니다. */
export function splitPinned(posts: Post[]) {
  const pinned = posts.filter((p) => p.data.pinned).slice(0, MAX_PINNED);
  return { pinned, rest: posts.filter((p) => !pinned.includes(p)) };
}

export function isNew(date: Date) {
  return Date.now() - date.getTime() <= NEW_DAYS * 864e5;
}

export function formatDate(date: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${p(date.getMonth() + 1)}.${p(date.getDate())}`;
}

export const postUrl = (p: Post) => `/news/${p.id}/`;
