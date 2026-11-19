// Date-only strings ("2025-03-14") are parsed as local dates so they never shift a day.
export function formatDate(value) {
  if (!value) return ''
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value))
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

// "The Nation · Mar 14, 2025", omitting whichever parts are missing.
export function storyMeta(article) {
  return [article.outlet, formatDate(article.date)].filter(Boolean).join(' · ')
}
