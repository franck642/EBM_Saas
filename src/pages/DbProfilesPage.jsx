import { useState, useEffect } from 'react'
import { dbProfilesApi } from '../services/api'
import toast from 'react-hot-toast'
import {
  Database, Plus, Trash2, Edit2, Zap, CheckCircle, XCircle,
  Clock, Eye, EyeOff, X, Server
} from 'lucide-react'

const EMPTY = {
  name:'', description:'', driver:'ODBC Driver 17 for SQL Server',
  server:'', database:'', username:'', password:''
}

export default function DbProfilesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [testing, setTesting]   = useState({})    // { [id]: bool }
  const [modal, setModal]       = useState(null)  // null | 'create' | { ...profile }
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  const load = () => {
    setLoading(true)
    dbProfilesApi.list()
      .then(r => setProfiles(r.data))
      .catch(() => toast.error('Erreur chargement des profils'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setShowPwd(false); setModal('create') }
  const openEdit   = (p)  => { setForm({ ...p, password:'' }); setShowPwd(false); setModal(p) }
  const closeModal = ()   => setModal(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await dbProfilesApi.create(form)
        toast.success(`Profil "${form.name}" créé !`)
      } else {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await dbProfilesApi.update(modal.id, payload)
        toast.success('Profil mis à jour')
      }
      load(); closeModal()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer le profil "${p.name}" ?`)) return
    try {
      await dbProfilesApi.delete(p.id)
      toast.success('Profil supprimé')
      load()
    } catch { toast.error('Erreur suppression') }
  }

  const handleTest = async (p) => {
    setTesting(t => ({ ...t, [p.id]: true }))
    try {
      const res = await dbProfilesApi.test(p.id)
      if (res.data.success) toast.success(res.data.message)
      else toast.error(res.data.message)
      load()
    } catch (err) {
      toast.error('Erreur lors du test de connexion')
    } finally {
      setTesting(t => ({ ...t, [p.id]: false }))
    }
  }

  const f = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  return (
    <>
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1>Bases de données</h1>
            <p style={{ marginTop:4 }}>Gérez vos connexions aux bases de paie SQL Server</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Ajouter une base
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div className="spinner" style={{ width:32, height:32 }} />
          </div>
        ) : profiles.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Database />
              <h3>Aucune base configurée</h3>
              <p>Ajoutez votre première connexion à une base de paie SQL Server</p>
              <button className="btn btn-primary" style={{ marginTop:20 }} onClick={openCreate}>
                <Plus size={15} /> Ajouter une base
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:16 }}>
            {profiles.map(p => (
              <div key={p.id} className="card" style={{ padding:20 }}>
                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{
                      width:38, height:38,
                      background:'rgba(37,99,235,0.12)',
                      borderRadius:'var(--radius-sm)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'var(--blue-light)',
                    }}>
                      <Database size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{p.name}</div>
                      {p.description && <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{p.description}</div>}
                    </div>
                  </div>
                  {/* Statut */}
                  {p.test_success === true  && <span className="badge badge-success"><span className="badge-dot" />Connecté</span>}
                  {p.test_success === false && <span className="badge badge-danger"><span className="badge-dot" />Erreur</span>}
                  {p.test_success === null  && <span className="badge badge-neutral">Non testé</span>}
                </div>

                {/* Infos connexion */}
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                  {[['Serveur', p.server], ['Base', p.database], ['Utilisateur', p.username], ['Driver', p.driver]].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-3)', width:72, flexShrink:0 }}>{k}</span>
                      <span style={{ fontSize:'0.78rem', fontFamily:'var(--font-mono)', color:'var(--text-2)' }} className="truncate">{v}</span>
                    </div>
                  ))}
                  {p.last_tested && (
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-3)', width:72, flexShrink:0 }}>Testé le</span>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>
                        {new Date(p.last_tested).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex:1, justifyContent:'center' }}
                    onClick={() => handleTest(p)} disabled={testing[p.id]}>
                    {testing[p.id] ? <span className="spinner spinner-sm" /> : <Zap size={13} />}
                    {testing[p.id] ? 'Test...' : 'Tester'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Modifier">
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)} title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Créer / Modifier ── */}
      {modal !== null && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {modal === 'create' ? 'Nouvelle base de données' : `Modifier — ${modal.name}`}
                </div>
                <div className="modal-sub">Paramètres de connexion SQL Server</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-grid-2">
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Nom du profil *</label>
                  <input className="form-input" placeholder="ex: Filiale Nord, Base EBP, Archive 2023..." required {...f('name')} />
                </div>

                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Description optionnelle..." {...f('description')} />
                </div>

                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Driver ODBC *</label>
                  <select className="form-select" required {...f('driver')}>
                    <option>ODBC Driver 17 for SQL Server</option>
                    <option>ODBC Driver 18 for SQL Server</option>
                    <option>SQL Server Native Client 11.0</option>
                    <option>SQL Server</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Serveur *</label>
                  <input className="form-input" placeholder="192.168.1.10\SQLEXPRESS" required {...f('server')} />
                </div>

                <div className="form-group">
                  <label className="form-label">Base de données *</label>
                  <input className="form-input" placeholder="PAIE_2025" required {...f('database')} />
                </div>

                <div className="form-group">
                  <label className="form-label">Utilisateur SQL *</label>
                  <input className="form-input" placeholder="sa" required {...f('username')} />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mot de passe {modal !== 'create' && <span className="text-muted">(laisser vide = inchangé)</span>}
                  </label>
                  <div style={{ position:'relative' }}>
                    <input
                      className="form-input"
                      type={showPwd ? 'text' : 'password'}
                      placeholder={modal === 'create' ? 'Mot de passe SQL' : '••••••••'}
                      required={modal === 'create'}
                      style={{ paddingRight:40 }}
                      {...f('password')}
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:0, display:'flex' }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <Server size={17} />
                <span>Le mot de passe est chiffré (AES-128) avant d'être stocké en base de données.</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner spinner-sm" /> : null}
                  {modal === 'create' ? 'Créer le profil' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}