import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSettings } from '../lib/siteSettings'
import { uploadToSiteAssets, deleteFromSiteAssets } from '../lib/upload'
import { resizeImage, formatFileSize } from '../lib/image'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import useDocumentTitle from '../lib/useDocumentTitle'
import Button from '../components/ui/Button'
import FilePicker from '../components/ui/FilePicker'
import StatusMessage from '../components/ui/StatusMessage'

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

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    // Ensure bio state is initialized when settings load
    if (settings?.bio) {
      setBio(settings.bio)
    }
  }, [settings?.bio])

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
      <h2 className="font-serif text-3xl font-bold text-white">Site Content</h2>

      {/* === HEADSHOT === */}
      <div className="bg-white/5 rounded-lg p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Headshot</h3>
            <p className="text-white/60 text-sm">Approximately 520×574 (will be cropped to fit)</p>
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
            <p className="text-white/60 text-sm mb-2">Preview: {formatFileSize(headshot.size)}</p>
            <img
              src={headshot.preview}
              alt="Preview"
              className="w-40 h-52 rounded-lg object-cover"
            />
          </div>
        )}

        <div className="flex gap-3">
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
      </div>

      {/* === BIO === */}
      <div className="bg-white/5 rounded-lg p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-4">About / Bio</h3>
        <p className="text-white/60 text-sm mb-4">Leave a blank line between paragraphs.</p>

        {!bioEditing ? (
          <div>
            <div className="bg-white/5 rounded-lg p-4 mb-6 whitespace-pre-wrap text-white leading-relaxed">
              {bio || '(No bio yet)'}
            </div>
            <Button onClick={() => setBioEditing(true)}>Edit</Button>
          </div>
        ) : (
          <div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 mb-4 font-mono text-sm"
            />
            <p className="text-white/60 text-xs mb-4">{bio.length} characters</p>
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
      </div>

      {/* === RESUME === */}
      <div className="bg-white/5 rounded-lg p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-4">Resume</h3>

        {settings?.resume_url && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm mb-2">Current resume:</p>
            <a
              href={settings.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Open uploaded PDF →
            </a>
          </div>
        )}

        {resume.file && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white text-sm font-medium mb-2">Selected: {resume.file.name}</p>
            <p className="text-white/60 text-sm">{formatFileSize(resume.file.size)}</p>
          </div>
        )}

        <div className="flex gap-3">
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
            <Button variant="danger" size="lg" onClick={removeResume}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
