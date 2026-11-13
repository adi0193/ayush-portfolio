import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Work' },
  { path: '/skills', label: 'Skills' },
  { path: '/drawings', label: 'Drawings' },
  { path: '/resume', label: 'Resume' },
  { path: '/contact', label: 'Contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const [menuPath, setMenuPath] = useState(pathname)

  // Close the mobile menu on navigation (state adjusted during render, no extra effect pass)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className="site-header" role="banner">
      <div className="container">
        <Link to="/" className="site-logo" aria-label="Ayush Kumar — Home">
          <span className="site-logo__icon" aria-hidden="true">AK</span>
          <span className="site-logo__text">
            <span className="site-logo__name">Ayush Kumar</span>
            <span className="site-logo__tagline">Electrical Engineering & Design</span>
          </span>
        </Link>

        <nav className="nav-island" aria-label="Main navigation">
          <ul className={`nav-menu${menuOpen ? ' nav-menu--open' : ''}`} role="menubar">
            {navItems.map(item => (
              <li key={item.path} role="none">
                <NavLink
                  to={item.path}
                  role="menuitem"
                  className={({ isActive }) =>
                    `nav-link${isActive ? ' nav-link--active' : ''}`
                  }
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <Link to="/contact" className="header-cta-btn">
            Discuss a project ↗
          </Link>
          <button
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
