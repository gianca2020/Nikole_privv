import { useAuth } from '../context/AuthContext'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Button from './ui/Button'

const navItems = [
  { label: 'Home', path: '/dashboard', end: true },
  { label: 'Articles', path: '/dashboard/articles' },
  { label: 'Creatives', path: '/dashboard/creative' },
  { label: 'Site Content', path: '/dashboard/site' },
]

function Brand() {
  return <p className="font-serif text-xl font-bold text-ink">Nikole's Admin</p>
}

// Prefix matching keeps the section highlighted on edit pages (aria-current is set by NavLink).
function NavItems({ vertical }) {
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            vertical
              ? `block rounded-md px-3 py-2 font-medium border-l-4 ${
                  isActive
                    ? 'border-accent bg-paper text-ink'
                    : 'border-transparent text-ink-muted hover:bg-paper hover:text-ink'
                }`
              : `shrink-0 px-3 sm:px-4 py-3 font-medium border-b-2 ${
                  isActive
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-paper text-ink lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      {/* Left rail, large screens */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:sticky lg:top-0 lg:h-screen border-r border-rule bg-surface p-6">
        <Brand />
        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          <NavItems vertical />
        </nav>
        <div className="mt-auto border-t border-rule pt-6">
          <p className="truncate text-sm text-ink-muted" title={user?.email}>
            {user?.email}
          </p>
          <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar, below large screens */}
        <header className="lg:hidden border-b border-rule bg-surface">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <Brand />
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
          <p className="truncate px-4 pb-1 text-sm text-ink-muted">{user?.email}</p>
          <nav aria-label="Main" className="flex overflow-x-auto px-1 sm:px-2">
            <NavItems />
          </nav>
        </header>

        <main id="main" tabIndex={-1} className="px-4 py-8 sm:px-6 lg:px-10 focus:outline-none">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
