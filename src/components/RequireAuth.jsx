import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="desk login-desk">
        <p role="status" className="font-hand text-2xl text-paper/80">Opening the notebook…</p>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
