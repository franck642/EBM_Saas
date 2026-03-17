import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DbProfilesPage from './pages/DbProfilesPage'
import EmployeesPage from './pages/EmployeesPage'
import SendPage from './pages/SendPage'
import LogsPage from './pages/LogsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" style={{ width:32, height:32 }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index             element={<DashboardPage />} />
          <Route path="databases"  element={<DbProfilesPage />} />
          <Route path="employees"  element={<EmployeesPage />} />
          <Route path="send"       element={<SendPage />} />
          <Route path="logs"       element={<LogsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}