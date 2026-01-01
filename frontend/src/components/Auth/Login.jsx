// frontend/src/components/Auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Login to continue listening</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)'
  },
  card: {
    backgroundColor: '#181818',
    padding: '40px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: '32px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #282828',
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    padding: '12px',
    borderRadius: '24px',
    backgroundColor: '#1DB954',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '8px',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'scale(1.02)'
    }
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#E22134',
    color: '#FFFFFF',
    fontSize: '14px'
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    color: '#B3B3B3',
    fontSize: '14px'
  },
  link: {
    color: '#1DB954',
    fontWeight: 'bold'
  }
};