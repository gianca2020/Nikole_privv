import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ArticleTable = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [creatives, setCreatives] = useState([])
  const [creativeError, setCreativeError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'highlight', 'journalism', 'creative'
  const [creativeDeleteName, setCreativeDeleteName] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchArticles()
      await fetchCreatives()
      setLoading(false)
    }
    loadData()
  }, [])

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      alert('Error fetching articles')
    } else {
      setArticles(data || [])
    }
  }

  const fetchCreatives = async () => {
    const { data, error } = await supabase
      .from('creatives')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching creatives:', error)
      setCreativeError(error.message || 'Failed to load creatives')
    } else {
      setCreatives(data || [])
      setCreativeError(null)
    }
  }

  const handleDelete = async (id, articleName) => {
    if (!window.confirm(`Are you sure you want to delete "${articleName}"?`)) {
      return
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting article:', error)
      alert('Error deleting article: ' + error.message)
    } else {
      alert('Article deleted successfully!')
      fetchArticles() // Refresh the list
    }
  }

  const handleDeleteCreative = async (id, creativeTitle) => {
    if (!window.confirm(`Are you sure you want to delete creative "${creativeTitle}"?`)) {
      return
    }

    const { error } = await supabase
      .from('creatives')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting creative:', error)
      alert('Error deleting creative: ' + error.message)
    } else {
      alert('Creative deleted successfully!')
      setTimeout(() => {
        fetchCreatives()
      }, 500)
    }
  }

  const filteredArticles = articles.filter((article) => {
    if (filter === 'all') return true
    if (filter === 'highlight') return article.is_highlight === true
    if (filter === 'journalism') return article.is_highlight === false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1F1F1F]">
        <p className="text-white text-xl">Loading articles...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-[#1F1F1F]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-3xl font-semibold text-white text-center">
            Manage Articles
          </h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-medium ${
              filter === 'all'
                ? 'bg-[#0b5cff] text-white'
                : 'bg-white/20 text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('highlight')}
            className={`px-4 py-2 rounded-full font-medium ${
              filter === 'highlight'
                ? 'bg-[#0b5cff] text-white'
                : 'bg-white/20 text-white'
            }`}
          >
            Highlights
          </button>
          <button
            onClick={() => setFilter('journalism')}
            className={`px-4 py-2 rounded-full font-medium ${
              filter === 'journalism'
                ? 'bg-[#0b5cff] text-white'
                : 'bg-white/20 text-white'
            }`}
          >
            Journalism
          </button>
          <button
            onClick={() => setFilter('creative')}
            className={`px-4 py-2 rounded-full font-medium ${
              filter === 'creative'
                ? 'bg-[#0b5cff] text-white'
                : 'bg-white/20 text-white'
            }`}
          >
            Creative
          </button>
        </div>

        {/* Articles Table */}
        {filter !== 'creative' && (
          <>
            {filteredArticles.length === 0 ? (
              <p className="text-white text-center">No articles found.</p>
            ) : (
              <div className="overflow-x-auto bg-gray-200/80 backdrop-blur-md rounded-2xl shadow-lg">
                <table className="w-full">
                  <thead className="bg-gray-400">
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F1F1F]">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F1F1F]">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F1F1F]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F1F1F]">
                        Link
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-[#1F1F1F]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b border-gray-200 hover:bg-white/50"
                      >
                        <td className="px-4 py-3 text-sm text-[#1F1F1F]">
                          {article.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#1F1F1F]">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              article.is_highlight
                                ? 'bg-blue-500 text-white'
                                : 'bg-green-500 text-white'
                            }`}
                          >
                            {article.is_highlight ? 'Highlight' : 'Journalism'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#1F1F1F]">
                          {article.date || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#1F1F1F]">
                          {article.link ? (
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(article.id, article.name)}
                            className="px-4 py-1 rounded-full bg-[#dc3545] text-white text-sm font-medium hover:bg-[#c82333] transition-colors"
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
          </>
        )}

        {/* Creatives Grid */}
        {filter === 'creative' && (
          <>
            {creativeError ? (
              <p className="text-red-400 text-center">{creativeError}</p>
            ) : creatives.length === 0 ? (
              <p className="text-white text-center">No creatives found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creatives.map((creative) => (
                  <div
                    key={creative.id}
                    className="bg-[#F6F1E8]/90 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg"
                  >
                    {creative.img_url && (
                      <img
                        src={creative.img_url}
                        alt={creative.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">
                      {creative.title}
                    </h3>
                    <p className="text-sm text-[#1F1F1F] mb-4">
                      {creative.role_description}
                    </p>
                    {creative.link && (
                      <a
                        href={creative.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mb-4 block"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteCreative(creative.id, creative.title)}
                      className="w-full px-4 py-2 rounded-full bg-[#dc3545] text-white text-sm font-medium hover:bg-[#c82333] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className="fixed bottom-8 left-8 px-4 py-2 rounded-full bg-gray-500 text-white font-medium hover:bg-gray-600 transition-colors shadow-lg"
      >
        ← Back
      </button>
    </div>
  )
}

export default ArticleTable
