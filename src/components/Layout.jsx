import { useLayoutEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from './Toast'
import { useConfirm } from './ConfirmDialog'

const navItems = [
  { label: 'Home', path: '/dashboard', end: true, note: 'The daily briefing', color: 'home' },
  { label: 'Articles', path: '/dashboard/articles', note: 'Stories worth keeping', color: 'articles' },
  { label: 'Creatives', path: '/dashboard/creative', note: 'A little outside the lines', color: 'creatives' },
  { label: 'Site Content', path: '/dashboard/site', note: 'The person behind the byline', color: 'site' },
]

function sectionIndex(path) {
  return Math.max(0, navItems.findIndex(item => item.end ? path === item.path : path.startsWith(item.path)))
}

// Turn a DOM facsimile above the live route. Editors, blockers and requests
// always have exactly one React owner; the decorative copy is inert.
function PageTurn({ children, location, index }) {
  const contentRef = useRef(null)
  const animationRef = useRef(null)
  const previousRef = useRef(null)

  useLayoutEffect(() => {
    const content = contentRef.current
    const animation = animationRef.current
    const previous = previousRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const changed = previous && previous.path !== location.pathname
    let timer

    if (changed && previous.index !== index && !reducedMotion) {
      const forward = index > previous.index
      const turn = document.createElement('div')
      turn.className = `page-turn ${forward ? 'page-turn-forward' : 'page-turn-backward'}`
      turn.setAttribute('aria-hidden', 'true')
      turn.inert = true
      const front = document.createElement('div')
      front.className = 'page-face page-front'
      const snapshot = previous.snapshot.cloneNode(true)
      snapshot.style.width = `${previous.width}px`
      snapshot.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
      front.append(snapshot)
      const back = document.createElement('div')
      back.className = 'page-face page-back'
      const label = document.createElement('span')
      label.className = 'page-back-label'
      label.textContent = 'Nikole’s memo book / continued →'
      back.append(label)
      turn.append(front, back)
      animation.replaceChildren(turn)
      timer = window.setTimeout(() => turn.remove(), 650)
    }

    const remember = () => {
      previousRef.current = {
        path: location.pathname, index,
        snapshot: content.cloneNode(true), width: content.offsetWidth,
      }
    }
    remember()
    const observer = new MutationObserver(remember)
    observer.observe(content, { childList: true, subtree: true, characterData: true, attributes: true })
    if (changed) {
      document.getElementById('main')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      animation.replaceChildren()
    }
  }, [location.pathname, index])

  return (
    <div className="page-stage">
      <div ref={contentRef} className="journal-content">{children}</div>
      <div ref={animationRef} className="page-turn-layer" />
    </div>
  )
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()
  const { confirm } = useConfirm()
  const navigate = useNavigate()
  const location = useLocation()
  const index = sectionIndex(location.pathname)
  const section = navItems[index]
  const [closed, setClosed] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const doSignOut = async () => {
    setSigningOut(true)
    setClosed(true)
    try {
      await new Promise(resolve => window.setTimeout(resolve, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600))
      await signOut()
      navigate('/')
    } catch {
      setClosed(false)
      addToast('Could not sign out. Please try again.', 'error')
    } finally {
      setSigningOut(false)
    }
  }

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
        <Link to="/dashboard" className="desk-brand"><span className="brand-monogram">n.</span> NIKOLE RAJGOR <span className="desk-divider">/</span> <span className="desk-subtitle">THE EDITOR’S DESK</span></Link>
        <div className="desk-tools">
          <button type="button" onClick={() => setClosed(v => !v)} aria-expanded={!closed} aria-controls="notebook-main">{closed ? 'Open notebook ↗' : 'Close notebook ↙'}</button>
          <span className="desk-divider">/</span>
          <button type="button" onClick={handleSignOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out ↗'}</button>
        </div>
      </header>

      <div className={`notebook ${index === 0 ? 'notebook-home' : 'notebook-section'} ${closed ? 'is-closed' : ''}`}>
        <nav aria-label="Main" className="index-tabs">
          {navItems.map((item, i) => (
            <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => `index-tab tab-${item.color} ${isActive ? 'is-active' : ''}`}>
              <span className="tab-number">0{i + 1}</span><span>{item.label}</span><span className="tab-arrow" aria-hidden="true">↗</span>
            </NavLink>
          ))}
        </nav>

        <main id="main" tabIndex={-1} className="notebook-main" inert={closed}>
          <div id="notebook-main">
            <PageTurn location={location} index={index}>
              {index !== 0 && <aside className="section-note">
                <p className="eyebrow">NIKOLE’S MEMO BOOK</p>
                <div className="section-number">0{index + 1}<span>/04</span></div>
                <h2>{section.label}</h2>
                <p className="section-scribble">{section.note}</p>
                <div className="section-index">
                  <p className="eyebrow">IN THIS SECTION</p>
                  <p>{index === 1 ? 'Headlines, bylines, and everything you’ve put into print.' : index === 2 ? 'Audio, images, and ideas that take a different shape.' : 'Your headshot, biography, and resume. Keep your story current.'}</p>
                </div>
                <Link to={index === 2 ? '/dashboard/creative/new' : '/dashboard/articles/new'} className="text-link">{index === 2 ? '+ New creative' : '+ New article'}</Link>
                <span className="margin-note">keep making things.</span>
              </aside>}
              <div className={index === 0 ? 'home-route' : 'route-sheet'}><Outlet /></div>
            </PageTurn>
          </div>
          <footer className="notebook-footer"><span title={user?.email}>PRIVATE NOTES · {user?.email}</span><span>FIELD NOTES / 0{index + 1}</span></footer>
        </main>
        <div className="spiral" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>

        <div className="notebook-cover" inert={!closed} aria-hidden={!closed}>
          <div className="cover-topline"><span>THE REPORTER’S COMPANION</span><span>EST. / NR</span></div>
          <p className="cover-small">always on the record.</p>
          <h2>NIKOLE’S<br />ADMIN<br /><span>MEMO BOOK</span></h2>
          <div className="cover-rule" />
          <p className="cover-description">STORIES. IDEAS. WORK IN PROGRESS.</p>
          <button type="button" onClick={() => setClosed(false)} disabled={signingOut} className="cover-open">Open the notebook <span>↗</span></button>
          <span className="cover-bottom">NO. 01 <span>PROPERTY OF NIKOLE RAJGOR</span></span>
        </div>
      </div>
      <p className="desk-caption"><span>A PLACE FOR THE WORK BEHIND THE WORDS.</span><span className="caption-scribble">one story at a time.</span></p>
    </div>
  )
}
