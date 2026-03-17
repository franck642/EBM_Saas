import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Connexion réussie')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 60%), var(--navy)',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, var(--blue), var(--accent))',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.1rem', fontWeight: 800, color: 'white',
            boxShadow: 'var(--shadow-glow)',
          }}>EBM</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Bienvenue</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
            Connectez-vous à votre espace RH
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ borderColor: 'var(--border-mid)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@societe.fr"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)',
                    padding: 0, display: 'flex'
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
              style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? <span className="spinner spinner-sm" /> : <LogIn size={16} />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: 'var(--text-3)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--blue-glow)', textDecoration: 'none', fontWeight: 600 }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}