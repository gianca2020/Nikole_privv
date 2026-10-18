import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCreatives, deleteCreative } from '../lib/creatives'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function CreativeList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { confirm } = useConfirm()

  const [creatives, setCreatives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCreatives()
  }, [])

  async function loadCreatives() {
    try {
      setLoading(true)
      const data = await listCreatives()
      setCreatives(data)
    } catch (error) {
      addToast('Failed to load creatives', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, title) {
    confirm(`Delete "${title}"? This can't be undone.`, async () => {
      try {
        await deleteCreative(id)
        setCreatives(creatives.filter(c => c.id !== id))
        addToast('Creative deleted', 'success')
      } catch (error) {
        addToast('Failed to delete creative', 'error')
        console.error(error)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Creatives</h2>
        <button
          onClick={() => navigate('/dashboard/creative/new')}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium"
        >
          + New Creative
        </button>
      </div>

      {creatives.length === 0 ? (
        <p className="text-white/60 text-center py-8">No creatives found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatives.map(creative => (
            <div key={creative.id} className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-white/20">
              {creative.img_url && (
                <img
                  src={creative.img_url}
                  alt={creative.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <h3 className="text-white font-semibold mb-2">{creative.title}</h3>
              <p className="text-white/60 text-sm mb-4">{creative.role_description}</p>
              {creative.link && (
                <a
                  href={creative.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm mb-4 block"
                >
                  View →
                </a>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard/creative/${creative.id}/edit`)}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(creative.id, creative.title)}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
