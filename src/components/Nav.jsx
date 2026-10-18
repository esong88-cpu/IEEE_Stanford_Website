import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Hamburger from 'hamburger-react'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events', isActive: (p) => ['/events', '/ai-compute'].includes(normalizePath(p)) || p.startsWith('/event/') },
  { to: '/team', label: 'Team' },
  { to: '/chapters', label: 'Chapters' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
]

function normalizePath(path) {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function NavItem({ to, label, isActive: isActiveFn, onNavigate, mobile = false }) {
  const { pathname } = useLocation()
  const active = isActiveFn ? isActiveFn(pathname) : normalizePath(pathname) === normalizePath(to)
  const className = mobile ? 'mobile-nav-link' : 'nav-link'

  return (
    <Link
      to={to}
      className={`${className}${active ? ' active' : ''}`}
      onClick={onNavigate}
    >
      {label}
    </Link>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <header className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src={`${import.meta.env.BASE_URL}img/ieee.png`} className="navbar-logo-img" alt="" />
          <span className="navbar-logo-text">
            <span className="logo-ieee">IEEE</span>
            <span className="logo-sep">·</span>
            <span className="logo-stanford">Stanford</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, isActive }) => (
            <NavItem key={to} to={to} label={label} isActive={isActive} />
          ))}
        </nav>

        <div className="nav-hamburger">
          <Hamburger
            toggled={mobileOpen}
            toggle={setMobileOpen}
            size={20}
            color="rgba(255,255,255,0.7)"
            label={mobileOpen ? 'Close menu' : 'Open menu'}
          />
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="nav-backdrop"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <nav className="nav-mobile-menu" aria-label="Mobile navigation">
            {NAV_ITEMS.map(({ to, label, isActive }) => (
              <NavItem
                key={to}
                to={to}
                label={label}
                isActive={isActive}
                onNavigate={closeMobile}
                mobile
              />
            ))}
          </nav>
        </>
      )}
    </header>
  )
}
