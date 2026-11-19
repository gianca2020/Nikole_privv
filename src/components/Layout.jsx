import { useAuth } from '../context/AuthContext'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Home', path: '/dashboard', end: true },
  { label: 'Articles', path: '/dashboard/articles' },
  { label: 'Creatives', path: '/dashboard/creative' },
  { label: 'Site Content', path: '/dashboard/site' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink">
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

      {/* Navigation: prefix matching keeps the section highlighted on edit pages */}
      <nav aria-label="Main" className="bg-[#2a2a2a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 flex-wrap">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-3 font-medium transition border-b-2 ${
                    isActive
                      ? 'text-white border-paper'
                      : 'text-white/70 border-transparent hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
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
