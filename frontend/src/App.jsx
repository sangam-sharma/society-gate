import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import GuardDashboard from './pages/GuardDashboard'
import ResidentDashboard from './pages/ResidentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ApprovePage from './pages/ApprovePage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/approve/:visitorId/:action" element={<ApprovePage />} />

        {/* Guard routes */}
        <Route
          path="/guard"
          element={
            <ProtectedRoute allowedRoles={['guard', 'admin']}>
              <GuardDashboard />
            </ProtectedRoute>
          }
        />

        {/* Resident routes */}
        <Route
          path="/resident"
          element={
            <ProtectedRoute allowedRoles={['resident']}>
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App