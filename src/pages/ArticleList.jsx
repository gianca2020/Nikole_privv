import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listArticles, deleteArticle } from '../lib/articles'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import useDocumentTitle from '../lib/useDocumentTitle'
import StatusMessage from '../components/ui/StatusMessage'

export default function ArticleList() {
  useDocumentTitle('Articles')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { confirm } = useConfirm()

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filter, setFilter] = useState('all')

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

  async function handleDelete(id, title) {
    confirm(`Delete "${title}"? This can't be undone.`, async () => {
      try {
        await deleteArticle(id)
        setArticles(articles.filter(a => a.id !== id))
        addToast('Article deleted', 'success')
      } catch (error) {
        addToast('Failed to delete article', 'error')
        console.error(error)
      }
    })
  }

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true
    if (filter === 'highlight') return article.is_highlight === true
    if (filter === 'journalism') return article.is_highlight === false
    return true
  })

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl font-bold text-white">Articles</h2>
        <button
          onClick={() => navigate('/dashboard/articles/new')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
        >
          + New Article
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'highlight', 'journalism'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards */}
      {articles.length === 0 ? (
        <StatusMessage
          kind="empty"
          message="No articles yet."
          actionLabel="Add your first article"
          onAction={() => navigate('/dashboard/articles/new')}
        />
      ) : filteredArticles.length === 0 ? (
        <p className="text-white/70 text-center py-8">No articles match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white font-semibold flex-1 text-sm">{article.title || 'Untitled'}</h3>
                <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  article.is_highlight
                    ? 'bg-blue-600/30 text-blue-200'
                    : 'bg-green-600/30 text-green-200'
                }`}>
                  {article.is_highlight ? 'Highlight' : 'Journalism'}
                </span>
              </div>
              <div className="space-y-2 mb-4 text-xs text-white/60">
                {article.date && <p><span className="text-white/40">Date:</span> {article.date}</p>}
                {article.outlet && <p><span className="text-white/40">Outlet:</span> {article.outlet}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard/articles/${article.id}/edit`)}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(article.id, article.title || 'Untitled')}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
