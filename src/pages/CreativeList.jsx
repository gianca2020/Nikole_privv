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
        <h1 className="page-title">Creatives</h1>
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
        <ul className="entry-list">
          {creatives.map(creative => (
            <li key={creative.id} className="entry-row">
              {creative.img_url && (
                <ImagePreview
                  src={creative.img_url}
                  alt=""
                  className="w-full h-36 object-cover border border-rule-strong"
                />
              )}
              <h2 className="story-title">{creative.title}</h2>
              <p className="text-ink-muted">{creative.role_description}</p>
              {creative.link && (
                <a
                  href={creative.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${creative.title} (opens in a new tab)`}
                  className="text-link self-start"
                >
                  View ↗
                </a>
              )}
              <div className="entry-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`Edit ${creative.title}`}
                  onClick={() => navigate(`/dashboard/creative/${creative.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="dangerOutline"
                  size="sm"
                  aria-label={`Delete ${creative.title}`}
                  onClick={() => handleDelete(creative.id, creative.title)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
