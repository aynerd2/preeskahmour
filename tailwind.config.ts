import type { Config } from 'tailwindcss';

/**
 * Preeskahmour design tokens.
 *
 * The palette is deliberately NOT the neutral grey/black of a typical
 * made-to-measure site. It is built from the brand's own material story:
 *   emerald    — the house colour, deep and saturated like dyed aso-oke silk
 *   gold       — aso-oke metallic thread; used only as accent/foil, never as a fill
 *   terracotta — burnt orange found in northern Nigerian earth pigments
 *   indigo     — adire elu, the indigo of Yoruba resist-dye
 *   ivory/cream— unbleached raw cotton; the page ground, never pure #fff
 *   ink        — near-black with a warm cast so it sits against cream, not against white
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2.5rem', '2xl': '4rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14110F',
          soft: '#2A2523',
          muted: '#5B5350',
          faint: '#8C8481',
        },
        ivory: { DEFAULT: '#FBF8F3', deep: '#F5EFE5' },
        cream: { DEFAULT: '#F2EADD', deep: '#E7DBC7' },
        emerald: {
          DEFAULT: '#0B4D3F',
          deep: '#06322A',
          mid: '#126B57',
          light: '#2E8E77',
          wash: '#E6EFEB',
        },
        gold: {
          DEFAULT: '#C6A15B',
          deep: '#96742F',
          light: '#E2C88F',
          wash: '#F6EEDD',
        },
        terracotta: {
          DEFAULT: '#B45A3C',
          deep: '#8A3F27',
          light: '#D98B6E',
          wash: '#F7E9E2',
        },
        indigo: {
          DEFAULT: '#23335C',
          deep: '#151F3A',
          light: '#4A5C8C',
          wash: '#E8EBF2',
        },
        // Semantic aliases consumed by the shadcn-derived primitives in src/components/ui.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        // High-contrast editorial serif for display copy.
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        // Geometric-leaning grotesk for UI and body.
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 7vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.018em' }],
        'display-md': ['clamp(1.85rem, 3.6vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.014em' }],
        'display-sm': ['clamp(1.45rem, 2.4vw, 2.125rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        editorial: '0 24px 60px -32px rgba(20, 17, 15, 0.45)',
        lift: '0 2px 8px -2px rgba(20,17,15,0.08), 0 18px 40px -24px rgba(20,17,15,0.35)',
        'gold-ring': '0 0 0 1px #C6A15B, 0 0 0 4px rgba(198,161,91,0.18)',
      },
      backgroundImage: {
        'gold-foil':
          'linear-gradient(100deg, #96742F 0%, #E2C88F 22%, #C6A15B 46%, #F3E4C4 62%, #96742F 100%)',
      },
      keyframes: {
        'fade-rise': {
          from: { opacity: '0', transform: 'translate3d(0, 22px, 0)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-rise': 'fade-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        'accordion-down': 'accordion-down 0.25s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-out',
        marquee: 'marquee 38s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
