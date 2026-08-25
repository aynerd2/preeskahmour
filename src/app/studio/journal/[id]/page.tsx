import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

import { BlogPostEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { deleteBlogPost } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Edit article' };

type Params = Promise<{ id: string }>;

export default async function BlogPostEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const post = isNew ? null : await prisma.blogPost.findUnique({ where: { id } });
  if (!isNew && !post) notFound();

  const initial = post
    ? {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? '',
        body: post.body,
        coverImage: post.coverImage ?? '',
        coverAlt: post.coverAlt ?? '',
        category: post.category,
        tags: post.tags,
        authorName: post.authorName,
        status: post.status,
        seoTitle: post.seoTitle ?? '',
        seoDescription: post.seoDescription ?? '',
      }
    : {
        slug: '',
        title: '',
        excerpt: '',
        body: '<p></p>',
        coverImage: '',
        coverAlt: '',
        category: 'Journal',
        tags: [],
        authorName: 'Prisca Ogunlade',
        status: 'DRAFT',
        seoTitle: '',
        seoDescription: '',
      };

  return (
    <>
      <StudioHeader
        title={post ? post.title : 'New article'}
        back={{ label: 'All articles', href: '/studio/journal' }}
      />

      {post?.status === 'PUBLISHED' ? (
        <Button asChild variant="outline" size="sm" className="mb-6">
          <Link href={`/journal/${post.slug}`} target="_blank">
            View it live
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}

      <BlogPostEditor initial={initial} />

      {post ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={post.title}
            onDelete={() => deleteBlogPost(post.id)}
            redirectTo="/studio/journal"
            description="Deleted for good. To take it off the site without losing it, set the status back to Draft instead."
          />
        </div>
      ) : null}
    </>
  );
}
