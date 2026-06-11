import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import {
  getMyPendingVisitors,
  getMyVisitorHistory,
  respondToVisitor,
  getFrequentVisitors,
  addFrequentVisitor,
  deleteFrequentVisitor
} from '../api/residents'

const ResidentDashboard = () => {
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [frequent, setFrequent] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', purpose: '' })

  useEffect(() => {
    fetchPending()
    fetchHistory()
    fetchFrequent()
  }, [])

  const fetchPending = async () => {
    try {
      const res = await getMyPendingVisitors()
      setPending(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await getMyVisitorHistory()
      setHistory(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchFrequent = async () => {
    try {
      const res = await getFrequentVisitors()
      setFrequent(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRespond = async (id, status) => {
    try {
      await respondToVisitor(id, status)
      setMsg(status === 'approved' ? '✅ Visitor allowed!' : '❌ Visitor denied!')
      fetchPending()
      fetchHistory()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('❌ Error responding to visitor')
    }
  }

  const handleAddFrequent = async () => {
    if (!form.name || !form.purpose) {
      setMsg('Please fill name and purpose')
      return
    }
    try {
      await addFrequentVisitor(form)
      setMsg('✅ Frequent visitor added!')
      setForm({ name: '', phone: '', purpose: '' })
      fetchFrequent()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('❌ Error adding frequent visitor')
    }
  }

  const handleDeleteFrequent = async (id) => {
    try {
      await deleteFrequentVisitor(id)
      fetchFrequent()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <Navbar title="Resident Dashboard" />

      {msg && <div style={styles.msgBox}>{msg}</div>}

      {/* Tabs */}
      <div style={styles.tabBar}>
        {['pending', 'history', 'frequent'].map(t => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t === 'pending' ? `🔔 Requests ${pending.length > 0 ? `(${pending.length})` : ''}` :
             t === 'history' ? '📋 History' : '⭐ Frequent'}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* Pending tab */}
        {tab === 'pending' && (
          <div>
            <p style={styles.sectionLabel}>Visitors at Gate</p>
            {pending.length === 0 && <p style={styles.empty}>No pending requests</p>}
            {pending.map(v => (
              <div key={v.id} style={styles.card}>
                {v.photo_url && <img src={v.photo_url} alt="visitor" style={styles.photo} />}
                <div style={styles.cardName}>{v.name}</div>
                <div style={styles.cardSub}>
                  {v.purpose}
                  {v.phone && ` • 📞 ${v.phone}`}
                  {v.vehicle_number && ` • 🚗 ${v.vehicle_number}`}
                </div>
                <div style={styles.cardSub}>
                  🕐 {new Date(v.entry_time).toLocaleTimeString()}
                </div>
                <div style={styles.btnRow}>
                  <button
                    style={styles.btnApprove}
                    onClick={() => handleRespond(v.id, 'approved')}
                  >
                    ✅ Allow Entry
                  </button>
                  <button
                    style={styles.btnDeny}
                    onClick={() => handleRespond(v.id, 'denied')}
                  >
                    ❌ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div>
            <p style={styles.sectionLabel}>Visitor History</p>
            {history.length === 0 && <p style={styles.empty}>No visitors yet</p>}
            {history.map(v => (
              <div key={v.id} style={styles.logRow}>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{v.name}</div>
                  <div style={styles.cardSub}>
                    {v.purpose} • {new Date(v.entry_time).toLocaleDateString()} {new Date(v.entry_time).toLocaleTimeString()}
                  </div>
                </div>
                <span style={{
                  ...styles.badge,
                  ...(v.status === 'approved' ? styles.badgeApproved :
                    v.status === 'denied' ? styles.badgeDenied :
                    v.status === 'exited' ? styles.badgeExited :
                    styles.badgePending)
                }}>{v.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Frequent tab */}
        {tab === 'frequent' && (
          <div>
            <p style={styles.sectionLabel}>Pre-approved Frequent Visitors</p>
            {frequent.length === 0 && <p style={styles.empty}>No frequent visitors added</p>}
            {frequent.map(f => (
              <div key={f.id} style={styles.logRow}>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{f.name}</div>
                  <div style={styles.cardSub}>{f.purpose} {f.phone && `• ${f.phone}`}</div>
                </div>
                <button
                  style={styles.btnDelete}
                  onClick={() => handleDeleteFrequent(f.id)}
                >
                  🗑️
                </button>
              </div>
            ))}

            <p style={{ ...styles.sectionLabel, marginTop: '24px' }}>Add Frequent Visitor</p>
            <div style={styles.form}>
              <input
                style={styles.input}
                placeholder="Name *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <select
                style={styles.input}
                value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
              >
                <option value="">Select purpose *</option>
                <option>Maid / Helper</option>
                <option>Milkman</option>
                <option>Driver</option>
                <option>Cook</option>
                <option>Other</option>
              </select>
              <button style={styles.btnPrimary} onClick={handleAddFrequent}>
                ➕ Add Frequent Visitor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  msgBox: { padding: '12px 16px', backgroundColor: '#1a2a1a', color: '#4caf50', fontSize: '13px', textAlign: 'center' },
  tabBar: { display: 'flex', backgroundColor: '#1a1a2e', borderBottom: '1px solid #2a2a4a' },
  tab: { flex: 1, padding: '12px', background: 'none', border: 'none', color: '#888', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  tabActive: { color: '#4f8ef7', borderBottom: '2px solid #4f8ef7' },
  content: { padding: '16px' },
  sectionLabel: { fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' },
  empty: { textAlign: 'center', color: '#555', padding: '32px', fontSize: '14px' },
  card: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '16px', marginBottom: '10px' },
  logRow: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  photo: { width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', marginBottom: '10px' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' },
  cardSub: { fontSize: '12px', color: '#888', marginBottom: '3px' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  badgePending: { backgroundColor: '#3a2a00', color: '#f0a500' },
  badgeApproved: { backgroundColor: '#0a2a00', color: '#4caf50' },
  badgeDenied: { backgroundColor: '#2a0000', color: '#f44336' },
  badgeExited: { backgroundColor: '#1a1a3a', color: '#888' },
  btnRow: { display: 'flex', gap: '8px', marginTop: '12px' },
  btnApprove: { flex: 1, padding: '10px', backgroundColor: '#0a2a00', color: '#4caf50', border: '1px solid #4caf50', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  btnDeny: { flex: 1, padding: '10px', backgroundColor: '#2a0000', color: '#f44336', border: '1px solid #f44336', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  btnDelete: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  btnPrimary: { width: '100%', padding: '13px', backgroundColor: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '4px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #2a2a4a', backgroundColor: '#0f0f1a', color: '#ffffff', fontSize: '14px', marginBottom: '8px', outline: 'none' },
}

export default ResidentDashboard