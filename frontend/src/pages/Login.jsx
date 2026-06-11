import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('user_id', res.data.user_id)
      localStorage.setItem('flat_id', res.data.flat_id)

      if (res.data.role === 'admin') navigate('/admin')
      else if (res.data.role === 'guard') navigate('/guard')
      else navigate('/resident')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>🏢</div>
        <h2 style={styles.title}>Society Gate</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={styles.roles}>
          <span style={styles.roleTag}>👮 Guard</span>
          <span style={styles.roleTag}>🏠 Resident</span>
          <span style={styles.roleTag}>⚙️ Admin</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '36px 28px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconWrap: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  title: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 6px'
  },
  subtitle: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '24px'
  },
  error: {
    backgroundColor: '#ff4444',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    width: '100%',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #2a2a4a',
    backgroundColor: '#0f0f1a',
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  btn: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#4f8ef7',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px'
  },
  roles: {
    display: 'flex',
    gap: '8px',
    marginTop: '24px'
  },
  roleTag: {
    backgroundColor: '#0f0f1a',
    color: '#888',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px'
  }
}

export default Login