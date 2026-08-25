import Image from 'next/image';
import Link from 'next/link';

import { BlogPostRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Journal' };

export default async function StudioJournalPage() {
  const posts = await safeQuery(
    () => prisma.blogPost.findMany({ orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }] }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Journal"
        description="Articles for the site's journal. Drafts are invisible to the public until you set them to Published."
        action={{ label: 'New article', href: '/studio/journal/new' }}
      />

      <StudioTable
        rows={posts}
        href={(post) => `/studio/journal/${post.id}`}
        empty={{
          title: 'Nothing written yet',
          body: 'The journal page shows an empty state until the first article is published.',
          action: (
            <Button asChild>
              <Link href="/studio/journal/new">Write the first article</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'title',
            header: 'Article',
            render: (post) => (
              <div className="flex items-center gap-3">
                <span className="relative h-10 w-16 shrink-0 overflow-hidden bg-cream">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt="" fill sizes="64px" className="object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-ink">{post.title}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {post.readMinutes} min read · {post.authorName}
                  </span>
                </span>
              </div>
            ),
          },
          {
            key: 'category',
            header: 'Category',
            hideOnMobile: true,
            render: (post) => <span className="text-xs text-ink-muted">{post.category}</span>,
          },
          {
            key: 'date',
            header: 'Published',
            hideOnMobile: true,
            render: (post) => (
              <span className="text-xs text-ink-muted">
                {post.publishedAt ? formatDate(post.publishedAt) : '—'}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (post) => (
              <Pill tone={post.status === 'PUBLISHED' ? 'good' : 'neutral'}>
                {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </Pill>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (post) => <BlogPostRowActions id={post.id} title={post.title} />,
          },
        ]}
      />
    </>
  );
}
