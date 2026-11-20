import { useSyncExternalStore } from 'react'

// Section order drives page-turn direction: moving to a later section turns the page
// forward (right to left), moving to an earlier one turns it backward.
export const SECTIONS = [
  { label: 'Home', path: '/dashboard', end: true, color: 'home', note: 'The daily briefing', blurb: 'Counts, highlights and the latest entries, live from the desk.' },
  { label: 'Articles', path: '/dashboard/articles', color: 'articles', note: 'Stories worth keeping', blurb: 'Headlines, bylines, and everything you’ve put into print.' },
  { label: 'Creatives', path: '/dashboard/creative', color: 'creatives', note: 'A little outside the lines', blurb: 'Audio, images, and ideas that take a different shape.' },
  { label: 'Site Content', path: '/dashboard/site', color: 'site', note: 'The person behind the byline', blurb: 'Your headshot, biography, and resume. Keep your story current.' },
]

const trim = (pathname) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname)

export function sectionIndex(pathname) {
  const path = trim(pathname)
  const i = SECTIONS.findIndex((s) => (s.end ? path === s.path : path === s.path || path.startsWith(`${s.path}/`)))
  return Math.max(0, i)
}

// Section landing pages are open spreads; editors are single full sheets.
export function isSectionRoot(pathname) {
  const path = trim(pathname)
  return SECTIONS.some((s) => s.path === path)
}

// 'forward' | 'backward' turn between section landing pages;
// 'open' | 'close' is the lighter slide used when an editor opens or closes; 'none' otherwise.
export function turnKind(from, to) {
  const a = trim(from)
  const b = trim(to)
  if (a === b) return 'none'
  const fromRoot = isSectionRoot(a)
  const toRoot = isSectionRoot(b)
  if (fromRoot && toRoot) return sectionIndex(b) > sectionIndex(a) ? 'forward' : 'backward'
  if (toRoot) return 'close'
  if (fromRoot) return 'open'
  return 'none'
}

// True when the page should skip animated transitions entirely.
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function subscribeMotion(callback) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

// Re-renders when the visitor changes their motion preference mid-session.
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false)
}

// Router options for in-app navigation that should play a page turn.
export function turnOptions() {
  return { viewTransition: !prefersReducedMotion() }
}
