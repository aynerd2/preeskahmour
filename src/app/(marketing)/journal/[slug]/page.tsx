import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading } from '@/components/shared/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/queries';
import { absoluteUrl, formatDate } from '@/lib/utils';

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Article not found' };

  const description = post.seoDescription ?? post.excerpt ?? undefined;

  return {
    title: post.seoTitle ?? post.title,
    description,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: description ?? undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function JournalPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const more = (await getBlogPosts({ take: 4 })).filter((p) => p.id !== post.id).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Person', name: post.authorName },
    publisher: { '@type': 'Organization', name: 'Preeskahmour' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <div className="container pt-10 sm:pt-12">
          <Breadcrumbs
            items={[
              { label: 'Journal', href: '/journal' },
              { label: post.category, href: `/journal?category=${encodeURIComponent(post.category)}` },
              { label: post.title },
            ]}
          />

          <header className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="emerald">{post.category}</Badge>
              <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">
                {post.publishedAt ? formatDate(post.publishedAt) : 'Unpublished'} ·{' '}
                {post.readMinutes} min read
              </span>
            </div>

            <h1 className="mt-6 text-display-lg text-ink">{post.title}</h1>

            {post.excerpt ? (
              <p className="mt-6 text-[1.15rem] leading-relaxed text-ink-muted">{post.excerpt}</p>
            ) : null}

            <p className="mt-7 text-[0.66rem] uppercase tracking-[0.16em] text-ink-muted">
              Words by {post.authorName}
            </p>
          </header>
        </div>

        {post.coverImage ? (
          <div className="relative mt-12 aspect-[16/9] w-full overflow-hidden bg-cream sm:mt-14">
            <Image
              src={post.coverImage}
              alt={post.coverAlt ?? post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        {/*
         * Body HTML comes from the /studio editor, which is authored only by
         * signed-in admins. It is sanitised on write (see lib/sanitize.ts)
         * rather than on every read.
         */}
        <div className="container mt-12 sm:mt-16">
          <div
            className="prose-editorial mx-auto max-w-2xl"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {post.tags.length > 0 ? (
            <div className="mx-auto mt-12 flex max-w-2xl flex-wrap gap-2 border-t border-ink/10 pt-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {/* Close */}
      <Section size="md" className="mt-8 border-t border-ink/10">
        <div className="container max-w-2xl text-center">
          <h2 className="text-display-sm text-ink">Put it into practice</h2>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
            Everything we write about here is something we cut. Open the builder and choose the
            cloth for yourself.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/builder">Design your suit</Link>
          </Button>
        </div>
      </Section>

      {more.length > 0 ? (
        <Section className="container" size="md">
          <SectionHeading
            eyebrow="Keep reading"
            title="More from the journal"
            link={{ label: 'All articles', href: '/journal' }}
          />

          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-3">
            {more.map((item, i) => (
              <Reveal key={item.id} delay={i * 70} as="article">
                <Link href={`/journal/${item.slug}`} className="group flex flex-col">
                  <div className="relative aspect-[8/5] overflow-hidden bg-cream">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.coverAlt ?? item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="motif-diamond h-full w-full" />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-[1.15rem] leading-snug text-ink transition-colors group-hover:text-emerald">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                    {item.category} · {item.readMinutes} min
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
