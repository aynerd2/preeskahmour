'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ImageField } from './image-field';
import { Pill } from './studio-ui';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveContent } from '@/app/studio/actions';
import { cn, humanize } from '@/lib/utils';

/**
 * Renders an editable form from the *shape* of a content block.
 *
 * The blocks in DEFAULT_CONTENT are plain JSON: strings, booleans, string
 * arrays, image slots ({url, alt, briefNote}) and arrays of objects (the four
 * How-It-Works steps, the FAQ, the timeline). Rather than hand-writing a form
 * per block, this walks the value and picks a control per key.
 *
 * The upshot: adding a field to DEFAULT_CONTENT makes it editable here with
 * no further work, which is the only way a CMS this broad stays maintainable.
 */
export function ContentEditor({
  contentKey,
  label,
  hint,
  value,
  isCustomised,
}: {
  contentKey: string;
  label: string;
  hint?: string;
  value: Record<string, unknown>;
  isCustomised: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [pending, setPending] = React.useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(value);

  function set(path: string[], next: unknown) {
    setDraft((current) => setIn(current, path, next) as Record<string, unknown>);
  }

  async function save() {
    setPending(true);
    const result = await saveContent({ key: contentKey, value: draft });
    setPending(false);

    if (result.ok) {
      toast.success(`${label} updated`);
      router.refresh();
    } else {
      toast.error('Could not save that', { description: result.error });
    }
  }

  return (
    <section className={cn('border bg-background', open ? 'border-ink/25' : 'border-ink/12')}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display text-[1.05rem] text-ink">{label}</h3>
            {isCustomised ? <Pill tone="good">Edited</Pill> : <Pill>Default copy</Pill>}
          </div>
          {hint ? <p className="mt-1 text-xs text-ink-faint">{hint}</p> : null}
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-ink-faint transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-ink/10 p-5">
          <div className="space-y-6">
            {Object.entries(draft).map(([key, fieldValue]) => (
              <ValueField
                key={key}
                name={key}
                path={[key]}
                value={fieldValue}
                folder={contentKey.split('.')[0]}
                onChange={set}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
            <Button size="sm" onClick={save} disabled={pending || !dirty}>
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {pending ? 'Saving…' : 'Save'}
            </Button>
            {dirty ? (
              <Button size="sm" variant="ghost" onClick={() => setDraft(value)}>
                Discard changes
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** Picks a control based on what the value actually is. */
function ValueField({
  name,
  path,
  value,
  folder,
  onChange,
}: {
  name: string;
  path: string[];
  value: unknown;
  folder: string;
  onChange: (path: string[], next: unknown) => void;
}) {
  const label = humanize(name);

  // Image slot: { url, alt, briefNote }
  if (isImageSlot(value)) {
    const slot = value as { url: string; alt: string; briefNote?: string };
    return (
      <div className="border border-ink/10 p-4">
        <ImageField
          name={path.join('.')}
          label={label}
          folder={folder}
          brief={slot.briefNote}
          value={slot.url}
          onChange={(url) => onChange([...path, 'url'], url)}
        />
        <div className="mt-3">
          <Label htmlFor={`${path.join('.')}-alt`}>Alt text</Label>
          <Input
            id={`${path.join('.')}-alt`}
            value={slot.alt ?? ''}
            onChange={(e) => onChange([...path, 'alt'], e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          checked={value}
          onCheckedChange={(checked) => onChange(path, checked === true)}
        />
        <span className="text-sm text-ink">{label}</span>
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <div>
        <Label htmlFor={path.join('.')}>{label}</Label>
        <Input
          id={path.join('.')}
          type="number"
          value={value}
          onChange={(e) => onChange(path, Number(e.target.value))}
          className="mt-1.5"
        />
      </div>
    );
  }

  if (typeof value === 'string') {
    // Long copy gets a textarea; short labels get a single line.
    const long = value.length > 90 || /body|description|note|blurb|lede|subhead|message|a$/i.test(name);
    return (
      <div>
        <Label htmlFor={path.join('.')}>{label}</Label>
        {long ? (
          <Textarea
            id={path.join('.')}
            rows={value.length > 400 ? 8 : 3}
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className="mt-1.5"
          />
        ) : (
          <Input
            id={path.join('.')}
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className="mt-1.5"
          />
        )}
      </div>
    );
  }

  if (Array.isArray(value)) {
    // Array of plain strings — the ticker items, the measuring tips.
    if (value.every((entry) => typeof entry === 'string')) {
      const items = value as string[];
      return (
        <div>
          <Label>{label}</Label>
          <ul className="mt-2 space-y-2">
            {items.map((entry, index) => (
              <li key={index} className="flex gap-2">
                <Input
                  value={entry}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = e.target.value;
                    onChange(path, next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => onChange(path, items.filter((_, i) => i !== index))}
                  className="flex h-11 w-10 shrink-0 items-center justify-center text-ink-faint hover:text-destructive"
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => onChange(path, [...items, ''])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      );
    }

    // Array of objects — steps, FAQ entries, timeline rows, stats.
    const items = value as Record<string, unknown>[];
    const template = items[0] ?? {};

    return (
      <div>
        <Label>{label}</Label>
        <div className="mt-2 space-y-4">
          {items.map((entry, index) => (
            <div key={index} className="border border-ink/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                  {label} {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...items];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        onChange(path, next);
                      }}
                      className="px-2 text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted hover:text-ink"
                    >
                      Up
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onChange(path, items.filter((_, i) => i !== index))}
                    className="flex h-7 w-7 items-center justify-center text-ink-faint hover:text-destructive"
                    aria-label={`Remove ${label} ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(entry).map(([childKey, childValue]) => (
                  <ValueField
                    key={childKey}
                    name={childKey}
                    path={[...path, String(index), childKey]}
                    value={childValue}
                    folder={folder}
                    onChange={onChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => onChange(path, [...items, blankLike(template)])}
        >
          <Plus className="h-3.5 w-3.5" />
          Add {label.toLowerCase().replace(/s$/, '')}
        </Button>
      </div>
    );
  }

  // Nested object that is not an image slot.
  if (value && typeof value === 'object') {
    return (
      <div className="border border-ink/10 p-4">
        <p className="mb-4 text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
        <div className="space-y-4">
          {Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => (
            <ValueField
              key={childKey}
              name={childKey}
              path={[...path, childKey]}
              value={childValue}
              folder={folder}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function isImageSlot(value: unknown): boolean {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'url' in (value as object) &&
    'alt' in (value as object)
  );
}

/** A new array entry shaped like the existing ones, but empty. */
function blankLike(template: Record<string, unknown>): Record<string, unknown> {
  const blank: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(template)) {
    if (typeof value === 'string') blank[key] = '';
    else if (typeof value === 'number') blank[key] = 0;
    else if (typeof value === 'boolean') blank[key] = false;
    else if (Array.isArray(value)) blank[key] = [];
    else if (isImageSlot(value)) blank[key] = { url: '', alt: '', briefNote: '' };
    else if (value && typeof value === 'object') blank[key] = blankLike(value as Record<string, unknown>);
    else blank[key] = '';
  }
  return blank;
}

/** Immutable deep set, handling both object keys and array indices. */
function setIn(target: unknown, path: string[], next: unknown): unknown {
  if (path.length === 0) return next;

  const [head, ...rest] = path;

  if (Array.isArray(target)) {
    const index = Number(head);
    const copy = [...target];
    copy[index] = setIn(copy[index], rest, next);
    return copy;
  }

  const source = (target ?? {}) as Record<string, unknown>;
  return { ...source, [head]: setIn(source[head], rest, next) };
}
