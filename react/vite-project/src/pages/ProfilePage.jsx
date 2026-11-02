import { Link } from 'react-router-dom'
import { ArrowRight, CreditCard, Mail, UserRound } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'

export default function ProfilePage() {
  const { user } = useAuth()
  const initial = (user?.fullName || user?.email || 'U').slice(0, 1).toUpperCase()

  return (
    <main className="page-content profile-page">
      <div className="page-heading"><div><p className="eyebrow">Account</p><h1>Your profile</h1><p className="page-description">Your ProjectFlow account details.</p></div></div>
      <section className="content-panel profile-card">
        <div className="profile-identity"><span className="profile-avatar">{initial}</span><div><h2>{user?.fullName || 'ProjectFlow member'}</h2><p>{user?.email}</p></div></div>
        <div className="profile-detail-list">
          <div className="profile-detail"><span className="profile-detail-icon"><UserRound size={17} /></span><span><small>Name</small><strong>{user?.fullName || 'Not provided'}</strong></span></div>
          <div className="profile-detail"><span className="profile-detail-icon"><Mail size={17} /></span><span><small>Email address</small><strong>{user?.email || 'Not provided'}</strong></span></div>
        </div>
        <Link className="profile-billing-link" to="/billing"><span><CreditCard size={17} /> Manage your subscription</span><ArrowRight size={17} /></Link>
      </section>
    </main>
  )
}
