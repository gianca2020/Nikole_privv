import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listArticles } from '../lib/articles'
import { listCreatives } from '../lib/creatives'
import { getSiteSettings } from '../lib/siteSettings'
import { formatDateTime, storyMeta } from '../lib/format'
import useDocumentTitle from '../lib/useDocumentTitle'
import { buttonClass } from '../components/ui/buttonStyles'
import StatusMessage from '../components/ui/StatusMessage'

function StoryLinks({ articles, emptyText }) {
  if (articles.length === 0) {
    return <p className="text-ink-muted">{emptyText}</p>
  }
  return (
    <ul className="divide-y divide-rule">
      {articles.map((article) => (
        <li key={article.id}>
          <Link
            to={`/dashboard/articles/${article.id}/edit`}
            className="block py-3 hover:bg-paper -mx-2 px-2 rounded-md"
          >
            <span className="block font-serif text-lg font-semibold leading-snug break-words text-ink">
              {article.title || 'Untitled'}
            </span>
            {storyMeta(article) && (
              <span className="block text-sm text-ink-muted">{storyMeta(article)}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-rule bg-surface p-6">
      <h2 className="font-serif text-xl font-bold mb-3">{title}</h2>
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
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Hello, <span className="text-accent">Nikole</span>
          </h1>
          <p className="text-ink-muted">Manage your portfolio from here.</p>
        </div>
        <Link to="/dashboard/articles/new" className={buttonClass({ variant: 'primary', size: 'lg' })}>
          New article
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
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.to}
                className="rounded-lg border border-rule bg-surface p-4 sm:p-6 hover:bg-paper"
              >
                <span className="block font-serif text-3xl font-bold">{stat.value ?? '—'}</span>
                <span className="block text-sm text-ink-muted">{stat.label}</span>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Highlights">
              {!data ? (
                <p role="status" className="text-ink-muted">Loading…</p>
              ) : articles ? (
                <StoryLinks
                  articles={articles.filter((a) => a.is_highlight).slice(0, 5)}
                  emptyText="No highlights yet. Mark an article as a Highlight to feature it first."
                />
              ) : (
                <p className="text-ink-muted">Couldn't load articles.</p>
              )}
            </Section>

            <Section title="Recently added">
              {!data ? (
                <p role="status" className="text-ink-muted">Loading…</p>
              ) : articles ? (
                <StoryLinks articles={articles.slice(0, 5)} emptyText="No articles yet." />
              ) : (
                <p className="text-ink-muted">Couldn't load articles.</p>
              )}
            </Section>
          </div>

          <Section title="Site content">
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
                        {present ? 'Added' : 'Missing'}
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
        </div>
      )}
    </div>
  )
}
