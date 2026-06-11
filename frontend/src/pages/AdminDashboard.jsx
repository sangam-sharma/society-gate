import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import {
  createSociety, getSocieties,
  createFlat, getFlats, deleteFlat,
  getAllUsers, createGuard, deleteUser,
  getSummary
} from '../api/admin'

const AdminDashboard = () => {
  const [tab, setTab] = useState('summary')
  const [summary, setSummary] = useState(null)
  const [societies, setSocieties] = useState([])
  const [flats, setFlats] = useState([])
  const [users, setUsers] = useState([])
  const [msg, setMsg] = useState('')

  const [societyForm, setSocietyForm] = useState({ name: '', address: '' })
  const [flatForm, setFlatForm] = useState({ flat_number: '', floor: '', society_id: '' })
  const [guardForm, setGuardForm] = useState({ name: '', email: '', password: '', phone: '' })

  useEffect(() => {
    fetchSummary()
    fetchSocieties()
    fetchFlats()
    fetchUsers()
  }, [])

  const fetchSummary = async () => {
    try {
      const res = await getSummary()
      setSummary(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchSocieties = async () => {
    try {
      const res = await getSocieties()
      setSocieties(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchFlats = async () => {
    try {
      const res = await getFlats()
      setFlats(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers()
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const handleCreateSociety = async () => {
    if (!societyForm.name) { showMsg('❌ Society name required'); return }
    try {
      await createSociety(societyForm)
      showMsg('✅ Society created!')
      setSocietyForm({ name: '', address: '' })
      fetchSocieties()
    } catch (err) { showMsg('❌ Error creating society') }
  }

  const handleCreateFlat = async () => {
    if (!flatForm.flat_number || !flatForm.society_id) { showMsg('❌ Flat number and society required'); return }
    try {
      await createFlat(flatForm)
      showMsg('✅ Flat created!')
      setFlatForm({ flat_number: '', floor: '', society_id: '' })
      fetchFlats()
    } catch (err) { showMsg('❌ Error creating flat') }
  }

  const handleDeleteFlat = async (id) => {
    try {
      await deleteFlat(id)
      showMsg('✅ Flat deleted!')
      fetchFlats()
    } catch (err) { showMsg('❌ Error deleting flat') }
  }

  const handleCreateGuard = async () => {
    if (!guardForm.name || !guardForm.email || !guardForm.password) {
      showMsg('❌ Name, email and password required'); return
    }
    try {
      await createGuard(guardForm)
      showMsg('✅ Guard created!')
      setGuardForm({ name: '', email: '', password: '', phone: '' })
      fetchUsers()
    } catch (err) { showMsg('❌ Error creating guard') }
  }

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id)
      showMsg('✅ User deleted!')
      fetchUsers()
    } catch (err) { showMsg('❌ Error deleting user') }
  }

  return (
    <div>
      <Navbar title="Admin Dashboard" />

      {msg && <div style={styles.msgBox}>{msg}</div>}

      {/* Tabs */}
      <div style={styles.tabBar}>
        {['summary', 'societies', 'flats', 'guards'].map(t => (
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

        {/* Summary tab */}
        {tab === 'summary' && summary && (
          <div>
            <p style={styles.sectionLabel}>Society Overview</p>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.today_visitors}</div>
                <div style={styles.statLabel}>Today</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.pending}</div>
                <div style={styles.statLabel}>Pending</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.approved}</div>
                <div style={styles.statLabel}>Approved</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.denied}</div>
                <div style={styles.statLabel}>Denied</div>
              </div>
            </div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.total_flats}</div>
                <div style={styles.statLabel}>Flats</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.total_residents}</div>
                <div style={styles.statLabel}>Residents</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.total_guards}</div>
                <div style={styles.statLabel}>Guards</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{summary.total_visitors}</div>
                <div style={styles.statLabel}>Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Societies tab */}
        {tab === 'societies' && (
          <div>
            <p style={styles.sectionLabel}>Add Society</p>
            <div style={styles.form}>
              <input style={styles.input} placeholder="Society name *" value={societyForm.name} onChange={e => setSocietyForm({ ...societyForm, name: e.target.value })} />
              <input style={styles.input} placeholder="Address" value={societyForm.address} onChange={e => setSocietyForm({ ...societyForm, address: e.target.value })} />
              <button style={styles.btnPrimary} onClick={handleCreateSociety}>➕ Create Society</button>
            </div>

            <p style={{ ...styles.sectionLabel, marginTop: '24px' }}>Existing Societies</p>
            {societies.length === 0 && <p style={styles.empty}>No societies yet</p>}
            {societies.map(s => (
              <div key={s.id} style={styles.logRow}>
                <div>
                  <div style={styles.cardName}>{s.name}</div>
                  <div style={styles.cardSub}>{s.address}</div>
                </div>
                <span style={styles.idTag}>ID: {s.id}</span>
              </div>
            ))}
          </div>
        )}

        {/* Flats tab */}
        {tab === 'flats' && (
          <div>
            <p style={styles.sectionLabel}>Add Flat</p>
            <div style={styles.form}>
              <input style={styles.input} placeholder="Flat number (e.g. A-101) *" value={flatForm.flat_number} onChange={e => setFlatForm({ ...flatForm, flat_number: e.target.value })} />
              <input style={styles.input} placeholder="Floor (e.g. 1st)" value={flatForm.floor} onChange={e => setFlatForm({ ...flatForm, floor: e.target.value })} />
              <select style={styles.input} value={flatForm.society_id} onChange={e => setFlatForm({ ...flatForm, society_id: e.target.value })}>
                <option value="">Select society *</option>
                {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button style={styles.btnPrimary} onClick={handleCreateFlat}>➕ Create Flat</button>
            </div>

            <p style={{ ...styles.sectionLabel, marginTop: '24px' }}>All Flats</p>
            {flats.length === 0 && <p style={styles.empty}>No flats yet</p>}
            {flats.map(f => (
              <div key={f.id} style={styles.logRow}>
                <div>
                  <div style={styles.cardName}>{f.flat_number}</div>
                  <div style={styles.cardSub}>Floor: {f.floor || '—'} • Society ID: {f.society_id}</div>
                </div>
                <button style={styles.btnDelete} onClick={() => handleDeleteFlat(f.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}

        {/* Guards tab */}
        {tab === 'guards' && (
          <div>
            <p style={styles.sectionLabel}>Add Guard</p>
            <div style={styles.form}>
              <input style={styles.input} placeholder="Name *" value={guardForm.name} onChange={e => setGuardForm({ ...guardForm, name: e.target.value })} />
              <input style={styles.input} placeholder="Email *" value={guardForm.email} onChange={e => setGuardForm({ ...guardForm, email: e.target.value })} />
              <input style={styles.input} type="password" placeholder="Password *" value={guardForm.password} onChange={e => setGuardForm({ ...guardForm, password: e.target.value })} />
              <input style={styles.input} placeholder="Phone" value={guardForm.phone} onChange={e => setGuardForm({ ...guardForm, phone: e.target.value })} />
              <button style={styles.btnPrimary} onClick={handleCreateGuard}>➕ Create Guard</button>
            </div>

            <p style={{ ...styles.sectionLabel, marginTop: '24px' }}>All Users</p>
            {users.length === 0 && <p style={styles.empty}>No users yet</p>}
            {users.map(u => (
              <div key={u.id} style={styles.logRow}>
                <div>
                  <div style={styles.cardName}>{u.name}</div>
                  <div style={styles.cardSub}>{u.email} • {u.role}</div>
                </div>
                <button style={styles.btnDelete} onClick={() => handleDeleteUser(u.id)}>🗑️</button>
              </div>
            ))}
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '12px' },
  statCard: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '14px', textAlign: 'center' },
  statNum: { fontSize: '24px', fontWeight: '700', color: '#4f8ef7' },
  statLabel: { fontSize: '11px', color: '#888', marginTop: '4px' },
  logRow: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '3px' },
  cardSub: { fontSize: '12px', color: '#888' },
  idTag: { backgroundColor: '#0f0f1a', color: '#4f8ef7', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' },
  btnDelete: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  btnPrimary: { width: '100%', padding: '13px', backgroundColor: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '4px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #2a2a4a', backgroundColor: '#0f0f1a', color: '#ffffff', fontSize: '14px', marginBottom: '8px', outline: 'none' },
}

export default AdminDashboard