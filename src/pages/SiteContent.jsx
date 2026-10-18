import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSettings } from '../lib/siteSettings'
import { uploadToSiteAssets, deleteFromSiteAssets } from '../lib/upload'
import { resizeImage, formatFileSize } from '../lib/image'
import { useToast } from '../components/Toast'

export default function SiteContent() {
  const { addToast } = useToast()

  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
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

  async function loadSettings() {
    try {
      const data = await getSiteSettings()
      setSettings(data)
      setBio(data.bio || '')
    } catch (error) {
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

      // Upload new headshot
      const { url } = await uploadToSiteAssets(headshot.file, 'headshot')

      // Delete old headshot if it exists
      if (settings.headshot_url) {
        await deleteFromSiteAssets(settings.headshot_url)
      }

      // Update settings
      const updated = await updateSiteSettings({ headshot_url: url })
      setSettings(updated)
      setHeadshot({ file: null, preview: null, size: 0 })

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

      // Upload new resume
      const { url } = await uploadToSiteAssets(resume.file, 'resume')

      // Delete old resume if it exists
      if (settings.resume_url) {
        await deleteFromSiteAssets(settings.resume_url)
      }

      // Update settings
      const updated = await updateSiteSettings({ resume_url: url })
      setSettings(updated)
      setResume({ file: null, uploading: false })

      addToast('Resume uploaded! It will show on the site when the page loads next time.', 'success')
    } catch (error) {
      addToast('Failed to save resume', 'error')
      console.error(error)
    } finally {
      setResume(prev => ({ ...prev, uploading: false }))
    }
  }

  async function removeResume() {
    if (!settings?.resume_url) return

    try {
      await deleteFromSiteAssets(settings.resume_url)
      const updated = await updateSiteSettings({ resume_url: null })
      setSettings(updated)
      addToast('Resume removed. The old one will show on the site.', 'success')
    } catch (error) {
      addToast('Failed to remove resume', 'error')
      console.error(error)
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
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Site Content</h2>

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
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleHeadshotSelect}
              className="hidden"
              disabled={saving.headshot}
            />
            <span className="block px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/50 font-medium text-center cursor-pointer">
              {saving.headshot ? 'Uploading...' : headshot.file ? 'Change Image' : 'Choose Image'}
            </span>
          </label>
          {headshot.file && (
            <button
              onClick={saveHeadshot}
              disabled={saving.headshot}
              className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-600/50 font-medium"
            >
              {saving.headshot ? 'Saving...' : 'Save'}
            </button>
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
            <button
              onClick={() => setBioEditing(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Edit
            </button>
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
              <button
                onClick={saveBio}
                disabled={saving.bio}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-600/50 font-medium"
              >
                {saving.bio ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setBioEditing(false)
                  setBio(settings?.bio || '')
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium"
              >
                Cancel
              </button>
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
          <label className="flex-1">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeSelect}
              className="hidden"
              disabled={resume.uploading}
            />
            <span className="block px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/50 font-medium text-center cursor-pointer">
              {resume.uploading ? 'Uploading...' : resume.file ? 'Change PDF' : 'Choose PDF'}
            </span>
          </label>
          {resume.file && (
            <button
              onClick={saveResume}
              disabled={resume.uploading}
              className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-600/50 font-medium"
            >
              {resume.uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
          {settings?.resume_url && (
            <button
              onClick={removeResume}
              className="px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
