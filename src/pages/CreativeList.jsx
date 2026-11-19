import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listCreatives, deleteCreative } from '../lib/creatives'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import useDocumentTitle from '../lib/useDocumentTitle'
import Button from '../components/ui/Button'
import { buttonClass } from '../components/ui/buttonStyles'
import ImagePreview from '../components/ui/ImagePreview'
import StatusMessage from '../components/ui/StatusMessage'

export default function CreativeList() {
  useDocumentTitle('Creatives')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { confirm } = useConfirm()

  const [creatives, setCreatives] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    loadCreatives()
  }, [])

  async function loadCreatives() {
    try {
      setLoading(true)
      setLoadError(false)
      const data = await listCreatives()
      setCreatives(data)
    } catch (error) {
      setLoadError(true)
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
        setCreatives(prev => prev.filter(c => c.id !== id))
        addToast('Creative deleted', 'success')
      } catch (error) {
        addToast('Failed to delete creative', 'error')
        console.error(error)
      }
    })
  }

  if (loading) {
    return <StatusMessage kind="loading" />
  }

  if (loadError) {
    return (
      <StatusMessage
        kind="error"
        message="Couldn't load your creatives. Check your connection and try again."
        actionLabel="Try again"
        onAction={loadCreatives}
      />
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-3xl font-bold">Creatives</h1>
        <Link to="/dashboard/creative/new" className={buttonClass({ variant: 'primary' })}>
          + New Creative
        </Link>
      </div>

      {creatives.length === 0 ? (
        <StatusMessage
          kind="empty"
          message="No creatives yet."
          actionLabel="Add your first creative"
          onAction={() => navigate('/dashboard/creative/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatives.map(creative => (
            <div key={creative.id} className="flex flex-col bg-surface rounded-lg p-6 border border-rule">
              {creative.img_url && (
                <ImagePreview
                  src={creative.img_url}
                  alt=""
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="font-serif text-lg font-semibold leading-snug break-words mb-2">{creative.title}</h2>
              <p className="text-ink-muted text-sm mb-4">{creative.role_description}</p>
              {creative.link && (
                <a
                  href={creative.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${creative.title} (opens in a new tab)`}
                  className="text-accent underline text-sm mb-4 block"
                >
                  View ↗
                </a>
              )}
              <div className="mt-auto flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  aria-label={`Edit ${creative.title}`}
                  onClick={() => navigate(`/dashboard/creative/${creative.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="dangerOutline"
                  size="sm"
                  className="flex-1"
                  aria-label={`Delete ${creative.title}`}
                  onClick={() => handleDelete(creative.id, creative.title)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
