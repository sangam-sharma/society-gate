import { useNavigate } from 'react-router-dom'

const Navbar = ({ title }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user_id')
    localStorage.removeItem('flat_id')
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.icon}>🏢</span>
        <span style={styles.title}>{title || 'Society Gate'}</span>
      </div>
      <button style={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#1a1a2e',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  icon: {
    fontSize: '22px'
  },
  title: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #ff6b6b',
    color: '#ff6b6b',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  }
}

export default Navbar