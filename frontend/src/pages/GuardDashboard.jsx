import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { getAllVisitors, getPendingVisitors, updateVisitorStatus, markExit, addVisitor, getFlatsForGuard } from '../api/visitors'
import { getFlats } from '../api/admin'

const GuardDashboard = () => {
  const [tab, setTab] = useState('dashboard')
  const [visitors, setVisitors] = useState([])
  const [pending, setPending] = useState([])
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', purpose: '', vehicle_number: '', flat_id: ''
  })
  const [photo, setPhoto] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchData()
    fetchFlats()
  }, [])

  const fetchData = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        getAllVisitors(),
        getPendingVisitors()
      ])
      setVisitors(allRes.data)
      setPending(pendingRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchFlats = async () => {
    try {
      const res = await getFlatsForGuard()
      setFlats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddVisitor = async () => {
    if (!form.name || !form.purpose || !form.flat_id) {
      setMsg('Please fill name, purpose and flat')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('phone', form.phone)
      formData.append('purpose', form.purpose)
      formData.append('vehicle_number', form.vehicle_number)
      formData.append('flat_id', form.flat_id)
      if (photo) formData.append('photo', photo)

      await addVisitor(formData)
      setMsg('✅ Visitor added & resident notified!')
      setForm({ name: '', phone: '', purpose: '', vehicle_number: '', flat_id: '' })
      setPhoto(null)
      fetchData()
      setTab('dashboard')
    } catch (err) {
      setMsg('❌ Error adding visitor')
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await updateVisitorStatus(id, status)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleExit = async (id) => {
    try {
      await markExit(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const inside = visitors.filter(v => v.status === 'approved')
  const today = visitors

  return (
    <div>
      <Navbar title="Guard Dashboard" />

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{pending.length}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{inside.length}</div>
          <div style={styles.statLabel}>Inside</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{today.length}</div>
          <div style={styles.statLabel}>Today</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{visitors.filter(v => v.status === 'denied').length}</div>
          <div style={styles.statLabel}>Denied</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {['dashboard', 'entry', 'inside', 'log'].map(t => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <div>
            <p style={styles.sectionLabel}>Awaiting Approval</p>
            {pending.length === 0 && <p style={styles.empty}>No pending requests</p>}
            {pending.map(v => (
              <div key={v.id} style={styles.card}>
                {v.photo_url && <img src={v.photo_url} alt="visitor" style={styles.photo} />}
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{v.name}</div>
                  <div style={styles.cardSub}>{v.purpose} • Flat {v.flat_id} {v.vehicle_number && `• 🚗 ${v.vehicle_number}`}</div>
                </div>
                <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>
                <div style={styles.btnRow}>
                  <button style={styles.btnApprove} onClick={() => handleStatus(v.id, 'approved')}>✅ Allow</button>
                  <button style={styles.btnDeny} onClick={() => handleStatus(v.id, 'denied')}>❌ Deny</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entry tab */}
        {tab === 'entry' && (
          <div style={styles.form}>
            <p style={styles.sectionLabel}>New Visitor Entry</p>
            {msg && <div style={styles.msgBox}>{msg}</div>}
            <input style={styles.input} placeholder="Visitor name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={styles.input} placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <select style={styles.input} value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
              <option value="">Select purpose *</option>
              <option>Guest / Family</option>
              <option>Delivery</option>
              <option>Cab / Taxi</option>
              <option>Service / Repair</option>
              <option>Maid / Helper</option>
              <option>Other</option>
            </select>
            <input style={styles.input} placeholder="Vehicle number (optional)" value={form.vehicle_number} onChange={e => setForm({ ...form, vehicle_number: e.target.value })} />
            <select style={styles.input} value={form.flat_id} onChange={e => setForm({ ...form, flat_id: e.target.value })}>
              <option value="">Select flat *</option>
              {flats.map(f => (
                <option key={f.id} value={f.id}>{f.flat_number}</option>
              ))}
            </select>
            <div style={styles.photoWrap}>
              <label style={styles.photoLabel}>📷 Visitor Photo (optional)</label>
              <input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files[0])} />
            </div>
            <button style={styles.btnPrimary} onClick={handleAddVisitor} disabled={loading}>
              {loading ? 'Sending...' : '📤 Send Approval Request'}
            </button>
          </div>
        )}

        {/* Inside tab */}
        {tab === 'inside' && (
          <div>
            <p style={styles.sectionLabel}>Currently Inside</p>
            {inside.length === 0 && <p style={styles.empty}>Nobody inside</p>}
            {inside.map(v => (
              <div key={v.id} style={styles.card}>
                {v.photo_url && <img src={v.photo_url} alt="visitor" style={styles.photo} />}
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{v.name}</div>
                  <div style={styles.cardSub}>{v.purpose} • Flat {v.flat_id}</div>
                </div>
                <button style={styles.btnExit} onClick={() => handleExit(v.id)}>🚪 Exit</button>
              </div>
            ))}
          </div>
        )}

        {/* Log tab */}
        {tab === 'log' && (
          <div>
            <p style={styles.sectionLabel}>Today's Entry Log</p>
            {today.length === 0 && <p style={styles.empty}>No entries today</p>}
            {today.map(v => (
              <div key={v.id} style={styles.logRow}>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{v.name}</div>
                  <div style={styles.cardSub}>{v.purpose} • Flat {v.flat_id} • {new Date(v.entry_time).toLocaleTimeString()}</div>
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
      </div>
    </div>
  )
}

const styles = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', padding: '16px' },
  statCard: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '14px', textAlign: 'center' },
  statNum: { fontSize: '24px', fontWeight: '700', color: '#4f8ef7' },
  statLabel: { fontSize: '11px', color: '#888', marginTop: '4px' },
  tabBar: { display: 'flex', backgroundColor: '#1a1a2e', borderBottom: '1px solid #2a2a4a' },
  tab: { flex: 1, padding: '12px', background: 'none', border: 'none', color: '#888', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  tabActive: { color: '#4f8ef7', borderBottom: '2px solid #4f8ef7' },
  content: { padding: '16px' },
  sectionLabel: { fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' },
  empty: { textAlign: 'center', color: '#555', padding: '32px', fontSize: '14px' },
  card: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '14px', marginBottom: '10px' },
  logRow: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  photo: { width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', marginBottom: '10px' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: '15px', fontWeight: '600', color: '#fff' },
  cardSub: { fontSize: '12px', color: '#888', marginTop: '3px' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  badgePending: { backgroundColor: '#3a2a00', color: '#f0a500' },
  badgeApproved: { backgroundColor: '#0a2a00', color: '#4caf50' },
  badgeDenied: { backgroundColor: '#2a0000', color: '#f44336' },
  badgeExited: { backgroundColor: '#1a1a3a', color: '#888' },
  btnRow: { display: 'flex', gap: '8px', marginTop: '10px' },
  btnApprove: { flex: 1, padding: '8px', backgroundColor: '#0a2a00', color: '#4caf50', border: '1px solid #4caf50', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  btnDeny: { flex: 1, padding: '8px', backgroundColor: '#2a0000', color: '#f44336', border: '1px solid #f44336', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  btnExit: { padding: '8px 14px', backgroundColor: '#1a1a3a', color: '#888', border: '1px solid #2a2a4a', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  btnPrimary: { width: '100%', padding: '13px', backgroundColor: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '4px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #2a2a4a', backgroundColor: '#0f0f1a', color: '#ffffff', fontSize: '14px', marginBottom: '8px', outline: 'none' },
  photoWrap: { marginBottom: '12px' },
  photoLabel: { display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' },
  msgBox: { padding: '10px 16px', borderRadius: '8px', backgroundColor: '#1a2a1a', color: '#4caf50', fontSize: '13px', marginBottom: '12px' }
}

export default GuardDashboard