// frontend/src/components/Layout/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Music, LogOut, Shield, Heart, Bell, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <Music size={28} color="#1DB954" />
          <span style={styles.logoText}>ZYNQ</span>
        </Link>

        <div style={styles.rightSection}>
          {user?.isPremium && (
            <span style={styles.premiumBadge}>
              <Heart size={14} fill="#1DB954" /> Premium
            </span>
          )}
          
          {user?.isAdmin && (
            <Link to="/admin" style={styles.adminLink}>
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          )}

          <button style={styles.iconBtn}>
            <Bell size={18} />
          </button>

          <div style={styles.userMenu}>
            <div style={styles.userAvatar}>
              <User size={16} />
            </div>
            <span style={styles.username}>{user?.username}</span>
            <button onClick={logout} style={styles.logoutBtn}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#000000',
    borderBottom: '1px solid #282828',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '64px'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    height: '100%',
    maxWidth: '100%'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.5px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0
  },
  premiumBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1DB954',
    border: '1px solid rgba(29, 185, 84, 0.3)'
  },
  adminLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: '#282828',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#B3B3B3',
    transition: 'color 0.2s',
    cursor: 'pointer',
    border: 'none'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 4px 4px 8px',
    borderRadius: '24px',
    backgroundColor: '#000000',
    border: '1px solid #282828'
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF'
  },
  username: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#B3B3B3',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none'
  }
};