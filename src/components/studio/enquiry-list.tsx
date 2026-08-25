'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ENQUIRY_STATUS_OPTIONS } from './field-options';
import { Pill } from './studio-ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteEnquiry, updateEnquiry } from '@/app/studio/actions';
import { cn, formatDate } from '@/lib/utils';

export type InboxItem = {
  id: string;
  kind: 'B2B' | 'MESSAGE';
  title: string;
  subtitle: string;
  message: string;
  status: string;
  adminNote: string;
  createdAt: string;
  meta: string[];
};

export function EnquiryList({
  enquiries,
  messages,
}: {
  enquiries: InboxItem[];
  messages: InboxItem[];
}) {
  const newCount =
    enquiries.filter((e) => e.status === 'NEW').length +
    messages.filter((m) => m.status === 'NEW').length;

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All{newCount > 0 ? ` (${newCount} new)` : ''}</TabsTrigger>
        <TabsTrigger value="b2b">Corporate ({enquiries.length})</TabsTrigger>
        <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <Items items={[...enquiries, ...messages].sort(byNewest)} />
      </TabsContent>
      <TabsContent value="b2b">
        <Items items={enquiries} />
      </TabsContent>
      <TabsContent value="messages">
        <Items items={messages} />
      </TabsContent>
    </Tabs>
  );
}

function byNewest(a: InboxItem, b: InboxItem) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function Items({ items }: { items: InboxItem[] }) {
  if (items.length === 0) {
    return (
      <p className="border border-dashed border-ink/20 p-10 text-center text-sm text-ink-muted">
        Nothing here.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          <EnquiryCard item={item} />
        </li>
      ))}
    </ul>
  );
}

function EnquiryCard({ item }: { item: InboxItem }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(item.status);
  const [note, setNote] = React.useState(item.adminNote);
  const [pending, setPending] = React.useState(false);
  const [open, setOpen] = React.useState(item.status === 'NEW');

  const dirty = status !== item.status || note !== item.adminNote;

  async function save() {
    setPending(true);
    const result = await updateEnquiry(item.kind, { id: item.id, status, adminNote: note });
    setPending(false);

    if (result.ok) {
      toast.success('Saved');
      router.refresh();
    } else {
      toast.error('Could not save that', { description: result.error });
    }
  }

  async function remove() {
    if (!confirm(`Delete this enquiry from ${item.title}? This cannot be undone.`)) return;

    setPending(true);
    const result = await deleteEnquiry(item.kind, item.id);
    setPending(false);

    if (result.ok) {
      toast.success('Deleted');
      router.refresh();
    } else {
      toast.error('Could not delete that', { description: result.error });
    }
  }

  const email = item.subtitle.split(' · ').find((part) => part.includes('@'));

  return (
    <article
      className={cn(
        'border bg-background',
        item.status === 'NEW' ? 'border-gold/50' : 'border-ink/12',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Pill tone={item.kind === 'B2B' ? 'info' : 'neutral'}>
              {item.kind === 'B2B' ? 'Corporate' : item.meta[0] ?? 'Message'}
            </Pill>
            {item.status === 'NEW' ? <Pill tone="warn">New</Pill> : null}
            {item.status === 'CLOSED' ? <Pill tone="good">Closed</Pill> : null}
          </div>

          <h3 className="mt-2.5 font-display text-lg text-ink">{item.title}</h3>
          <p className="mt-1 truncate text-xs text-ink-faint">{item.subtitle}</p>

          {!open ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {item.message}
            </p>
          ) : null}
        </div>

        <span className="shrink-0 text-xs text-ink-faint">{formatDate(item.createdAt)}</span>
      </button>

      {open ? (
        <div className="border-t border-ink/10 p-5">
          {item.meta.length > 0 ? (
            <ul className="mb-4 flex flex-wrap gap-2">
              {item.meta.map((meta) => (
                <li key={meta}>
                  <Pill>{meta}</Pill>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{item.message}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
            <div>
              <label
                htmlFor={`status-${item.id}`}
                className="block font-sans text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted"
              >
                Status
              </label>
              <select
                id={`status-${item.id}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 flex h-11 w-full border border-ink/20 bg-ivory px-3 text-sm text-ink focus:border-emerald focus:outline-none"
              >
                {ENQUIRY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`note-${item.id}`}
                className="block font-sans text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted"
              >
                Internal note
              </label>
              <Textarea
                id={`note-${item.id}`}
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Sent swatch pack 12/08. Waiting on cloth confirmation."
                className="mt-2"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={save} disabled={pending || !dirty}>
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Save
            </Button>

            {email ? (
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${email}?subject=Re: your enquiry — Preeskahmour`}>
                  <Mail className="h-3.5 w-3.5" />
                  Reply by email
                </a>
              </Button>
            ) : null}

            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="ml-auto flex items-center gap-1.5 px-2 py-1 text-[0.66rem] uppercase tracking-[0.12em] text-ink-faint transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
