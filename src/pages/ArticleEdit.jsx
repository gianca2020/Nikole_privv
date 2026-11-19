import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getArticle, createArticle, updateArticle } from '../lib/articles'
import { useToast } from '../components/Toast'
import useDocumentTitle from '../lib/useDocumentTitle'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import StatusMessage from '../components/ui/StatusMessage'

const emptyForm = {
  title: '',
  description: '',
  date: '',
  link: '',
  image_url: '',
  outlet: '',
  is_highlight: false,
  is_published: false,
}

// Rows created before a column existed (e.g. `outlet`) come back with nulls.
// Normalize so inputs stay controlled and the save handler can trim safely.
function toForm(data) {
  return {
    title: data.title ?? '',
    description: data.description ?? '',
    date: data.date ? String(data.date).slice(0, 10) : '',
    link: data.link ?? '',
    image_url: data.image_url ?? '',
    outlet: data.outlet ?? '',
    is_highlight: Boolean(data.is_highlight),
    is_published: Boolean(data.is_published),
  }
}

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const isNew = !id
  useDocumentTitle(isNew ? 'New article' : 'Edit article')

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!isNew) {
      loadArticle()
    }
  }, [id])

  async function loadArticle() {
    try {
      const data = await getArticle(id)
      const next = toForm(data)
      setForm(next)
      if (next.image_url) {
        setImagePreview(next.image_url)
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
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
      setErrors({ title: 'Enter a headline for this article.' })
      titleRef.current?.focus()
      return
    }

    try {
      setSaving(true)

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date || null,
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
    return <StatusMessage kind="loading" />
  }

  const category = form.is_highlight ? 'highlight' : form.is_published ? 'journalism' : ''

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          to="/dashboard/articles"
          className="inline-block text-white/70 hover:text-white mb-4"
        >
          ← Back to Articles
        </Link>
        <h2 className="font-serif text-3xl font-bold text-white">
          {isNew ? 'New Article' : 'Edit Article'}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="surface-paper space-y-6 bg-paper rounded-lg p-8 border border-rule"
      >
        <Field
          label="Title"
          required
          ref={titleRef}
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Article headline"
          error={errors.title}
        />

        <Field
          label="Description"
          as="textarea"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Brief summary"
          rows={4}
        />

        <Field
          label="Publication Date"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />

        <Field
          label="Article Link"
          type="url"
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="https://..."
        />

        <Field
          label="Outlet (Publication)"
          type="text"
          name="outlet"
          value={form.outlet}
          onChange={handleChange}
          placeholder="e.g. The Nation"
        />

        <div>
          <Field
            label="Image URL"
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleImageUrlChange}
            placeholder="https://..."
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview of the article image"
                className="h-40 w-auto rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <fieldset>
          <legend className="block text-ink font-medium mb-3">Category</legend>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="highlight"
                checked={category === 'highlight'}
                onChange={handleCategoryChange}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-ink">Highlight</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="journalism"
                checked={category === 'journalism'}
                onChange={handleCategoryChange}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-ink">Journalism</span>
            </label>
          </div>
        </fieldset>

        <div className="flex gap-3 pt-4">
          <Button type="submit" size="lg" className="flex-1" disabled={saving}>
            {saving ? 'Saving...' : isNew ? 'Create Article' : 'Save Changes'}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard/articles')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
