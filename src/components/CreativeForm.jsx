import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CreativeForm = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [link, setLink] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    const payload = {
      title,
      role_description: roleDescription,
      link,
      img_url: imgUrl || null,
    }

    const { error } = await supabase
      .from('creatives')
      .insert([payload])

    if (error) {
      console.error(error)
      setStatus('error')
    } else {
      setStatus('success')
      setTitle('')
      setRoleDescription('')
      setLink('')
      setImgUrl('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1F1F1F]">
      <div className="w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] max-w-lg bg-gray-200/80 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-lg">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#1F1F1F] mb-6">
          Add Creative
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Creative title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 w-full rounded-full px-4 py-2 bg-white/75 outline-none text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Role description
            </label>
            <textarea
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              required
              rows={4}
              className="mt-2 w-full rounded-md px-3 py-2 bg-white/75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Link (optional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-md px-3 py-2 bg-white/75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Thumbnail image URL (optional)
            </label>
            <input
              type="url"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-md px-3 py-2 bg-white/75"
            />
          </div>

          {imgUrl && (
            <img
              src={imgUrl}
              alt="Preview"
              className="w-full max-h-56 rounded-md object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-4 py-2 px-5 rounded-full bg-[#3a3a3a] text-white font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-75 cursor-pointer"
          >
            {status === 'sending' ? 'Saving...' : 'Save'}
          </button>

          {status === 'success' && (
            <p className="text-green-600 text-center">Saved successfully!</p>
          )}
          {status === 'error' && (
            <p className="text-red-600 text-center">Something went wrong.</p>
          )}
        </form>
      </div>

      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="fixed bottom-8 right-8 py-2 px-5 rounded-full bg-[#0b5cff] text-white font-medium shadow-lg hover:bg-[#0a4edc] transition-colors"
      >
        Article
      </button>
    </div>
  )
}

export default CreativeForm
