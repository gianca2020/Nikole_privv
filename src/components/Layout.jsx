import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { useConfirm } from './ConfirmDialog'
import Book from './journal/Book'
import ArticleList from '../pages/ArticleList'
import CreativeList from '../pages/CreativeList'
import SiteContent from '../pages/SiteContent'
import { HomeLeft, HomeRight, HomeSingle } from '../pages/Home'
import { useHomeData } from '../lib/useHomeData'
import { SECTIONS, isEditorPath, pageForSection, sectionIndex } from '../lib/sections'
import { useMediaQuery, usePrefersReducedMotion } from '../lib/useMedia'

const COVER_KEY = 'nikole-cover-opened'

function coverAlreadyOpened() {
  try {
    return sessionStorage.getItem(COVER_KEY) === '1'
  } catch {
    return false
  }
}

function rememberCover(opened) {
  try {
    if (opened) sessionStorage.setItem(COVER_KEY, '1')
    else sessionStorage.removeItem(COVER_KEY)
  } catch {
    // Storage can be blocked; the cover simply shows again next time.
  }
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()
  const { confirm } = useConfirm()
  const navigate = useNavigate()
  const location = useLocation()
  const editorRoute = useOutlet()
  const spread = useMediaQuery('(min-width: 1024px)')
  const reducedMotion = usePrefersReducedMotion()

  const index = sectionIndex(location.pathname)
  const editing = isEditorPath(location.pathname)
  const home = useHomeData(index === 0 && !editing)

  const [closed, setClosed] = useState(() => !coverAlreadyOpened())
  const [signingOut, setSigningOut] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const bookRef = useRef(null)
  const mainRef = useRef(null)
  const previousPath = useRef(location.pathname)

  // After the route changes, move focus to the page area and say where we landed.
  useEffect(() => {
    if (previousPath.current === location.pathname) return
    previousPath.current = location.pathname
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
    setAnnouncement(editing ? 'Editor opened' : `${SECTIONS[index].label} page`)
  }, [location.pathname, index, editing])

  // A page the reader dragged away from unsaved edits turns back when they choose to stay.
  useEffect(() => {
    const turnBack = () => bookRef.current?.flipTo(pageForSection(index, spread))
    window.addEventListener('journal:nav-cancelled', turnBack)
    return () => window.removeEventListener('journal:nav-cancelled', turnBack)
  }, [index, spread])

  const openNotebook = () => {
    setClosed(false)
    rememberCover(true)
    window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }))
  }

  const openByHand = (target) => {
    setClosed(false)
    rememberCover(true)
    if (target !== null && target !== index) navigate(SECTIONS[target].path)
  }

  const closeNotebook = () => setClosed(true)

  const doSignOut = async () => {
    setSigningOut(true)
    setClosed(true)
    try {
      await new Promise(resolve => window.setTimeout(resolve, reducedMotion ? 0 : 1000))
      await signOut()
      rememberCover(false)
      navigate('/')
    } catch {
      setClosed(false)
      addToast('Could not sign out. Please try again.', 'error')
    } finally {
      setSigningOut(false)
    }
  }

  // Editors mark their form (data-dirty) and the bio editor marks itself (data-bio-dirty)
  // so signing out can warn before the session ends.
  const handleSignOut = () => {
    if (document.querySelector('form[data-dirty="true"], [data-bio-dirty="true"]')) {
      confirm('You have unsaved changes. Sign out without saving?', doSignOut, undefined,
        { confirmLabel: 'Sign out', pendingLabel: 'Signing out…' })
    } else {
      doSignOut()
    }
  }

  const sections = [
    { left: <HomeLeft state={home} />, right: <HomeRight state={home} />, single: <HomeSingle state={home} /> },
    { left: null, right: <ArticleList />, single: <ArticleList /> },
    { left: null, right: <CreativeList />, single: <CreativeList /> },
    { left: null, right: <SiteContent />, single: <SiteContent /> },
  ]

  return (
    <div className="desk">
      <a href="#main" className="skip-link">Skip to content</a>

      <header className="desk-header">
        <Link to="/dashboard" className="desk-brand">
          <span className="brand-monogram" aria-hidden="true">n.</span>
          Nikole Rajgor<span className="brand-long"> <span className="desk-divider">/</span> The editor’s desk</span>
        </Link>
        <div className="desk-tools">
          <button
            type="button"
            onClick={closed ? openNotebook : closeNotebook}
            disabled={signingOut}
            aria-expanded={!closed}
            aria-controls="main"
          >
            {closed ? 'Open notebook ↗' : 'Close notebook ↙'}
          </button>
          <span className="desk-divider" aria-hidden="true">/</span>
          <button type="button" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out ↗'}
          </button>
        </div>
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} className="desk-stage">
        <div className="notebook" data-spread={spread} data-closed={closed}>
          {/* Tabs sit outside the book: the book's 3D stage would otherwise trap position: fixed. */}
          <nav aria-label="Main" className="index-tabs" inert={closed}>
            {SECTIONS.map((item, i) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `index-tab ${isActive ? 'is-active' : ''}`}
              >
                <span className="tab-number" aria-hidden="true">0{i + 1}</span>
                <span className="tab-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="book-region" inert={editing} aria-hidden={editing || undefined}>
            <Book
              bookRef={bookRef}
              spread={spread}
              closed={closed}
              index={index}
              sections={sections}
              onSection={(i) => navigate(SECTIONS[i].path)}
              onOpen={openNotebook}
              onOpenByHand={openByHand}
              onCloseByHand={closeNotebook}
            />
          </div>
        </div>

        {editing && (
          <>
            <div className="sheet-scrim" aria-hidden="true" />
            <div className="loose-sheet">
              <div className="loose-scroll">{editorRoute}</div>
            </div>
          </>
        )}
      </main>

      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

      <p className="desk-caption">
        <span className="min-w-0 truncate" title={user?.email}>Private notes · {user?.email}</span>
        <span className="caption-scribble" aria-hidden="true">one story at a time.</span>
      </p>
    </div>
  )
}
