import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCreative, createCreative, updateCreative } from '../lib/creatives'
import { useToast } from '../components/Toast'

export default function CreativeEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const isNew = !id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const [form, setForm] = useState({
    title: '',
    role_description: '',
    link: '',
    img_url: '',
  })

  useEffect(() => {
    if (!isNew) {
      loadCreative()
    }
  }, [id])

  async function loadCreative() {
    try {
      const data = await getCreative(id)
      setForm(data)
      if (data.img_url) {
        setImagePreview(data.img_url)
      }
    } catch {
      addToast('Failed to load creative', 'error')
      navigate('/dashboard/creative')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleImageUrlChange(e) {
    const url = e.target.value
    setForm(prev => ({ ...prev, img_url: url }))
    setImagePreview(url)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim()) {
      addToast('Title is required', 'error')
      return
    }

    if (!form.role_description.trim()) {
      addToast('Role description is required', 'error')
      return
    }

    try {
      setSaving(true)

      const payload = {
        title: form.title.trim(),
        role_description: form.role_description.trim(),
        link: form.link.trim() || null,
        img_url: form.img_url.trim() || null,
      }

      if (isNew) {
        await createCreative(payload)
        addToast('Creative created!', 'success')
      } else {
        await updateCreative(id, payload)
        addToast('Creative updated!', 'success')
      }

      navigate('/dashboard/creative')
    } catch (error) {
      addToast('Failed to save creative', 'error')
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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/creative')}
          className="text-white/60 hover:text-white mb-4"
        >
          ← Back to Creatives
        </button>
        <h2 className="text-3xl font-bold text-white">
          {isNew ? 'New Creative' : 'Edit Creative'}
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
            placeholder="Project title"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Role Description */}
        <div>
          <label className="block text-white font-medium mb-2">Role / Description *</label>
          <textarea
            name="role_description"
            value={form.role_description}
            onChange={handleChange}
            placeholder="Your role and what you did"
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-white font-medium mb-2">Project Link</label>
          <input
            type="url"
            name="link"
            value={form.link}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-white font-medium mb-2">Image URL</label>
          <input
            type="url"
            value={form.img_url}
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

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/50 font-medium"
          >
            {saving ? 'Saving...' : isNew ? 'Create Creative' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/creative')}
            className="px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
