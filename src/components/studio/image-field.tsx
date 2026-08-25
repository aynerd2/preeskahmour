'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageIcon, Info, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * The studio's image control.
 *
 * Two ways in, because Cloudinary is optional:
 *   - upload a file (signed server-side, sent straight to Cloudinary)
 *   - paste a URL (always available, including the /placeholders paths)
 *
 * `brief` carries the art-direction note from the asset manifest, so Prisca
 * sees exactly what shot belongs in this slot while she is filling it.
 */
export function ImageField({
  name,
  label,
  value,
  onChange,
  folder = 'general',
  brief,
  aspect = 'aspect-[4/3]',
  required,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  brief?: string;
  aspect?: string;
  required?: boolean;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [showUrl, setShowUrl] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('That file is too large', { description: 'Keep uploads under 10MB.' });
      return;
    }

    setUploading(true);
    try {
      const signRes = await fetch('/api/studio/upload-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      const sign = await signRes.json();

      if (!signRes.ok) {
        // The commonest case by far: no Cloudinary keys. Say so, and point at
        // the fallback rather than failing silently.
        setShowUrl(true);
        throw new Error(sign.error ?? 'Could not start the upload.');
      }

      const body = new FormData();
      body.append('file', file);
      body.append('api_key', sign.apiKey);
      body.append('timestamp', String(sign.timestamp));
      body.append('signature', sign.signature);
      body.append('folder', sign.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: 'POST', body },
      );

      const uploaded = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploaded?.error?.message ?? 'Upload failed.');

      onChange(uploaded.secure_url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload did not work', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <Label htmlFor={`${name}-url`}>
        {label}
        {required ? <span className="ml-1 text-gold-deep">*</span> : null}
      </Label>

      {brief ? (
        <p className="mt-1.5 flex gap-2 text-[0.68rem] leading-relaxed text-ink-faint">
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-gold-deep" aria-hidden />
          {brief}
        </p>
      ) : null}

      <div className="mt-2.5 flex gap-3">
        {/* Preview */}
        <div className={cn('relative w-28 shrink-0 overflow-hidden bg-cream', aspect)}>
          {value ? (
            <>
              <Image
                src={value}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
                unoptimized={!value.startsWith('/')}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-ink/80 text-ivory transition-colors hover:bg-destructive"
                aria-label={`Remove ${label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            id={`${name}-file`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrl((s) => !s)}
            >
              {showUrl ? 'Hide URL' : 'Or paste a URL'}
            </Button>
          </div>

          {showUrl || value ? (
            <Input
              id={`${name}-url`}
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://res.cloudinary.com/… or /placeholders/…"
              className="text-xs"
            />
          ) : (
            <input type="hidden" name={name} value={value} />
          )}
        </div>
      </div>
    </div>
  );
}
