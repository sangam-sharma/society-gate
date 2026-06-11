import API from './auth'

// ─── Society ─────────────────────────────────────────────
export const createSociety = (data) => API.post('/admin/society', data)
export const getSocieties = () => API.get('/admin/society')

// ─── Flats ───────────────────────────────────────────────
export const createFlat = (data) => API.post('/admin/flat', data)
export const getFlats = () => API.get('/admin/flats')
export const deleteFlat = (id) => API.delete(`/admin/flat/${id}`)

// ─── Users ───────────────────────────────────────────────
export const getAllUsers = () => API.get('/admin/users')
export const createGuard = (data) => API.post('/admin/guard', data)
export const deleteUser = (id) => API.delete(`/admin/user/${id}`)

// ─── Reports ─────────────────────────────────────────────
export const getSummary = () => API.get('/admin/reports/summary')
export const getAllVisitorsReport = () => API.get('/admin/reports/visitors')