import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ArticleForm = () => {
  const navigate = useNavigate()

  // 🔴 CHANGE: name → title
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('highlight')
  const [link, setLink] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

  const payload = {
  title,
  description,
  date,
  link,
  image_url: imageUrl || null,
  is_highlight: category === 'highlight',
  is_published: category === 'journalism',
}


    // (optional sanity check)
    // console.log(payload)

    const { error } = await supabase
      .from('articles')
      .insert([payload])

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    alert('Article saved successfully!')

    // reset form
    setTitle('')
    setDescription('')
    setDate('')
    setLink('')
    setImageUrl('')
    setCategory('highlight')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1F1F1F]">
      <div className="w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] max-w-lg bg-gray-200/80 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-lg">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#1F1F1F] mb-6">
          Create Article
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Article title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 w-full rounded-full px-4 py-2 bg-white/75 outline-none text-center"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md px-3 py-2 bg-white/75"
            />
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-md px-3 py-2 bg-white/75"
            />
          </div>

          {/* LINK */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Article link
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-md px-3 py-2 bg-white/75"
            />
          </div>

          {/* IMAGE URL */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F]">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-md px-3 py-2 bg-white/75"
            />
          </div>

          {/* IMAGE PREVIEW */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full max-h-56 rounded-md object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}

          {/* CATEGORY */}
          <div className="inline-flex w-full rounded-full overflow-hidden border border-gray-300">
            <button
              type="button"
              onClick={() => setCategory('highlight')}
              className={`flex-1 py-2 ${
                category === 'highlight'
                  ? 'bg-[#3a3a3a] text-white'
                  : 'bg-white text-black'
              }`}
            >
              Highlight
            </button>
            <button
              type="button"
              onClick={() => setCategory('journalism')}
              className={`flex-1 py-2 ${
                category === 'journalism'
                  ? 'bg-[#3a3a3a] text-white'
                  : 'bg-white text-black'
              }`}
            >
              Journalism
            </button>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="mt-4 py-2 px-5 rounded-full bg-[#3a3a3a] text-white font-medium hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          >
            Submit
          </button>
        </form>
      </div>

      {/* CREATIVE NAV + DELETE BUTTONS */}
      <div className="fixed bottom-8 left-8 right-8 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={() => navigate('/dashboard/creative')}
          className="pointer-events-auto py-2 px-5 rounded-full bg-[#0b5cff] text-gray-300 font-medium hover:bg-[#0a4edc] transition-colors shadow-lg"
        >
          Creative
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard/articles')}
          className="pointer-events-auto py-2 px-5 rounded-full bg-[#800020] text-gray-300 font-medium hover:bg-[#5c0016] transition-colors shadow-lg"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default ArticleForm
