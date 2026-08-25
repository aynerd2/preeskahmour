import Link from 'next/link';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

import { Wordmark } from '@/components/brand/wordmark';
import { NewsletterForm } from './newsletter-form';
import { BRAND, FOOTER_NAV } from '@/lib/constants';
import { getContentMany } from '@/lib/site-content';

export async function SiteFooter() {
  const content = await getContentMany(['site.footer', 'site.contact']);
  const footer = content['site.footer'];
  const contact = content['site.contact'];
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-ivory">
      {/* Newsletter band */}
      <div className="motif-asooke border-b border-ivory/10">
        <div className="container grid gap-8 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
          <div>
            <h2 className="text-display-sm text-ivory">{footer.newsletterHeading}</h2>
            <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ivory/60">
              {footer.newsletterBody}
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8 lg:py-20">
        {/* Brand column */}
        <div className="lg:col-span-2">
          <Wordmark className="text-ivory" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/55">{footer.blurb}</p>

          <ul className="mt-7 space-y-3 text-sm text-ivory/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <a href={`mailto:${contact.email}`} className="link-underline inline-block py-0.5">
                {contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <a
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className="link-underline inline-block py-0.5"
              >
                {contact.phone}
              </a>
            </li>
          </ul>

          <p className="mt-5 text-xs text-ivory/40">{contact.hours}</p>

          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:text-gold"
          >
            <Instagram className="h-4 w-4" aria-hidden />
            {BRAND.instagramHandle}
          </a>
        </div>

        {/* Link columns */}
        {FOOTER_NAV.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h3 className="text-eyebrow font-sans uppercase tracking-[0.2em] text-ivory/40">
              {column.heading}
            </h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-ivory/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ivory/10">
        <div className="container flex flex-col gap-3 py-6 text-xs text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.legalName}. Cut in Lagos.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/returns" className="inline-block py-1 hover:text-ivory/70">
              Alterations &amp; returns
            </Link>
            <Link href="/privacy" className="inline-block py-1 hover:text-ivory/70">
              Privacy
            </Link>
            <Link href="/terms" className="inline-block py-1 hover:text-ivory/70">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
