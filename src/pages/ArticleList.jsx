import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listArticles, deleteArticle } from '../lib/articles'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function ArticleList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { confirm } = useConfirm()

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    try {
      setLoading(true)
      const data = await listArticles()
      setArticles(data)
    } catch (error) {
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
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Articles</h2>
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

      {/* Table */}
      {filteredArticles.length === 0 ? (
        <p className="text-white/60 text-center py-8">No articles found.</p>
      ) : (
        <div className="overflow-x-auto bg-white/5 rounded-lg border border-white/10">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Outlet</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map(article => (
                <tr key={article.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-white">{article.title || 'Untitled'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.is_highlight
                        ? 'bg-blue-600/30 text-blue-200'
                        : 'bg-green-600/30 text-green-200'
                    }`}>
                      {article.is_highlight ? 'Highlight' : 'Journalism'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{article.date || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-white/60">{article.outlet || '—'}</td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => navigate(`/dashboard/articles/${article.id}/edit`)}
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id, article.title || 'Untitled')}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
