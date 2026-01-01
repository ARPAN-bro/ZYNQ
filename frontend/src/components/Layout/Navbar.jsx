// frontend/src/components/Layout/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Music, LogOut, Shield, Heart } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <Music size={32} color="#1DB954" />
          <span style={styles.logoText}>SpotifyMVP</span>
        </Link>

        <div style={styles.rightSection}>
          {user?.isPremium && (
            <span style={styles.premiumBadge}>
              <Heart size={16} /> Supporter
            </span>
          )}
          
          {user?.isAdmin && (
            <Link to="/admin" style={styles.adminLink}>
              <Shield size={18} />
              <span>Admin</span>
            </Link>
          )}

          <div style={styles.userInfo}>
            <span style={styles.username}>{user?.username}</span>
            <button onClick={logout} style={styles.logoutBtn}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#181818',
    borderBottom: '1px solid #282828',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  premiumBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: '#1DB954',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  adminLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#282828',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  username: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#B3B3B3'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#282828',
    color: '#FFFFFF',
    transition: 'background-color 0.2s'
  }
};