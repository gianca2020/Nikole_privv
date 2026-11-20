import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listArticles, deleteArticle } from '../lib/articles'
import { storyMeta } from '../lib/format'
import { turnOptions } from '../lib/pageTurn'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import useDocumentTitle from '../lib/useDocumentTitle'
import Button from '../components/ui/Button'
import { buttonClass } from '../components/ui/buttonStyles'
import StatusMessage from '../components/ui/StatusMessage'

const CATEGORY_LABELS = {
  highlight: 'Highlight',
  journalism: 'Journalism',
  uncategorized: 'Not categorized',
}

const BADGE_STYLES = {
  highlight: 'stamp-highlight',
  journalism: 'stamp-journalism',
  uncategorized: 'stamp-uncategorized',
}

// Mirrors the edit form: Highlight and Journalism are the only two choices;
// a row with neither flag is shown honestly instead of being called Journalism.
function categoryOf(article) {
  if (article.is_highlight) return 'highlight'
  if (article.is_published) return 'journalism'
  return 'uncategorized'
}

function sortTime(article, sort) {
  const value = sort === 'published' ? article.date || article.created_at : article.created_at
  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}

export default function ArticleList() {
  useDocumentTitle('Articles')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { confirm } = useConfirm()

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('published')

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    try {
      setLoading(true)
      setLoadError(false)
      const data = await listArticles()
      setArticles(data)
    } catch (error) {
      setLoadError(true)
      addToast('Failed to load articles', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete(id, title) {
    confirm(`Delete "${title}"? This can't be undone.`, async () => {
      try {
        await deleteArticle(id)
        setArticles(prev => prev.filter(a => a.id !== id))
        addToast('Article deleted', 'success')
      } catch (error) {
        addToast('Failed to delete article', 'error')
        console.error(error)
      }
    })
  }

  const counts = useMemo(() => {
    const result = { all: articles.length, highlight: 0, journalism: 0, uncategorized: 0 }
    articles.forEach(a => { result[categoryOf(a)] += 1 })
    return result
  }, [articles])

  const visibleArticles = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return articles
      .filter(a => filter === 'all' || categoryOf(a) === filter)
      .filter(a => {
        if (!needle) return true
        return (a.title || '').toLowerCase().includes(needle) || (a.outlet || '').toLowerCase().includes(needle)
      })
      .sort((a, b) => sortTime(b, sort) - sortTime(a, sort))
  }, [articles, filter, query, sort])

  if (loading) {
    return <StatusMessage kind="loading" />
  }

  if (loadError) {
    return (
      <StatusMessage
        kind="error"
        message="Couldn't load your articles. Check your connection and try again."
        actionLabel="Try again"
        onAction={loadArticles}
      />
    )
  }

  const filters = ['all', 'highlight', 'journalism', ...(counts.uncategorized > 0 ? ['uncategorized'] : [])]
  const filterLabel = (f) => (f === 'all' ? 'All' : f === 'highlight' ? 'Highlights' : CATEGORY_LABELS[f])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="page-title">Articles</h1>
        <Link to="/dashboard/articles/new" {...turnOptions()} className={buttonClass({ variant: 'primary' })}>
          + New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <StatusMessage
          kind="empty"
          message="No articles yet."
          actionLabel="Add your first article"
          onAction={() => navigate('/dashboard/articles/new', turnOptions())}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div className="grow sm:max-w-sm">
              <label htmlFor="article-search" className="sr-only">Search articles by headline or outlet</label>
              <input
                id="article-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search headline or outlet"
                className="w-full px-3 py-2 rounded-sm bg-surface border border-ink/40 text-ink placeholder:text-ink-muted/70"
              />
            </div>
            <div>
              <label htmlFor="article-sort" className="block mono-meta mb-1">Sort by</label>
              <select
                id="article-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="min-h-11 px-3 py-2 rounded-sm bg-surface border border-ink/40 text-ink"
              >
                <option value="published">Newest published</option>
                <option value="added">Recently added</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Filter by category">
            {filters.map(f => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className="filter-chip"
              >
                {filterLabel(f)} <span className="opacity-80">({counts[f]})</span>
              </button>
            ))}
          </div>

          <p aria-live="polite" className="mono-meta mb-2">
            Showing {visibleArticles.length} of {articles.length}
          </p>

          {visibleArticles.length === 0 ? (
            <p className="text-ink-muted text-center py-8">No articles match your search or filter.</p>
          ) : (
            <ul className="entry-list">
              {visibleArticles.map(article => {
                const title = article.title || 'Untitled'
                const category = categoryOf(article)
                const meta = storyMeta(article)
                return (
                  <li key={article.id} className="entry-row">
                    <div className="min-w-0">
                      <h2 className="story-title line-clamp-3">
                        {category === 'highlight' ? <mark>{title}</mark> : title}
                      </h2>
                      <p className="mono-meta mt-1">{meta || 'No outlet or date'}</p>
                    </div>
                    <div className="entry-actions">
                      <span className={`stamp ${BADGE_STYLES[category]}`}>
                        {CATEGORY_LABELS[category]}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-label={`Edit ${title}`}
                        onClick={() => navigate(`/dashboard/articles/${article.id}/edit`, turnOptions())}
                      >
                        Edit
                      </Button>
                      {article.link && (
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${title} (opens in a new tab)`}
                          className={buttonClass({ variant: 'ghost', size: 'sm' })}
                        >
                          Open ↗
                        </a>
                      )}
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        aria-label={`Delete ${title}`}
                        onClick={() => handleDelete(article.id, title)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
