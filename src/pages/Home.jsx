import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listArticles } from '../lib/articles'
import { listCreatives } from '../lib/creatives'
import { getSiteSettings } from '../lib/siteSettings'
import { formatDateTime, storyMeta } from '../lib/format'
import useDocumentTitle from '../lib/useDocumentTitle'
import { buttonClass } from '../components/ui/buttonStyles'
import StatusMessage from '../components/ui/StatusMessage'

function StoryLinks({ articles, emptyText, highlighted = false }) {
  if (articles.length === 0) return <p className="text-ink-muted">{emptyText}</p>
  return (
    <ol className={`story-list ${highlighted ? 'highlight-list' : ''}`}>
      {articles.map((article, i) => (
        <li key={article.id}>
          <span className="story-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <Link to={`/dashboard/articles/${article.id}/edit`}>
            <span className="story-title">{highlighted ? <mark>{article.title || 'Untitled'}</mark> : article.title || 'Untitled'}</span>
            {storyMeta(article) && <span className="story-meta">{storyMeta(article)}</span>}
          </Link>
          <span className="story-arrow" aria-hidden="true">↗</span>
        </li>
      ))}
    </ol>
  )
}

function Section({ title, children, label, className = '' }) {
  return (
    <section className={`journal-section ${className}`}>
      <div className="section-heading"><h2>{title}</h2>{label && <span className="eyebrow">{label}</span>}</div>
      {children}
    </section>
  )
}

export default function Home() {
  useDocumentTitle('Home')

  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    setFailed(false)
    setData(null)
    const [a, c, s] = await Promise.allSettled([listArticles(), listCreatives(), getSiteSettings()])
    if (a.status === 'rejected' && c.status === 'rejected' && s.status === 'rejected') {
      setFailed(true)
      return
    }
    setData({
      articles: a.status === 'fulfilled' ? a.value : null,
      creatives: c.status === 'fulfilled' ? c.value : null,
      settings: s.status === 'fulfilled' ? s.value : null,
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const articles = data?.articles
  const stats = [
    { label: 'Articles', value: articles?.length, to: '/dashboard/articles' },
    { label: 'Highlights', value: articles?.filter((a) => a.is_highlight).length, to: '/dashboard/articles' },
    { label: 'Creatives', value: data?.creatives?.length, to: '/dashboard/creative' },
  ]
  const settings = data?.settings

  return (
    <div className="home-spread">
      <div className="home-left">
      <p className="eyebrow page-dateline">THE DAILY BRIEFING <span>01 / HOME</span></p>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Hello, <span className="text-accent">Nikole</span>
          </h1>
          <p className="text-ink-muted greeting-note">A new page. A story worth telling.</p>
        </div>
        <Link to="/dashboard/articles/new" className={buttonClass({ variant: 'primary', size: 'lg' })}>
          + New article
        </Link>
      </div>

      {failed ? (
        <StatusMessage
          kind="error"
          message="Couldn't load your dashboard. Check your connection and try again."
          actionLabel="Try again"
          onAction={load}
        />
      ) : (
        <div className="space-y-6">
          <div className="journal-stats">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.to}
                className="journal-stat"
              >
                <span className="stat-value">{stat.value ?? '—'}</span>
                <span className="stat-label">{stat.label}</span>
              </Link>
            ))}
          </div>

          <Section title="Highlights" label="THE SELECTS" className="highlights-section">
              {!data ? (
                <p role="status" className="text-ink-muted">Loading…</p>
              ) : articles ? (
                <StoryLinks
                  highlighted
                  articles={articles.filter((a) => a.is_highlight).slice(0, 5)}
                  emptyText="No highlights yet. Mark an article as a Highlight to feature it first."
                />
              ) : (
                <p className="text-ink-muted">Couldn't load articles.</p>
              )}
            </Section>

        </div>
      )}
      <p className="home-scribble">Good stories start with a little curiosity. ↗</p>
      </div>
      <div className="home-right">
        <p className="eyebrow page-dateline">ON THE RECORD <span>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}</span></p>
        <div className="right-page-heading"><p className="handwritten">A few things to keep in view.</p><span aria-hidden="true">✳</span></div>
            <Section title="Recently added" label="LATEST ENTRIES">
              {!data ? (
                <p role="status" className="text-ink-muted">Loading…</p>
              ) : articles ? (
                <StoryLinks articles={articles.slice(0, 5)} emptyText="No articles yet." />
              ) : (
                <p className="text-ink-muted">Couldn't load articles.</p>
              )}
            </Section>
          <Section title="Site content" label="THE BYLINE" className="site-status">
            {!data ? (
              <p role="status" className="text-ink-muted">Loading…</p>
            ) : settings ? (
              <>
                <dl className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['Headshot', settings.headshot_url],
                    ['Bio', settings.bio],
                    ['Resume', settings.resume_url],
                  ].map(([label, present]) => (
                    <div key={label}>
                      <dt className="text-sm text-ink-muted">{label}</dt>
                      <dd className={present ? 'font-medium text-success' : 'font-medium text-ink-muted'}>
                        {present ? '● Added' : '○ Missing'}
                      </dd>
                    </div>
                  ))}
                </dl>
                {settings.updated_at && (
                  <p className="mt-3 text-sm text-ink-muted">
                    Last updated {formatDateTime(settings.updated_at)} ·{' '}
                    <Link to="/dashboard/site" className="underline hover:text-ink">
                      Edit site content
                    </Link>
                  </p>
                )}
              </>
            ) : (
              <p className="text-ink-muted">Couldn't load site content.</p>
            )}
          </Section>
        <Link className="text-link site-edit-link" to="/dashboard/site">Manage site content ↗</Link>
      </div>
    </div>
  )
}
