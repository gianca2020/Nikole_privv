import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCreative, createCreative, updateCreative } from '../lib/creatives'
import { useToast } from '../components/Toast'
import useDocumentTitle from '../lib/useDocumentTitle'
import useUnsavedChangesGuard from '../lib/useUnsavedChangesGuard'
import ImagePreview from '../components/ui/ImagePreview'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import StatusMessage from '../components/ui/StatusMessage'

const emptyForm = {
  title: '',
  role_description: '',
  link: '',
  img_url: '',
}

// Nullable columns come back as null; keep inputs controlled and trims safe.
function toForm(data) {
  return {
    title: data.title ?? '',
    role_description: data.role_description ?? '',
    link: data.link ?? '',
    img_url: data.img_url ?? '',
  }
}

export default function CreativeEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const isNew = !id
  useDocumentTitle(isNew ? 'New creative' : 'Edit creative')

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)
  const roleRef = useRef(null)

  const [form, setForm] = useState(emptyForm)
  const initialRef = useRef(emptyForm)
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialRef.current)
  const { allowNavigation } = useUnsavedChangesGuard(isDirty)

  useEffect(() => {
    if (!isNew) {
      loadCreative()
    }
  }, [id])

  async function loadCreative() {
    try {
      const data = await getCreative(id)
      const next = toForm(data)
      initialRef.current = next
      setForm(next)
      if (next.img_url) {
        setImagePreview(next.img_url)
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  function handleImageUrlChange(e) {
    const url = e.target.value
    setForm(prev => ({ ...prev, img_url: url }))
    setImagePreview(url)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Enter a title for this project.'
    if (!form.role_description.trim()) nextErrors.role_description = 'Describe your role on this project.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      ;(nextErrors.title ? titleRef : roleRef).current?.focus()
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

      allowNavigation()
      navigate('/dashboard/creative')
    } catch (error) {
      addToast('Failed to save creative', 'error')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <StatusMessage kind="loading" />
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          to="/dashboard/creative"
          className="inline-block text-ink-muted underline hover:text-ink mb-4"
        >
          ← Back to Creatives
        </Link>
        <h1 className="font-serif text-3xl font-bold">
          {isNew ? 'New Creative' : 'Edit Creative'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-surface rounded-lg p-8 border border-rule"
      >
        <Field
          label="Title"
          required
          ref={titleRef}
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Project title"
          error={errors.title}
        />

        <Field
          label="Role / Description"
          required
          as="textarea"
          ref={roleRef}
          name="role_description"
          value={form.role_description}
          onChange={handleChange}
          placeholder="Your role and what you did"
          rows={4}
          error={errors.role_description}
        />

        <Field
          label="Project Link"
          type="url"
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="https://..."
        />

        <div>
          <Field
            label="Image URL"
            type="url"
            name="img_url"
            value={form.img_url}
            onChange={handleImageUrlChange}
            placeholder="https://..."
          />
          {imagePreview && (
            <div className="mt-4">
              <ImagePreview
                src={imagePreview}
                alt="Preview of the project image"
                className="h-40 w-auto rounded-lg object-cover"
                announce
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" size="lg" className="flex-1" disabled={saving}>
            {saving ? 'Saving...' : isNew ? 'Create Creative' : 'Save Changes'}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard/creative')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
