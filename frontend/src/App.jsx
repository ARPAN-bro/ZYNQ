// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Library from './components/Library/Library';
import AdminDashboard from './components/Admin/AdminDashboard';
import AudioPlayer from './components/Player/AudioPlayer';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>Loading...</div>;
  }
  
  return user?.isAdmin ? children : <Navigate to="/" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {user && <Navbar />}
        
        <main style={{ flex: 1, paddingBottom: user ? '100px' : '0' }}>
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/" /> : <Login />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/" /> : <Register />
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          </Routes>
        </main>

        {user && <AudioPlayer />}
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}