import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  FolderKanban,
  LogOut,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'

export default function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="workspace-shell">
      <header className="topbar">
        <NavLink className="brand" to="/projects" aria-label="ProjectFlow home">
          <span className="brand-mark" aria-hidden="true">
            <FolderKanban size={19} strokeWidth={2.2} />
          </span>
          <span>ProjectFlow</span>
        </NavLink>
        <nav className="workspace-nav" aria-label="Main navigation">
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/projects">
            <FolderKanban size={16} />
            Projects
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/billing">
            <CreditCard size={16} />
            Billing
          </NavLink>
        </nav>
        <div className="account-actions">
          <NavLink className="account-link" to="/profile">
            <span className="avatar">{(user?.fullName || user?.email || 'U').slice(0, 1).toUpperCase()}</span>
            <span className="account-name">{user?.fullName || user?.email || 'Account'}</span>
            <UserRound size={15} />
          </NavLink>
          <button className="icon-text-button" onClick={handleSignOut} type="button" title="Sign out">
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
