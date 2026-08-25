'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { ImageField } from './image-field';
import { FormActions, Fieldset } from './studio-ui';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn, slugify } from '@/lib/utils';

/**
 * A small declarative form layer for the studio.
 *
 * Each editor describes its fields and the shared renderer handles layout,
 * state, validation feedback and the save call. That keeps every editor
 * consistent — and means adding a field to a model is a one-line change here
 * rather than a new bespoke form.
 *
 * Deliberately not react-hook-form: these forms are shallow, the values are
 * heterogeneous (arrays of enums, image URLs, repeaters), and a plain
 * controlled object is easier to reason about than a resolver chain.
 */

export type FieldSpec =
  | { type: 'text'; name: string; label: string; hint?: string; required?: boolean; placeholder?: string; width?: Width }
  | { type: 'slug'; name: string; label: string; from: string; hint?: string; width?: Width }
  | { type: 'textarea'; name: string; label: string; hint?: string; rows?: number; width?: Width }
  | { type: 'richtext'; name: string; label: string; hint?: string; width?: Width }
  | { type: 'number'; name: string; label: string; hint?: string; step?: number; min?: number; max?: number; width?: Width }
  | { type: 'money'; name: string; label: string; hint?: string; width?: Width }
  | { type: 'select'; name: string; label: string; hint?: string; options: { value: string; label: string }[]; allowEmpty?: string; width?: Width }
  | { type: 'multiselect'; name: string; label: string; hint?: string; options: { value: string; label: string }[]; width?: Width }
  | { type: 'checkbox'; name: string; label: string; hint?: string; width?: Width }
  | { type: 'color'; name: string; label: string; hint?: string; width?: Width }
  | { type: 'tags'; name: string; label: string; hint?: string; width?: Width }
  | { type: 'image'; name: string; label: string; hint?: string; folder?: string; aspect?: string; width?: Width }
  | {
      type: 'imageList';
      name: string;
      label: string;
      hint?: string;
      folder?: string;
      width?: Width;
    };

type Width = 'full' | 'half' | 'third';

export type Section = { legend: string; hint?: string; fields: FieldSpec[] };

export type FormValues = Record<string, unknown>;

export function StudioForm({
  sections,
  initial,
  onSave,
  cancelHref,
  saveLabel,
  extraActions,
}: {
  sections: Section[];
  initial: FormValues;
  onSave: (values: FormValues) => Promise<{ ok: true; data?: { id: string } } | { ok: false; error: string }>;
  cancelHref: string;
  saveLabel?: string;
  extraActions?: React.ReactNode;
}) {
  const router = useRouter();
  const [values, setValues] = React.useState<FormValues>(initial);
  const [pending, setPending] = React.useState(false);

  const set = React.useCallback((name: string, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);

    try {
      const result = await onSave(values);
      if (result.ok) {
        toast.success('Saved');
        router.push(cancelHref);
        router.refresh();
      } else {
        toast.error('Could not save that', { description: result.error });
      }
    } catch (error) {
      toast.error('Could not save that', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {sections.map((section) => (
        <Fieldset key={section.legend} legend={section.legend} hint={section.hint}>
          <div className="grid gap-5 sm:grid-cols-6">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  field.width === 'half' && 'sm:col-span-3',
                  field.width === 'third' && 'sm:col-span-2',
                  (!field.width || field.width === 'full') && 'sm:col-span-6',
                )}
              >
                <FieldRenderer field={field} values={values} set={set} />
              </div>
            ))}
          </div>
        </Fieldset>
      ))}

      <FormActions
        pending={pending}
        onCancel={() => router.push(cancelHref)}
        saveLabel={saveLabel}
        extra={extraActions}
      />
    </form>
  );
}

