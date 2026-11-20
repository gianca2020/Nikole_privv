import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { useConfirm } from './ConfirmDialog'
import { SECTIONS, isSectionRoot, prefersReducedMotion, sectionIndex, turnKind, usePrefersReducedMotion } from '../lib/pageTurn'

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

function SectionNote({ index }) {
  const section = SECTIONS[index]
  return (
    <aside className="page page-left section-note" aria-label={`About ${section.label}`}>
      <p className="eyebrow">Nikole’s memo book</p>
      <div className="section-number" aria-hidden="true">
        0{index + 1}<span>/04</span>
      </div>
      <p className="section-name">{section.label}</p>
      <p className="handwritten">{section.note}</p>
      <p className="section-extra mono-meta">In this section</p>
      <p className="section-extra">{section.blurb}</p>
      <span className="margin-note section-extra" aria-hidden="true">keep making things.</span>
    </aside>
  )
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()
  const { confirm } = useConfirm()
  const navigate = useNavigate()
  const location = useLocation()
  const index = sectionIndex(location.pathname)
  const mode = isSectionRoot(location.pathname) ? 'spread' : 'sheet'

  const [closed, setClosed] = useState(() => !coverAlreadyOpened())
  const [signingOut, setSigningOut] = useState(false)
  const mainRef = useRef(null)
  const coverButtonRef = useRef(null)
  const previousPath = useRef(location.pathname)
  const viewTransition = !usePrefersReducedMotion()

  // Tell the stylesheet which way the page is turning. This runs while React commits the new
  // route, which is inside the browser's view-transition update callback, so the keyframes
  // pick it up before the animation starts. Navigation itself is never delayed.
  useLayoutEffect(() => {
    const from = previousPath.current
    if (from === location.pathname) return
    document.documentElement.dataset.turn = turnKind(from, location.pathname)
    previousPath.current = location.pathname
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  useEffect(() => () => {
    delete document.documentElement.dataset.turn
  }, [])

  // A closed notebook starts with focus on its only control.
  useEffect(() => {
    if (closed) coverButtonRef.current?.focus({ preventScroll: true })
    // Only on first mount; later opens/closes manage focus themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openNotebook = () => {
    setClosed(false)
    rememberCover(true)
    // Wait one frame so the page is no longer inert before moving focus into it.
    window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }))
  }

  const closeNotebook = () => {
    setClosed(true)
    window.requestAnimationFrame(() => coverButtonRef.current?.focus({ preventScroll: true }))
  }

  const doSignOut = async () => {
    setSigningOut(true)
    setClosed(true)
    try {
      await new Promise(resolve => window.setTimeout(resolve, prefersReducedMotion() ? 0 : 700))
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

  return (
    <div className="desk">
      <a href="#main" className="skip-link">Skip to content</a>

      <header className="desk-header">
        <Link to="/dashboard" viewTransition={viewTransition} className="desk-brand">
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

      <div className="desk-stage">
        <div className={`notebook ${closed ? 'is-closed' : ''}`} data-layout={mode}>
          <nav aria-label="Main" className="index-tabs" inert={closed}>
            {SECTIONS.map((item, i) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                viewTransition={viewTransition}
                className={({ isActive }) => `index-tab tab-${item.color} ${isActive ? 'is-active' : ''}`}
              >
                <span className="tab-number" aria-hidden="true">0{i + 1}</span>
                <span className="tab-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="notebook-body">
            <main id="main" ref={mainRef} tabIndex={-1} className="notebook-main" inert={closed}>
              {mode === 'sheet' ? (
                <div className="sheet"><Outlet /></div>
              ) : (
                <div className="spread">
                  {index !== 0 && <SectionNote index={index} />}
                  {index === 0 ? <Outlet /> : <div className="page page-right"><Outlet /></div>}
                </div>
              )}
            </main>
            <div className="spiral" aria-hidden="true" />
          </div>

          <div className="notebook-cover" inert={!closed} aria-hidden={!closed}>
            <div className="cover-face">
              <div className="cover-card h-full">
                <div className="cover-topline"><span>The reporter’s companion</span><span>No. 01</span></div>
                <p className="cover-hand">private — book one</p>
                <h2 className="cover-title">Nikole’s<br />Admin</h2>
                <p className="cover-stamp" aria-hidden="true">Memo<br />Book</p>
                <div className="cover-rule" />
                <p className="cover-meta">Stories. Ideas. Work in progress.</p>
                <div className="cover-seal" aria-hidden="true">Heavy<br />weight<br />No. 01<br />100 lvs.</div>
                <div className="cover-actions">
                  <button ref={coverButtonRef} type="button" onClick={openNotebook} disabled={signingOut} className="cover-open">
                    Open the notebook ↗
                  </button>
                </div>
                <p className="cover-bottom"><span>Heavyweight paper</span><span>Property of N. Rajgor</span></p>
              </div>
            </div>
            <div className="cover-inside" />
          </div>
        </div>
      </div>

      <p className="desk-caption">
        <span className="min-w-0 truncate" title={user?.email}>Private notes · {user?.email}</span>
        <span className="caption-scribble" aria-hidden="true">one story at a time.</span>
      </p>
    </div>
  )
}
