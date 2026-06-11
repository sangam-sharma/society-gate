import API from './auth'

// ─── Residents ───────────────────────────────────────────
export const getMyPendingVisitors = () => API.get('/residents/pending')
export const getMyVisitorHistory = () => API.get('/residents/history')
export const respondToVisitor = (visitorId, status) =>
  API.patch(`/residents/${visitorId}/respond`, { status })

// ─── Frequent Visitors ───────────────────────────────────
export const getFrequentVisitors = () => API.get('/residents/frequent')
export const addFrequentVisitor = (data) => API.post('/residents/frequent', data)
export const deleteFrequentVisitor = (id) => API.delete(`/residents/frequent/${id}`)