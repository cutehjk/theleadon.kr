import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// 소식 게시판 (docs/SPEC.md 5.5절). 2차에서 Supabase로 옮기기 전까지 Markdown 파일로 관리합니다.
const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        category: z.enum(['notice', 'press', 'news']),
        date: z.coerce.date(),
        pinned: z.boolean().default(false),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        attachments: z
          .array(z.object({ name: z.string(), href: z.string(), size: z.string().optional() }))
          .default([]),
        // draft: true 인 글은 개발 서버에서만 보이고 실제 사이트 빌드에서는 빠집니다.
        draft: z.boolean().default(false),
      })
      .refine((d) => !d.cover || !!d.coverAlt, {
        message: '대표 사진(cover)이 있으면 사진 설명(coverAlt)을 반드시 입력해야 합니다.',
        path: ['coverAlt'],
      }),
});

export const collections = { news };
