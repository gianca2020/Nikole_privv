// The notebook's four sections, in page order.
export const SECTIONS = [
  { label: 'Home', path: '/dashboard', end: true, note: 'The daily briefing', blurb: 'Counts, highlights and the latest entries, live from the desk.' },
  { label: 'Articles', path: '/dashboard/articles', note: 'Stories worth keeping', blurb: 'Headlines, bylines, and everything you’ve put into print.' },
  { label: 'Creatives', path: '/dashboard/creative', note: 'A little outside the lines', blurb: 'Audio, images, and ideas that take a different shape.' },
  { label: 'Site Content', path: '/dashboard/site', note: 'The person behind the byline', blurb: 'Your headshot, biography, and resume. Keep your story current.' },
]

const trim = (pathname) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname)

export function sectionIndex(pathname) {
  const path = trim(pathname)
  const i = SECTIONS.findIndex((s) => (s.end ? path === s.path : path === s.path || path.startsWith(`${s.path}/`)))
  return Math.max(0, i)
}

// Editors open on a loose sheet above the book; every other dashboard route is a book spread.
export function isEditorPath(pathname) {
  return /\/(new|[^/]+\/edit)$/.test(trim(pathname))
}

// Book page numbers. Page 0 is the front cover and the last page the back cover.
// Spread: two pages per section. Single (phones): one page per section.
export function pageForSection(index, spread) {
  return spread ? 1 + 2 * index : 1 + index
}

export function sectionForPage(page, spread) {
  const i = spread ? Math.floor((page - 1) / 2) : page - 1
  return Math.max(0, Math.min(SECTIONS.length - 1, i))
}

export function lastPage(spread) {
  return spread ? 1 + 2 * SECTIONS.length : 1 + SECTIONS.length
}
