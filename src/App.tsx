import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/coach/DashboardPage';
import ClientManagementPage from './pages/coach/ClientManagementPage';
import AddClientPage from './pages/coach/AddClientPage';
import ClientsListPage from './pages/coach/ClientsListPage';
import ExerciseLibraryPage from './pages/coach/ExerciseLibraryPage';
import TrainingPlanBuilderPage from './pages/coach/TrainingPlanBuilderPage';
import TodayView from './pages/client/TodayView';
import AICoachChat from './pages/client/AICoachChat';
import ProgressAnalyticsPage from './pages/client/ProgressAnalyticsPage';
import CoachLayout from './components/layout/CoachLayout';

const ProtectedRoute = ({ requiredRole }: { requiredRole?: 'coach' | 'client' }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && profile?.role !== requiredRole) return <Navigate to="/" replace />;

  return <Outlet />;
};

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Root redirect based on role */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        profile?.role === 'coach' ? <Navigate to="/coach/dashboard" replace /> :
        profile?.role === 'client' ? <Navigate to="/client/today" replace /> : (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <p className="text-gray-400 mb-4">Initializing profile...</p>
            <button onClick={() => signOut()} className="text-sm text-primary hover:underline">
              Sign Out and Try Again
            </button>
          </div>
        )
      } />

      {/* Coach Routes */}
      <Route element={<ProtectedRoute requiredRole="coach" />}>
        <Route element={<CoachLayout />}>
          <Route path="/coach/dashboard" element={<DashboardPage />} />
          <Route path="/coach/clients" element={<ClientsListPage />} />
          <Route path="/coach/clients/new" element={<AddClientPage />} />
          <Route path="/coach/clients/:clientId" element={<ClientManagementPage />} />
          <Route path="/coach/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/coach/plans" element={<TrainingPlanBuilderPage />} />
        </Route>
      </Route>

      {/* Client Routes */}
      <Route element={<ProtectedRoute requiredRole="client" />}>
        <Route path="/client/today" element={<TodayView />} />
        <Route path="/client/chat" element={<AICoachChat />} />
        <Route path="/client/analytics" element={<ProgressAnalyticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function FloatingLogout() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <button
      onClick={() => signOut()}
      className="fixed bottom-6 right-6 z-[9999] bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2 transition-all"
    >
      <span>⏏</span> Logout
    </button>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }
        }}
      />
      <Router>
        <div className="min-h-screen bg-background text-white">
          <AppContent />
          <FloatingLogout />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
