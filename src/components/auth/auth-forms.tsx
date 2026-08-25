'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Field } from '@/components/forms/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema, registerSchema, type RegisterInput } from '@/lib/validators';

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallback(searchParams.get('callbackUrl'));
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    const result = await signIn('credentials', { ...values, redirect: false });

    if (result?.error) {
      // One message for both a wrong password and an unknown address, so the
      // form cannot be used to discover which addresses have accounts.
      toast.error('That did not work', {
        description: 'Check the email and password and try again.',
      });
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field name="email" label="Email" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" autoFocus {...register('email')} />
      </Field>

      <Field name="password" label="Password" error={errors.password?.message} required>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-11"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-ink-faint hover:text-ink"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" full size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        No account yet?{' '}
        <Link
          href={`/register${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          className="link-underline text-ink"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallback(searchParams.get('callbackUrl'));
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Could not create that account.');

      // Sign straight in — asking someone to type the password again
      // immediately after choosing it is pure friction.
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.success('Account created', { description: 'Sign in to continue.' });
        router.push('/login');
        return;
      }

      toast.success('Welcome to the house');
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error('Could not create that account', {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field name="name" label="Your name" error={errors.name?.message} required>
        <Input autoComplete="name" autoFocus {...register('name')} />
      </Field>

      <Field name="email" label="Email" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>

      <Field
        name="phone"
        label="Phone or WhatsApp"
        hint="Only used for fitting questions about your orders."
        error={errors.phone?.message}
      >
        <Input type="tel" autoComplete="tel" {...register('phone')} />
      </Field>

      <Field
        name="password"
        label="Password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password?.message}
        required
      >
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="pr-11"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-ink-faint hover:text-ink"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Field
        name="confirmPassword"
        label="Confirm password"
        error={errors.confirmPassword?.message}
        required
      >
        <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
      </Field>

      <Button type="submit" full size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Creating your account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Already have one?{' '}
        <Link
          href={`/login${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          className="link-underline text-ink"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

/**
 * Only ever redirect to a path on this site. An open redirect here would let
 * a phishing link send someone to a lookalike domain straight after signing in.
 */
function safeCallback(raw: string | null) {
  if (!raw) return '/account';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account';
  return raw;
}
