import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { EmptyState } from '@/components/shared/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBlogCategories, getBlogPosts } from '@/lib/queries';
import { cn, formatDate } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Fabric notes, styling advice and what is happening on the atelier floor — written by the people cutting the cloth.',
  alternates: { canonical: '/journal' },
};

type SearchParams = Promise<{ category?: string }>;

export default async function JournalPage({ searchParams }: { searchParams: SearchParams }) {
  const { category } = await searchParams;

  const [posts, categories] = await Promise.all([
    getBlogPosts(category ? { category } : undefined),
    getBlogCategories(),
  ]);

  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="From the atelier"
        lede="Fabric notes, fitting advice and the occasional argument about construction. Written by the people who cut the cloth, not by a marketing desk."
      />

      <div className="container pb-24">
        {categories.length > 1 ? (
          <nav className="hide-scrollbar mb-12 flex gap-2 overflow-x-auto pb-1" aria-label="Categories">
            <CategoryChip href="/journal" active={!category}>
              All
            </CategoryChip>
            {categories.map((item) => (
              <CategoryChip
                key={item}
                href={`/journal?category=${encodeURIComponent(item)}`}
                active={category === item}
              >
                {item}
              </CategoryChip>
            ))}
          </nav>
        ) : null}

        {posts.length === 0 ? (
          <EmptyState
            title="Nothing published here yet"
            body="Articles are written and published from the studio. Check back soon."
            action={
              <Button asChild variant="outline" className="mt-2">
                <Link href="/journal">See all articles</Link>
              </Button>
            }
          />
        ) : (
          <>
            {/* Lead article */}
            {lead ? (
              <Reveal>
                <Link href={`/journal/${lead.slug}`} className="group grid gap-8 lg:grid-cols-2 lg:gap-14">
                  <div className="relative aspect-[8/5] overflow-hidden bg-cream">
                    {lead.coverImage ? (
                      <Image
                        src={lead.coverImage}
                        alt={lead.coverAlt ?? lead.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="motif-diamond h-full w-full" />
                    )}
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="emerald">{lead.category}</Badge>
                      <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">
                        {lead.publishedAt ? formatDate(lead.publishedAt) : 'Draft'} ·{' '}
                        {lead.readMinutes} min read
                      </span>
                    </div>

                    <h2 className="mt-5 text-display-md text-ink transition-colors group-hover:text-emerald">
                      {lead.title}
                    </h2>

                    {lead.excerpt ? (
                      <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink-muted">
                        {lead.excerpt}
                      </p>
                    ) : null}

                    <span className="link-underline mt-7 inline-block w-fit text-[0.7rem] uppercase tracking-[0.16em] text-ink">
                      Read the article
                    </span>
                  </div>
                </Link>
              </Reveal>
            ) : null}

            {rest.length > 0 ? (
              <>
                <hr className="gold-rule my-14 border-0 sm:my-20" />

                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <Reveal key={post.id} delay={Math.min(i * 60, 300)} as="article">
                      <Link href={`/journal/${post.slug}`} className="group flex flex-col">
                        <div className="relative aspect-[8/5] overflow-hidden bg-cream">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.coverAlt ?? post.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="motif-diamond h-full w-full" />
                          )}
                        </div>

                        <div className="mt-5 flex flex-1 flex-col">
                          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                            {post.category}
                            {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ''}
                          </p>

                          <h3 className="mt-2.5 font-display text-[1.3rem] leading-snug text-ink transition-colors group-hover:text-emerald">
                            {post.title}
                          </h3>

                          {post.excerpt ? (
                            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                              {post.excerpt}
                            </p>
                          ) : null}

                          <p className="mt-4 text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                            {post.readMinutes} min read
                          </p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        'shrink-0 whitespace-nowrap border px-4 py-2 text-[0.66rem] uppercase tracking-[0.14em] transition-colors',
        active
          ? 'border-ink bg-ink text-ivory'
          : 'border-ink/20 text-ink-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
