// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { useState } from 'react';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import AudioPlayer from './components/Player/AudioPlayer';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }
  
  return user?.isAdmin ? children : <Navigate to="/" />;
};

function AppContent() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  const handleCreatePlaylist = () => {
    const name = prompt('Enter playlist name:');
    if (name) {
      const newPlaylist = {
        id: Date.now(),
        name,
        cover: null,
        songCount: 0
      };
      setPlaylists([...playlists, newPlaylist]);
    }
  };

  return (
    <Router>
      <div style={styles.app}>
        {user && <Navbar />}
        
        <div style={styles.mainLayout}>
          {user && (
            <Sidebar 
              playlists={playlists} 
              onCreatePlaylist={handleCreatePlaylist}
            />
          )}
          
          <main style={{...styles.mainContent, ...(user ? {} : styles.mainContentFull)}}>
            <Routes>
              <Route path="/login" element={
                user ? <Navigate to="/" /> : <Login />
              } />
              <Route path="/register" element={
                user ? <Navigate to="/" /> : <Register />
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Routes>
          </main>
        </div>

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

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#000000'
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#121212',
    minHeight: 'calc(100vh - 64px - 90px)'
  },
  mainContentFull: {
    minHeight: '100vh'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000000'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #282828',
    borderTop: '4px solid #1DB954',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: '#B3B3B3',
    fontSize: '14px'
  }
};