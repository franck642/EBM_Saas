import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Injecter le token JWT automatiquement sur chaque requête
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ebm_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Rediriger vers /login si le token expire
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ebm_token')
      localStorage.removeItem('ebm_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// ─── Companies ─────────────────────────────────────────────────────────────
export const companiesApi = {
  create: (data) => api.post('/companies', data),
  me:     ()     => api.get('/companies/me'),
}

// ─── DB Profiles ───────────────────────────────────────────────────────────
export const dbProfilesApi = {
  list:   ()         => api.get('/db-profiles'),
  create: (data)     => api.post('/db-profiles', data),
  update: (id, data) => api.put(`/db-profiles/${id}`, data),
  delete: (id)       => api.delete(`/db-profiles/${id}`),
  test:   (id)       => api.post(`/db-profiles/${id}/test`),
}

// ─── Employees ─────────────────────────────────────────────────────────────
export const employeesApi = {
  list: (profileId) => api.get(`/employees/${profileId}`),
}

// ─── Files ─────────────────────────────────────────────────────────────────
export const filesApi = {
  list:    ()             => api.get('/files/list'),
  upload:  (formData)     => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  encrypt: (profileId)    => api.post('/files/encrypt', { profile_id: profileId }),
}

// ─── Emails ────────────────────────────────────────────────────────────────
export const emailsApi = {
  send: (data) => api.post('/emails/send', data),
  logs: (limit = 100) => api.get(`/emails/logs?limit=${limit}`),
}

export default api