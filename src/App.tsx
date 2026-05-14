import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import CoachDashboard from './pages/coach/DashboardPage';

const ProtectedRoute = ({ requiredRole }: { requiredRole?: 'coach' | 'client' }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function AppContent() {
  const { profile } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Root redirection based on role */}
      <Route path="/" element={
        profile?.role === 'coach' 
          ? <Navigate to="/coach/dashboard" replace /> 
          : profile?.role === 'client' 
            ? <Navigate to="/client/today" replace /> 
            : <Navigate to="/login" replace />
      } />

      {/* Coach Routes */}
      <Route element={<ProtectedRoute requiredRole="coach" />}>
        <Route path="/coach/dashboard" element={<CoachDashboard />} />
      </Route>

      {/* Client Routes */}
      <Route element={<ProtectedRoute requiredRole="client" />}>
        <Route path="/client/today" element={<div>Client Today View</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-white">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
