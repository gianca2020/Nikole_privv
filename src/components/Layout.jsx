import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Articles', path: '/dashboard/articles' },
    { label: 'Creatives', path: '/dashboard/creative' },
    { label: 'Site Content', path: '/dashboard/site' },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      {/* Header */}
      <header className="bg-[#2a2a2a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold">Nikole's Admin</h1>
              <p className="text-white/60 text-sm mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#2a2a2a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 flex-wrap">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-3 font-medium transition ${
                  isActive(item.path)
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
