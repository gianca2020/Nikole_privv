import { Link } from 'react-router-dom'
import { formatDateTime, storyMeta } from '../lib/format'
import useDocumentTitle from '../lib/useDocumentTitle'
import { buttonClass } from '../components/ui/buttonStyles'
import StatusMessage from '../components/ui/StatusMessage'

function StoryLinks({ articles, emptyText, highlighted = false }) {
  if (articles.length === 0) return <p className="py-3 text-ink-muted">{emptyText}</p>
  return (
    <ol className="story-list">
      {articles.map((article, i) => (
        <li key={article.id}>
          <Link to={`/dashboard/articles/${article.id}/edit`}>
            <span className="story-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="story-title">
                {highlighted ? <mark>{article.title || 'Untitled'}</mark> : article.title || 'Untitled'}
              </span>
              {storyMeta(article) && <span className="story-meta mono-meta">{storyMeta(article)}</span>}
            </span>
            <span className="story-arrow" aria-hidden="true">↗</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

function Section({ title, label, children }) {
  return (
    <section className="journal-section">
      <div className="section-heading">
        <h2>{title}</h2>
        {label && <span className="eyebrow">{label}</span>}
      </div>
      {children}
    </section>
  )
}

export function HomeLeft({ state }) {
  useDocumentTitle('Home')
  const { data, failed, load } = state
  const articles = data?.articles
  const stats = [
    { label: 'Articles', value: articles?.length, to: '/dashboard/articles' },
    { label: 'Highlights', value: articles?.filter((a) => a.is_highlight).length, to: '/dashboard/articles' },
    { label: 'Creatives', value: data?.creatives?.length, to: '/dashboard/creative' },
  ]

  return (
    <div>
      <p className="eyebrow page-dateline"><span>The daily briefing</span><span>01 / Home</span></p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="greeting">Hello, <span>Nikole</span></h1>
          <p className="handwritten mt-1">A new page. A story worth telling.</p>
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
        <>
          <div className="journal-stats">
            {stats.map((stat) => (
              <Link key={stat.label} to={stat.to} className="journal-stat">
                <span className="stat-value">{stat.value ?? '—'}</span>
                <span className="stat-label">{stat.label}</span>
              </Link>
            ))}
          </div>

          <Section title="Highlights" label="The selects">
            {!data ? (
              <p role="status" className="py-3 text-ink-muted">Loading…</p>
            ) : articles ? (
              <StoryLinks
                highlighted
                articles={articles.filter((a) => a.is_highlight).slice(0, 5)}
                emptyText="No highlights yet. Mark an article as a Highlight to feature it first."
              />
            ) : (
              <p className="py-3 text-ink-muted">Couldn't load articles.</p>
            )}
          </Section>
        </>
      )}
    </div>
  )
}

export function HomeRight({ state }) {
  const { data, failed } = state
  const articles = data?.articles
  const settings = data?.settings
  const today = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())

  return (
    <div>
      <p className="eyebrow page-dateline"><span>On the record</span><span>{today}</span></p>

      {failed ? (
        <p className="handwritten">Nothing to show until the desk reconnects.</p>
      ) : (
        <>
          <Section title="Recently added" label="Latest entries">
            {!data ? (
              <p role="status" className="py-3 text-ink-muted">Loading…</p>
            ) : articles ? (
              <StoryLinks articles={articles.slice(0, 5)} emptyText="No articles yet." />
            ) : (
              <p className="py-3 text-ink-muted">Couldn't load articles.</p>
            )}
          </Section>

          <Section title="Site content" label="The byline">
            {!data ? (
              <p role="status" className="py-3 text-ink-muted">Loading…</p>
            ) : settings ? (
              <>
                <dl className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['Headshot', settings.headshot_url],
                    ['Bio', settings.bio],
                    ['Resume', settings.resume_url],
                  ].map(([label, present]) => (
                    <div key={label}>
                      <dt className="mono-meta">{label}</dt>
                      <dd className={present ? 'font-semibold text-success' : 'font-semibold text-ink-muted'}>
                        {present ? '● Added' : '○ Missing'}
                      </dd>
                    </div>
                  ))}
                </dl>
                {settings.updated_at && (
                  <p className="mt-3 text-ink-muted">Last updated {formatDateTime(settings.updated_at)}</p>
                )}
              </>
            ) : (
              <p className="py-3 text-ink-muted">Couldn't load site content.</p>
            )}
            <p className="mt-3">
              <Link className="text-link" to="/dashboard/site">Manage site content ↗</Link>
            </p>
          </Section>
        </>
      )}
      <span className="margin-note" aria-hidden="true">good stories start with curiosity.</span>
    </div>
  )
}

// Phones show Home as one scrolling page.
export function HomeSingle({ state }) {
  return (
    <>
      <HomeLeft state={state} />
      <div className="mt-8"><HomeRight state={state} /></div>
    </>
  )
}
