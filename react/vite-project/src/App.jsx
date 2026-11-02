import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './auth/AuthContext.jsx'
import AppShell from './components/AppShell.jsx'
import { AuthRedirect, RequireAuth } from './components/RouteGuards.jsx'
import AcceptInvitationPage from './pages/AcceptInvitationPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import BillingPage from './pages/BillingPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

function WorkspaceRoute() {
  return <RequireAuth><AppShell /></RequireAuth>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/accept_invitation" element={<AcceptInvitationPage />} />
          <Route element={<WorkspaceRoute />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/upgrade_plan/success" element={<BillingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
