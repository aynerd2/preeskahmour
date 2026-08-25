'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MeasurementProfile } from '@prisma/client';

import {
  deleteMeasurementProfile,
  saveMeasurementProfile,
  setDefaultProfile,
} from '@/app/(marketing)/account/measurements/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/section';
import {
  MEASUREMENT_FIELDS,
  profileCompleteness,
  type MeasurementGroup,
} from '@/lib/measurements';
import { cn, formatDate } from '@/lib/utils';

const GROUPS: MeasurementGroup[] = ['Upper body', 'Arm', 'Lower body', 'Lengths'];

export function MeasurementManager({ profiles }: { profiles: MeasurementProfile[] }) {
  const [editing, setEditing] = React.useState<MeasurementProfile | 'new' | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [confirmDelete, setConfirmDelete] = React.useState<MeasurementProfile | null>(null);

  function onDelete(profile: MeasurementProfile) {
    startTransition(async () => {
      const result = await deleteMeasurementProfile(profile.id);
      if (result.ok) {
        toast.success('Profile deleted');
        setConfirmDelete(null);
      } else {
        toast.error('Could not delete that', { description: result.error });
      }
    });
  }

  function onSetDefault(profile: MeasurementProfile) {
    startTransition(async () => {
      const result = await setDefaultProfile(profile.id);
      if (result.ok) toast.success(`${profile.name} is now your default`);
      else toast.error('Could not do that', { description: result.error });
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="eyebrow">Measurement profiles</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            Keep more than one if you like — many customers hold a standard set and a maternity
            set. Your default is used automatically in the builder.
          </p>
        </div>

        <Button onClick={() => setEditing('new')} className="shrink-0">
          <Plus className="h-4 w-4" />
          New profile
        </Button>
      </div>

      {profiles.length === 0 ? (
        <EmptyState
          title="No measurements saved yet"
          body="Add them once and every order from then on goes straight into the atelier. Not sure how? The guide walks through each one."
          action={
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button onClick={() => setEditing('new')}>Add measurements</Button>
              <Button asChild variant="outline">
                <Link href="/measurement-guide">Read the guide</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="space-y-4">
          {profiles.map((profile) => {
            const stats = profileCompleteness(profile);

            return (
              <li key={profile.id} className="border border-ink/12 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-lg text-ink">{profile.name}</h3>
                      {profile.isDefault ? <Badge variant="gold">Default</Badge> : null}
                      {profile.source === 'ESTIMATED' ? (
                        <Badge variant="terracotta">Estimated</Badge>
                      ) : null}
                    </div>

                    <p className="mt-1.5 text-xs text-ink-faint">
                      Updated {formatDate(profile.updatedAt)}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1 w-32 bg-ink/10">
                        <div
                          className={cn(
                            'h-full transition-all',
                            stats.isComplete ? 'bg-emerald' : 'bg-gold',
                          )}
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-ink-muted">
                        {stats.filled}/{stats.total} required
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!profile.isDefault ? (
                      <button
                        type="button"
                        onClick={() => onSetDefault(profile)}
                        disabled={pending}
                        className="flex h-9 w-9 items-center justify-center text-ink-faint transition-colors hover:text-gold-deep"
                        aria-label={`Make ${profile.name} the default`}
                        title="Make default"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    ) : null}

                    <Button variant="ghost" size="sm" onClick={() => setEditing(profile)}>
                      Edit
                    </Button>

                    <button
                      type="button"
                      onClick={() => setConfirmDelete(profile)}
                      disabled={pending}
                      className="flex h-9 w-9 items-center justify-center text-ink-faint transition-colors hover:text-destructive"
                      aria-label={`Delete ${profile.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 border-t border-ink/10 pt-4 sm:grid-cols-4">
                  {MEASUREMENT_FIELDS.filter((f) => f.core && profile[f.key] != null).map(
                    (field) => (
                      <div key={field.key} className="flex justify-between gap-2">
                        <dt className="text-[0.62rem] uppercase tracking-[0.1em] text-ink-faint">
                          {field.label}
                        </dt>
                        <dd className="text-xs tabular-nums text-ink">{profile[field.key]}cm</dd>
                      </div>
                    ),
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}

      {/* Editor */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent side="bottom" className="max-h-[90vh] overflow-y-auto p-0">
          {editing ? (
            <ProfileForm
              profile={editing === 'new' ? null : editing}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this profile?</DialogTitle>
            <DialogDescription>
              {confirmDelete?.name} will be removed. Orders already placed keep their own copy of
              the measurements, so nothing in the atelier changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => confirmDelete && onDelete(confirmDelete)}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileForm({
  profile,
  onDone,
}: {
  profile: MeasurementProfile | null;
  onDone: () => void;
}) {
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveMeasurementProfile(formData);
      if (result.ok) {
        toast.success(profile ? 'Measurements updated' : 'Profile saved');
        onDone();
      } else {
        toast.error('Could not save that', { description: result.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="sticky top-0 z-10 border-b border-ink/10 bg-ivory px-5 py-4 sm:px-6">
        <DialogTitle className="text-xl">
          {profile ? 'Edit measurements' : 'New measurement profile'}
        </DialogTitle>
        <p className="mt-1 text-xs text-ink-muted">
          Everything in centimetres.{' '}
          <Link href="/measurement-guide" target="_blank" className="link-underline text-ink">
            How to measure
          </Link>
        </p>
      </div>

      <div className="space-y-8 px-5 py-6 sm:px-6">
        {profile ? <input type="hidden" name="id" value={profile.id} /> : null}
        <input type="hidden" name="source" value={profile?.source ?? 'MANUAL'} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Profile name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile?.name ?? 'My measurements'}
              required
              className="mt-1.5"
            />
          </div>

          <div className="flex items-end pb-2.5">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-muted">
              <Checkbox name="isDefault" defaultChecked={profile?.isDefault ?? false} />
              Use this by default
            </label>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <NumField id="heightCm" label="Height" value={profile?.heightCm} />
          <NumField id="weightKg" label="Weight (kg)" value={profile?.weightKg} />
          <NumField id="pregnancyWeeks" label="Weeks pregnant" value={profile?.pregnancyWeeks} />
        </div>

        {GROUPS.map((group) => {
          const fields = MEASUREMENT_FIELDS.filter((f) => f.group === group);
          return (
            <fieldset key={group}>
              <legend className="eyebrow mb-3">{group}</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                {fields.map((field) => (
                  <NumField
                    key={field.key}
                    id={field.key}
                    label={`${field.label}${field.core ? ' *' : ''}`}
                    value={profile?.[field.key]}
                  />
                ))}
              </div>
            </fieldset>
          );
        })}

        <div>
          <Label htmlFor="notes">Notes for the cutter</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={profile?.notes ?? ''}
            placeholder="My right shoulder sits about 1cm lower than my left…"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-3 border-t border-ink/10 bg-ivory px-5 py-4 sm:px-6">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" full disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pending ? 'Saving…' : 'Save measurements'}
        </Button>
      </div>
    </form>
  );
}

function NumField({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value?: number | null;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-[0.66rem]">
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type="number"
        step="0.1"
        inputMode="decimal"
        defaultValue={value ?? ''}
        className="mt-1.5"
      />
    </div>
  );
}
