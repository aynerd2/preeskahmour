import Link from 'next/link';

import { ContentEditor } from '@/components/studio/content-editor';
import { HomeTileRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { CONTENT_KEYS, CONTENT_META, DEFAULT_CONTENT } from '@/lib/site-content';
import { OCCASION_LABELS } from '@/lib/constants';

export const metadata = { title: 'Pages & homepage' };

/**
 * The content editor.
 *
 * Every block on the marketing pages — hero, story, How It Works steps, the
 * FAQ, the returns policy — is a JSON blob keyed by name. The editor renders
 * a form from the *shape of the default*, so adding a new field to
 * DEFAULT_CONTENT makes it editable here automatically, with no work.
 */
export default async function StudioContentPage() {
  const [rows, tiles] = await Promise.all([
    safeQuery(() => prisma.siteSetting.findMany(), []),
    safeQuery(() => prisma.homeTile.findMany({ orderBy: { sortOrder: 'asc' } }), []),
  ]);

  const stored = new Map(rows.map((row) => [row.key, row.value]));

  // Merge each saved value over its default, exactly as the public site does.
  const blocks = CONTENT_KEYS.map((key) => {
    const fallback = DEFAULT_CONTENT[key];
    const saved = stored.get(key);
    const value =
      saved && typeof saved === 'object' && !Array.isArray(saved)
        ? { ...(fallback as object), ...(saved as object) }
        : fallback;

    return {
      key,
      label: CONTENT_META[key].label,
      group: CONTENT_META[key].group,
      hint: CONTENT_META[key].hint,
      value,
      isCustomised: stored.has(key),
    };
  });

  const groups = [...new Set(blocks.map((block) => block.group))];

  return (
    <>
      <StudioHeader
        title="Pages & homepage"
        description="Every word and image on the marketing pages. Changes go live within a minute — no deploy, no developer."
      />

      {/* Occasion tiles are rows rather than a content blob, so they get
          their own table with add/delete. */}
      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-ink">Occasion tiles</h2>
            <p className="mt-1 text-sm text-ink-muted">
              The five category tiles on the homepage. Re-order, retire or add one.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/studio/content/tiles/new">Add tile</Link>
          </Button>
        </div>

        <StudioTable
          rows={tiles}
          href={(tile) => `/studio/content/tiles/${tile.id}`}
          empty={{
            title: 'No tiles',
            body: 'The homepage hides the section entirely when there are none.',
            action: (
              <Button asChild>
                <Link href="/studio/content/tiles/new">Add the first tile</Link>
              </Button>
            ),
          }}
          columns={[
            {
              key: 'label',
              header: 'Tile',
              render: (tile) => (
                <span className="min-w-0">
                  <span className="block truncate text-ink">{tile.label}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {tile.subtitle ?? '—'}
                  </span>
                </span>
              ),
            },
            {
              key: 'href',
              header: 'Links to',
              hideOnMobile: true,
              render: (tile) => (
                <span className="font-mono text-[0.68rem] text-ink-muted">{tile.href}</span>
              ),
            },
            {
              key: 'occasion',
              header: 'Occasion',
              hideOnMobile: true,
              render: (tile) => (
                <span className="text-xs text-ink-muted">
                  {tile.occasion ? OCCASION_LABELS[tile.occasion] : '—'}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (tile) => (
                <Pill tone={tile.isActive ? 'good' : 'neutral'}>
                  {tile.isActive ? 'Live' : 'Hidden'}
                </Pill>
              ),
            },
            {
              key: 'actions',
              header: '',
              className: 'w-16 text-right',
              render: (tile) => <HomeTileRowActions id={tile.id} label={tile.label} />,
            },
          ]}
        />
      </section>

      {/* Content blocks */}
      {groups.map((group) => (
        <section key={group} className="mb-12">
          <h2 className="mb-4 font-display text-xl text-ink">{group}</h2>

          <div className="space-y-3">
            {blocks
              .filter((block) => block.group === group)
              .map((block) => (
                <ContentEditor
                  key={block.key}
                  contentKey={block.key}
                  label={block.label}
                  hint={block.hint}
                  value={block.value as Record<string, unknown>}
                  isCustomised={block.isCustomised}
                />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
