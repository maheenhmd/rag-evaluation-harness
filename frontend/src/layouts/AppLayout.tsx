import { useEffect, useState } from 'react'
import { useClerk } from '@clerk/react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Folder, FlaskConical, ChartNoAxesCombined, Settings, Menu, UserRound, ArrowUpRight } from 'lucide-react'
import Brand from '../components/shared/Brand'
import ThemeToggle from '../components/shared/ThemeToggle'
import ProductTour from '../components/tour/ProductTour'
import Dialog from '../components/ui/Dialog'

const appNavigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: Folder },
  { label: 'Evaluations', to: '/evaluations', icon: FlaskConical },
  { label: 'Results', to: '/results', icon: ChartNoAxesCombined },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="sidebar-links" aria-label="Workspace navigation">
      {appNavigation.map(({ label, to, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate} data-tour-id={to === '/projects' ? 'nav-projects' : to === '/results' ? 'nav-results' : undefined}><Icon size={18} strokeWidth={1.6} aria-hidden="true" />{label}</NavLink>
      ))}
    </nav>
  )
}

export default function AppLayout() {
  const { signOut } = useClerk()
  const queryClient = useQueryClient()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  async function logout() {
    setSigningOut(true)
    setSignOutError('')
    try {
      await queryClient.cancelQueries()
      queryClient.clear()
      await signOut({ redirectUrl: '/' })
    } catch {
      setSignOutError('Could not sign out. Please try again.')
      setSigningOut(false)
    }
  }
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()
  const section = appNavigation.find(item => pathname.startsWith(item.to))?.label ?? 'Workspace'
  const isProjectDetail = pathname.startsWith('/projects/')

  useEffect(() => {
    const desktop = matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => { if (desktop.matches) setDrawerOpen(false) }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="app-sidebar">
        <Brand />
        <p className="sidebar-caption mono">WORKSPACE</p>
        <SidebarLinks />
        <div className="sidebar-bottom"><p>Know what works<br />before you ship.</p><Link className="text-link" to="/">Back to website <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      </aside>
      <div className="app-body">
        <header className="app-topbar">
          <button className="icon-button sidebar-toggle" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-label="Open workspace navigation"><Menu size={21} aria-hidden="true" /></button>
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/dashboard">Workspace</Link><span aria-hidden="true">/</span>{isProjectDetail ? <><Link to="/projects">Projects</Link><span aria-hidden="true">/</span><span aria-current="page">Project</span></> : <span aria-current="page">{section}</span>}</nav>
          <div className="topbar-actions"><ThemeToggle /><Link className="profile-link" to="/settings" aria-label="Open settings"><UserRound size={17} aria-hidden="true" /><span>Settings</span></Link><button className="text-link" disabled={signingOut} onClick={logout}>{signingOut ? 'Signing out…' : 'Sign out'}</button></div>
        </header>
        {signOutError && <p className="notice" role="alert">{signOutError}</p>}
        <main id="main-content" className="app-content" tabIndex={-1}><Outlet /></main>
      </div>
      <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Workspace" className="sidebar-drawer">
        <SidebarLinks onNavigate={() => setDrawerOpen(false)} />
        <Link className="text-link drawer-home" to="/" onClick={() => setDrawerOpen(false)}>Back to website <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </Dialog>
      <ProductTour />
    </div>
  )
}