function FieldRenderer({
  field,
  values,
  set,
}: {
  field: FieldSpec;
  values: FormValues;
  set: (name: string, value: unknown) => void;
}) {
  const value = values[field.name];

  switch (field.type) {
    case 'text':
      return (
        <Wrap field={field}>
          <Input
            id={field.name}
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => set(field.name, e.target.value)}
          />
        </Wrap>
      );

    case 'slug':
      return (
        <Wrap field={field}>
          <div className="flex gap-2">
            <Input
              id={field.name}
              value={(value as string) ?? ''}
              placeholder="lowercase-with-dashes"
              onChange={(e) => set(field.name, e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              className="shrink-0"
              onClick={() => set(field.name, slugify(String(values[field.from] ?? '')))}
            >
              From name
            </Button>
          </div>
        </Wrap>
      );

    case 'textarea':
      return (
        <Wrap field={field}>
          <Textarea
            id={field.name}
            rows={field.rows ?? 4}
            value={(value as string) ?? ''}
            onChange={(e) => set(field.name, e.target.value)}
          />
        </Wrap>
      );

    case 'richtext':
      return (
        <Wrap field={field}>
          <Textarea
            id={field.name}
            rows={18}
            value={(value as string) ?? ''}
            onChange={(e) => set(field.name, e.target.value)}
            className="font-mono text-xs leading-relaxed"
            placeholder="<p>Write in HTML. Use &lt;h2&gt;, &lt;p&gt;, &lt;blockquote&gt;, &lt;ul&gt; and &lt;a&gt;.</p>"
          />
        </Wrap>
      );

    case 'number':
      return (
        <Wrap field={field}>
          <Input
            id={field.name}
            type="number"
            step={field.step ?? 1}
            min={field.min}
            max={field.max}
            value={value == null ? '' : String(value)}
            onChange={(e) => set(field.name, e.target.value === '' ? null : Number(e.target.value))}
          />
        </Wrap>
      );

    case 'money':
      return (
        <Wrap field={field}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
              ₦
            </span>
            <Input
              id={field.name}
              type="number"
              step="1"
              min="0"
              className="pl-8"
              value={value == null ? '' : String(value)}
              onChange={(e) =>
                set(field.name, e.target.value === '' ? null : Number(e.target.value))
              }
            />
          </div>
        </Wrap>
      );

    case 'select':
      return (
        <Wrap field={field}>
          <select
            id={field.name}
            value={(value as string) ?? ''}
            onChange={(e) => set(field.name, e.target.value)}
            className="flex h-11 w-full border border-ink/20 bg-ivory px-3.5 text-[0.95rem] text-ink transition-colors hover:border-ink/40 focus:border-emerald focus:outline-none"
          >
            {field.allowEmpty ? <option value="">{field.allowEmpty}</option> : null}
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Wrap>
      );

    case 'multiselect': {
      const selected = (value as string[]) ?? [];
      return (
        <Wrap field={field}>
          <div className="flex flex-wrap gap-2">
            {field.options.map((option) => {
              const active = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    set(
                      field.name,
                      active
                        ? selected.filter((v) => v !== option.value)
                        : [...selected, option.value],
                    )
                  }
                  className={cn(
                    'border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors',
                    active
                      ? 'border-ink bg-ink text-ivory'
                      : 'border-ink/20 text-ink-muted hover:border-ink hover:text-ink',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </Wrap>
      );
    }

    case 'checkbox':
      return (
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => set(field.name, checked === true)}
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm text-ink">{field.label}</span>
            {field.hint ? (
              <span className="mt-0.5 block text-xs text-ink-faint">{field.hint}</span>
            ) : null}
          </span>
        </label>
      );

    case 'color':
      return (
        <Wrap field={field}>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label={`${field.label} colour picker`}
              value={(value as string) || '#0B4D3F'}
              onChange={(e) => set(field.name, e.target.value.toUpperCase())}
              className="h-11 w-14 shrink-0 cursor-pointer border border-ink/20 bg-ivory p-1"
            />
            <Input
              id={field.name}
              value={(value as string) ?? ''}
              placeholder="#0B4D3F"
              onChange={(e) => set(field.name, e.target.value.toUpperCase())}
            />
          </div>
        </Wrap>
      );

    case 'tags': {
      const tags = (value as string[]) ?? [];
      return (
        <Wrap field={field}>
          <TagInput tags={tags} onChange={(next) => set(field.name, next)} id={field.name} />
        </Wrap>
      );
    }

    case 'image':
      return (
        <ImageField
          name={field.name}
          label={field.label}
          brief={field.hint}
          folder={field.folder}
          aspect={field.aspect}
          value={(value as string) ?? ''}
          onChange={(url) => set(field.name, url)}
        />
      );

    case 'imageList': {
      const images = (value as { url: string; alt?: string; briefNote?: string }[]) ?? [];
      return (
        <div>
          <Label>{field.label}</Label>
          {field.hint ? (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{field.hint}</p>
          ) : null}

          <div className="mt-3 space-y-4">
            {images.map((image, index) => (
              <div key={index} className="border border-ink/12 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                    Image {index + 1}
                    {index === 0 ? ' — grid image' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    {index > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...images];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          set(field.name, next);
                        }}
                        className="px-2 text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted hover:text-ink"
                      >
                        Move up
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => set(field.name, images.filter((_, i) => i !== index))}
                      className="flex h-7 w-7 items-center justify-center text-ink-faint hover:text-destructive"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <ImageField
                    name={`${field.name}-${index}-url`}
                    label="File"
                    folder={field.folder}
                    aspect="aspect-[3/4]"
                    value={image.url}
                    onChange={(url) => {
                      const next = [...images];
                      next[index] = { ...next[index], url };
                      set(field.name, next);
                    }}
                  />
                  <Input
                    placeholder="Alt text — describe the image for screen readers"
                    value={image.alt ?? ''}
                    onChange={(e) => {
                      const next = [...images];
                      next[index] = { ...next[index], alt: e.target.value };
                      set(field.name, next);
                    }}
                  />
                  <Input
                    placeholder="Shot note for the photographer (never shown publicly)"
                    value={image.briefNote ?? ''}
                    onChange={(e) => {
                      const next = [...images];
                      next[index] = { ...next[index], briefNote: e.target.value };
                      set(field.name, next);
                    }}
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => set(field.name, [...images, { url: '', alt: '', briefNote: '' }])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add image
          </Button>
        </div>
      );
    }

    default:
      return null;
  }
}

function Wrap({ field, children }: { field: FieldSpec; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={field.name}>
        {field.label}
        {'required' in field && field.required ? (
          <span className="ml-1 text-gold-deep">*</span>
        ) : null}
      </Label>
      {field.hint && field.type !== 'image' ? (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{field.hint}</p>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  id,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  id: string;
}) {
  const [draft, setDraft] = React.useState('');

  function commit() {
    const value = draft.trim().toLowerCase();
    if (!value || tags.includes(value)) {
      setDraft('');
      return;
    }
    onChange([...tags, value]);
    setDraft('');
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter must not submit the whole form while adding a tag.
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            }
          }}
          placeholder="Type and press Enter"
        />
        <Button type="button" variant="outline" size="md" className="shrink-0" onClick={commit}>
          Add
        </Button>
      </div>

      {tags.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="inline-flex items-center gap-1.5 border border-ink/20 bg-cream px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.12em] text-ink-muted hover:border-ink hover:text-ink"
              >
                {tag}
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
