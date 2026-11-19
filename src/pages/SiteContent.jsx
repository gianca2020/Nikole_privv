import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSettings } from '../lib/siteSettings'
import { uploadToSiteAssets, deleteFromSiteAssets } from '../lib/upload'
import { resizeImage, formatFileSize } from '../lib/image'
import { formatDateTime } from '../lib/format'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import useDocumentTitle from '../lib/useDocumentTitle'
import useUnsavedChangesGuard from '../lib/useUnsavedChangesGuard'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import FilePicker from '../components/ui/FilePicker'
import StatusMessage from '../components/ui/StatusMessage'

const cardClass = 'bg-surface rounded-lg p-6 sm:p-8 border border-rule'

function paragraphsOf(text) {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
}

function Paragraphs({ text }) {
  const paragraphs = paragraphsOf(text)
  if (paragraphs.length === 0) return <p className="text-ink-muted">(No bio yet)</p>
  return (
    <div className="space-y-4 leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p}</p>
      ))}
    </div>
  )
}

export default function SiteContent() {
  useDocumentTitle('Site content')
  const { addToast } = useToast()
  const { confirm } = useConfirm()

  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState({ headshot: false, bio: false, resume: false })

  const [headshot, setHeadshot] = useState({
    file: null,
    preview: null,
    size: 0,
  })

  const [bio, setBio] = useState('')
  const [bioEditing, setBioEditing] = useState(false)

  const [resume, setResume] = useState({
    file: null,
    uploading: false,
  })

  useUnsavedChangesGuard(bioEditing && bio !== (settings?.bio || ''))

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      setLoadError(false)
      const data = await getSiteSettings()
      setSettings(data)
      setBio(data.bio || '')
    } catch (error) {
      setLoadError(true)
      addToast('Failed to load site settings', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // === HEADSHOT ===
  async function handleHeadshotSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error')
      return
    }

    try {
      const resized = await resizeImage(file, 1200, 0.85)
      const reader = new FileReader()

      reader.onload = (evt) => {
        setHeadshot({
          file: resized,
          preview: evt.target.result,
          size: resized.size,
        })
      }

      reader.readAsDataURL(resized)
    } catch (error) {
      addToast('Failed to process image', 'error')
      console.error(error)
    }
  }

  async function saveHeadshot() {
    if (!headshot.file || !settings) return

    try {
      setSaving(prev => ({ ...prev, headshot: true }))

      const previousUrl = settings.headshot_url

      // Upload new headshot, point settings at it, and only then remove the old file,
      // so a failed save never leaves the site pointing at a deleted image.
      const { url } = await uploadToSiteAssets(headshot.file, 'headshot')
      const updated = await updateSiteSettings({ headshot_url: url })
      setSettings(updated)
      setHeadshot({ file: null, preview: null, size: 0 })

      if (previousUrl) {
        await deleteFromSiteAssets(previousUrl)
      }

      addToast('Headshot updated! It will show on the site when the page loads next time.', 'success')
    } catch (error) {
      addToast('Failed to save headshot', 'error')
      console.error(error)
    } finally {
      setSaving(prev => ({ ...prev, headshot: false }))
    }
  }

  // === BIO ===
  async function saveBio() {
    if (!settings) return

    try {
      setSaving(prev => ({ ...prev, bio: true }))

      const updated = await updateSiteSettings({ bio })
      setSettings(updated)
      setBioEditing(false)

      addToast('Bio updated! It will show on the site when the page loads next time.', 'success')
    } catch (error) {
      addToast('Failed to save bio', 'error')
      console.error(error)
    } finally {
      setSaving(prev => ({ ...prev, bio: false }))
    }
  }

  // === RESUME ===
  async function handleResumeSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      addToast('Please select a PDF file', 'error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('PDF must be under 10MB', 'error')
      return
    }

    setResume({ file, uploading: false })
  }

  async function saveResume() {
    if (!resume.file || !settings) return

    try {
      setResume(prev => ({ ...prev, uploading: true }))

      const previousUrl = settings.resume_url

      // Same order as the headshot: upload, update settings, then delete the old file.
      const { url } = await uploadToSiteAssets(resume.file, 'resume')
      const updated = await updateSiteSettings({ resume_url: url })
      setSettings(updated)
      setResume({ file: null, uploading: false })

      if (previousUrl) {
        await deleteFromSiteAssets(previousUrl)
      }

      addToast('Resume uploaded! It will show on the site when the page loads next time.', 'success')
    } catch (error) {
      addToast('Failed to save resume', 'error')
      console.error(error)
    } finally {
      setResume(prev => ({ ...prev, uploading: false }))
    }
  }

  function removeResume() {
    if (!settings?.resume_url) return
    const previousUrl = settings.resume_url

    confirm(
      'Remove your resume from the site? Visitors will no longer be able to download it.',
      async () => {
        try {
          // Clear the setting first, then delete the file.
          const updated = await updateSiteSettings({ resume_url: null })
          setSettings(updated)
          await deleteFromSiteAssets(previousUrl)
          addToast('Resume removed from your site.', 'success')
        } catch (error) {
          addToast('Failed to remove resume', 'error')
          console.error(error)
        }
      },
      undefined,
      { confirmLabel: 'Remove', pendingLabel: 'Removing…' }
    )
  }

  if (loading) {
    return <StatusMessage kind="loading" />
  }

  if (loadError) {
    return (
      <StatusMessage
        kind="error"
        message="Couldn't load your site content. Check your connection and try again."
        actionLabel="Try again"
        onAction={loadSettings}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Site Content</h1>
        {settings?.updated_at && (
          <p className="text-ink-muted text-sm mt-1">Last updated {formatDateTime(settings.updated_at)}</p>
        )}
      </div>

      {/* === HEADSHOT === */}
      <section aria-labelledby="headshot-heading" className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 id="headshot-heading" className="font-serif text-2xl font-bold mb-1">Headshot</h2>
            <p className="text-ink-muted text-sm">Approximately 520×574 (will be cropped to fit)</p>
          </div>
          {settings?.headshot_url && (
            <img
              src={settings.headshot_url}
              alt="Current headshot"
              className="w-24 h-32 rounded-lg object-cover"
            />
          )}
        </div>

        {headshot.preview && (
          <div className="mb-6">
            <p className="text-ink-muted text-sm mb-2">New image preview: {formatFileSize(headshot.size)}</p>
            <img
              src={headshot.preview}
              alt="Preview of the new headshot"
              className="w-40 h-52 rounded-lg object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <FilePicker
            className="flex-1"
            accept="image/*"
            onChange={handleHeadshotSelect}
            disabled={saving.headshot}
          >
            {saving.headshot ? 'Uploading...' : headshot.file ? 'Change Image' : 'Choose Image'}
          </FilePicker>
          {headshot.file && (
            <Button
              variant="success"
              size="lg"
              className="flex-1"
              onClick={saveHeadshot}
              disabled={saving.headshot}
            >
              {saving.headshot ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </section>

      {/* === BIO === */}
      <section aria-labelledby="bio-heading" className={cardClass}>
        <h2 id="bio-heading" className="font-serif text-2xl font-bold mb-4">About / Bio</h2>

        {!bioEditing ? (
          <div>
            <div className="bg-paper rounded-lg p-4 mb-6">
              <Paragraphs text={bio} />
            </div>
            <Button onClick={() => setBioEditing(true)}>Edit</Button>
          </div>
        ) : (
          <div>
            <Field
              label="Bio text"
              hint="Leave a blank line between paragraphs."
              as="textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={10}
              className="mb-2"
            />
            <p className="text-ink-muted text-xs mb-6">{bio.length} characters</p>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-ink-muted mb-2">Approximate preview</h3>
              <div className="bg-paper rounded-lg p-4">
                <Paragraphs text={bio} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="success" className="flex-1" onClick={saveBio} disabled={saving.bio}>
                {saving.bio ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setBioEditing(false)
                  setBio(settings?.bio || '')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* === RESUME === */}
      <section aria-labelledby="resume-heading" className={cardClass}>
        <h2 id="resume-heading" className="font-serif text-2xl font-bold mb-4">Resume</h2>

        {settings?.resume_url && (
          <div className="mb-6 p-4 rounded-lg bg-paper border border-rule">
            <p className="text-ink-muted text-sm mb-2">Current resume:</p>
            <a
              href={settings.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline text-sm"
            >
              Open uploaded PDF (opens in a new tab) ↗
            </a>
          </div>
        )}

        {resume.file && (
          <div className="mb-6 p-4 rounded-lg bg-paper border border-rule">
            <p className="text-sm font-medium mb-1">Selected: {resume.file.name}</p>
            <p className="text-ink-muted text-sm">{formatFileSize(resume.file.size)}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <FilePicker
            className="flex-1"
            accept="application/pdf"
            onChange={handleResumeSelect}
            disabled={resume.uploading}
          >
            {resume.uploading ? 'Uploading...' : resume.file ? 'Change PDF' : 'Choose PDF'}
          </FilePicker>
          {resume.file && (
            <Button
              variant="success"
              size="lg"
              className="flex-1"
              onClick={saveResume}
              disabled={resume.uploading}
            >
              {resume.uploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
          {settings?.resume_url && (
            <Button variant="dangerOutline" size="lg" onClick={removeResume}>
              Remove
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
