import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArticle, createArticle, updateArticle } from '../lib/articles'
import { useToast } from '../components/Toast'

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const isNew = !id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    link: '',
    image_url: '',
    outlet: '',
    is_highlight: false,
    is_published: false,
  })

  useEffect(() => {
    if (!isNew) {
      loadArticle()
    }
  }, [id])

  async function loadArticle() {
    try {
      const data = await getArticle(id)
      setForm(data)
      if (data.image_url) {
        setImagePreview(data.image_url)
      }
    } catch {
      addToast('Failed to load article', 'error')
      navigate('/dashboard/articles')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleImageUrlChange(e) {
    const url = e.target.value
    setForm(prev => ({ ...prev, image_url: url }))
    setImagePreview(url)
  }

  function handleCategoryChange(e) {
    const category = e.target.value
    setForm(prev => ({
      ...prev,
      is_highlight: category === 'highlight',
      is_published: category === 'journalism',
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim()) {
      addToast('Title is required', 'error')
      return
    }

    try {
      setSaving(true)

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        link: form.link.trim(),
        image_url: form.image_url.trim() || null,
        outlet: form.outlet.trim() || null,
        is_highlight: form.is_highlight,
        is_published: form.is_published,
      }

      if (isNew) {
        await createArticle(payload)
        addToast('Article created!', 'success')
      } else {
        await updateArticle(id, payload)
        addToast('Article updated!', 'success')
      }

      navigate('/dashboard/articles')
    } catch (error) {
      addToast('Failed to save article', 'error')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  const category = form.is_highlight ? 'highlight' : form.is_published ? 'journalism' : ''

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/articles')}
          className="text-white/60 hover:text-white mb-4"
        >
          ← Back to Articles
        </button>
        <h2 className="text-3xl font-bold text-white">
          {isNew ? 'New Article' : 'Edit Article'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 rounded-lg p-8 border border-white/10">
        {/* Title */}
        <div>
          <label className="block text-white font-medium mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Article headline"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-white font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief summary"
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-white font-medium mb-2">Publication Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-white font-medium mb-2">Article Link</label>
          <input
            type="url"
            name="link"
            value={form.link}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Outlet */}
        <div>
          <label className="block text-white font-medium mb-2">Outlet (Publication)</label>
          <input
            type="text"
            name="outlet"
            value={form.outlet}
            onChange={handleChange}
            placeholder="e.g. The Nation"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-white font-medium mb-2">Image URL</label>
          <input
            type="url"
            value={form.image_url}
            onChange={handleImageUrlChange}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-auto rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-white font-medium mb-3">Category</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="highlight"
                checked={category === 'highlight'}
                onChange={handleCategoryChange}
                className="w-4 h-4"
              />
              <span className="text-white">Highlight</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="journalism"
                checked={category === 'journalism'}
                onChange={handleCategoryChange}
                className="w-4 h-4"
              />
              <span className="text-white">Journalism</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/50 font-medium"
          >
            {saving ? 'Saving...' : isNew ? 'Create Article' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/articles')}
            className="px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
