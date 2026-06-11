import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/auth'

const ApprovePage = () => {
  const { visitorId, action } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [visitor, setVisitor] = useState(null)

  useEffect(() => {
    handleAction()
  }, [])

  const handleAction = async () => {
    try {
      const res = await API.get(`/residents/${visitorId}/${action}`)
      setStatus('done')
      setVisitor(res.data.message)
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>
          {status === 'loading' ? '⏳' : status === 'done' ? (action === 'approved' ? '✅' : '❌') : '⚠️'}
        </div>

        {status === 'loading' && (
          <>
            <h2 style={styles.title}>Processing...</h2>
            <p style={styles.sub}>Please wait</p>
          </>
        )}

        {status === 'done' && (
          <>
            <h2 style={styles.title}>
              {action === 'approved' ? 'Entry Allowed' : 'Entry Denied'}
            </h2>
            <p style={styles.sub}>{visitor}</p>
            <div style={{
              ...styles.resultBox,
              backgroundColor: action === 'approved' ? '#0a2a00' : '#2a0000',
              borderColor: action === 'approved' ? '#4caf50' : '#f44336'
            }}>
              {action === 'approved'
                ? '✅ The guard has been notified. Visitor can enter.'
                : '❌ The guard has been notified. Visitor will be turned away.'}
            </div>
            <button style={styles.btn} onClick={() => navigate('/resident')}>
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.sub}>The link may have expired or already been used.</p>
            <button style={styles.btn} onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}
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
    padding: '40px 28px',
    width: '100%',
    maxWidth: '380px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
  },
  icon: {
    fontSize: '56px',
    marginBottom: '16px'
  },
  title: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  sub: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '20px'
  },
  resultBox: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '14px',
    color: '#fff',
    marginBottom: '20px',
    lineHeight: '1.5'
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
    cursor: 'pointer'
  }
}

export default ApprovePage