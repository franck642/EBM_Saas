import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { companiesApi, authApi } from '../services/api'
import toast from 'react-hot-toast'
import { Building2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]     = useState(1) // 1=société, 2=compte
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState(null)

  const [company, setCompany] = useState({ name: '', siret: '', email: '' })
  const [user, setUser]       = useState({ email: '', password: '', first_name: '', last_name: '' })

  const handleCompany = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await companiesApi.create(company)
      setCompanyId(res.data.id)
      toast.success(`Société "${company.name}" créée !`)
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur création société')
    } finally {
      setLoading(false)
    }
  }

  const handleUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.register({ ...user, role: 'admin', company_id: companyId })
      toast.success('Compte créé avec succès !')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur création compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 40% 100%, rgba(6,182,212,0.1) 0%, transparent 60%), var(--navy)',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, var(--blue), var(--accent))',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.1rem', fontWeight: 800, color: 'white',
            boxShadow: 'var(--shadow-glow)',
          }}>EBM</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Créer un compte</h1>
        </div>

        {/* Steps */}
        <div className="steps" style={{ marginBottom: 28 }}>
          <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
            <div className="step-num">{step > 1 ? '✓' : '1'}</div>
            <div className="step-label">Votre société</div>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <div className="step-label">Votre compte</div>
          </div>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-mid)' }}>

          {/* Étape 1 — Société */}
          {step === 1 && (
            <form onSubmit={handleCompany} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <Building2 size={18} style={{ color:'var(--accent)' }} />
                <h3>Informations de votre société</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Nom de la société *</label>
                <input className="form-input" placeholder="Ma Société RH SARL" required
                  value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">SIRET</label>
                  <input className="form-input" placeholder="12345678900001"
                    value={company.siret} onChange={e => setCompany(c => ({ ...c, siret: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email société</label>
                  <input className="form-input" type="email" placeholder="contact@societe.fr"
                    value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
                style={{ marginTop:8, justifyContent:'center' }}>
                {loading ? <span className="spinner spinner-sm" /> : null}
                Continuer →
              </button>
            </form>
          )}

          {/* Étape 2 — Compte */}
          {step === 2 && (
            <form onSubmit={handleUser} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <UserPlus size={18} style={{ color:'var(--accent)' }} />
                <h3>Votre compte administrateur</h3>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input className="form-input" placeholder="Franck"
                    value={user.first_name} onChange={e => setUser(u => ({ ...u, first_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input className="form-input" placeholder="Dassi"
                    value={user.last_name} onChange={e => setUser(u => ({ ...u, last_name: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="admin@societe.fr" required
                  value={user.email} onChange={e => setUser(u => ({ ...u, email: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input className="form-input" type="password" placeholder="Minimum 8 caractères" required minLength={8}
                  value={user.password} onChange={e => setUser(u => ({ ...u, password: e.target.value }))} />
              </div>

              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button type="button" className="btn btn-secondary btn-lg"
                  onClick={() => setStep(1)}>← Retour</button>
                <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
                  style={{ justifyContent:'center' }}>
                  {loading ? <span className="spinner spinner-sm" /> : <UserPlus size={16} />}
                  Créer mon compte
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.82rem', color:'var(--text-3)' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color:'var(--blue-glow)', textDecoration:'none', fontWeight:600 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}