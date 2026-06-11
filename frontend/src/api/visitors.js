import API from './auth'

// ─── Visitors ────────────────────────────────────────────
export const addVisitor = (formData) => API.post('/visitors/', formData)
export const getAllVisitors = () => API.get('/visitors/')
export const getPendingVisitors = () => API.get('/visitors/pending')
export const getVisitorsByFlat = (flatId) => API.get(`/visitors/flat/${flatId}`)
export const updateVisitorStatus = (visitorId, status) =>
  API.patch(`/visitors/${visitorId}/status`, { status })
export const markExit = (visitorId) => API.patch(`/visitors/${visitorId}/exit`)
export const getFlatsForGuard = () => API.get('/visitors/flats/all')