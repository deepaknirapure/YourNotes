/**
 * YourNotes — Stacked Logo Component
 *
 * Usage:
 *   import Logo from '../components/Logo';
 *
 *   <Logo />                  — default (navbar)
 *   <Logo size="sm" />        — small: sidebar / mobile nav
 *   <Logo size="lg" />        — large: landing hero
 *   <Logo variant="dark" />   — white "Notes" for dark backgrounds
 *   <Logo as="div" />         — render as div instead of <a>
 */

import React from 'react';

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap';

let fontInjected = false;
function injectFont() {
  if (fontInjected || typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = FONT_URL;
  document.head.appendChild(link);
  fontInjected = true;
}

const ACCENT = '#e8500a';

// sm = mobile/sidebar, md = navbar (default), lg = landing hero
const SIZES = {
  sm: { your: 7,  notes: 22, bar: { w: 18, h: 2   }, gap: 2 },
  md: { your: 9,  notes: 32, bar: { w: 26, h: 2.5 }, gap: 2 },
  lg: { your: 13, notes: 50, bar: { w: 40, h: 3   }, gap: 3 },
};

export default function Logo({
  size     = 'md',
  variant  = 'light',
  as: Tag  = 'a',
  href     = '/',
  style    = {},
  ...props
}) {
  injectFont();

  const isDark    = variant === 'dark';
  const s         = SIZES[size] || SIZES.md;
  const notesColor = isDark ? '#f5f4f0' : '#111110';
  const linkProps  = Tag === 'a' ? { href } : {};

  return (
    <Tag
      {...linkProps}
      style={{
        display      : 'inline-flex',
        flexDirection: 'column',
        lineHeight   : 1,
        textDecoration: 'none',
        userSelect   : 'none',
        cursor       : 'pointer',
        ...style,
      }}
      {...props}
    >
      {/* YOUR — small all-caps orange label */}
      <span style={{
        fontFamily   : "'Syne', sans-serif",
        fontWeight   : 700,
        fontSize     : s.your,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color        : ACCENT,
        lineHeight   : 1,
        marginBottom : s.gap,
      }}>
        Your
      </span>

      {/* NOTES — heavy wordmark */}
      <span style={{
        fontFamily   : "'Syne', sans-serif",
        fontWeight   : 800,
        fontSize     : s.notes,
        letterSpacing: '-0.04em',
        color        : notesColor,
        lineHeight   : 0.92,
      }}>
        Notes
      </span>

      {/* Orange underbar */}
      <div style={{
        width       : s.bar.w,
        height      : s.bar.h,
        background  : ACCENT,
        borderRadius: 2,
        marginTop   : 5,
      }} />
    </Tag>
  );
}
