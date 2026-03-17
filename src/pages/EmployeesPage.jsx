import { useState, useEffect } from 'react'
import { dbProfilesApi, employeesApi } from '../services/api'
import toast from 'react-hot-toast'
import { Users, RefreshCw, Database, CheckCircle, FileArchive, Mail } from 'lucide-react'

export default function EmployeesPage() {
  const [profiles, setProfiles]   = useState([])
  const [selectedProfile, setSP]  = useState('')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(false)
  const [loadingProfiles, setLP]  = useState(true)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    dbProfilesApi.list()
      .then(r => { setProfiles(r.data); if (r.data.length === 1) setSP(String(r.data[0].id)) })
      .finally(() => setLP(false))
  }, [])

  const loadEmployees = async () => {
    if (!selectedProfile) return toast.error('Sélectionnez une base de données')
    setLoading(true)
    try {
      const res = await employeesApi.list(selectedProfile)
      setEmployees(res.data)
      toast.success(`${res.data.length} employé(s) chargé(s)`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur de chargement')
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    return !q || e.matricule.includes(q) || e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
  })

  const withFile    = employees.filter(e => e.has_file).length
  const withoutFile = employees.length - withFile

  return (
    <>
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1>Employés</h1>
            <p style={{ marginTop:4 }}>Chargez les employés depuis une base de paie</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Sélection base + action */}
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
            <div className="form-group" style={{ flex:1, minWidth:200 }}>
              <label className="form-label">Base de données de paie</label>
              <select className="form-select" value={selectedProfile}
                onChange={e => { setSP(e.target.value); setEmployees([]) }}
                disabled={loadingProfiles}>
                <option value="">-- Sélectionner une base --</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.database} @ {p.server})
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={loadEmployees} disabled={loading || !selectedProfile}>
              {loading ? <span className="spinner spinner-sm" /> : <RefreshCw size={15} />}
              {loading ? 'Chargement...' : 'Charger les employés'}
            </button>
          </div>

          {profiles.length === 0 && !loadingProfiles && (
            <div className="alert alert-warning" style={{ marginTop:14 }}>
              <Database size={17} />
              <span>Aucune base configurée. <a href="/databases" style={{ color:'inherit', fontWeight:600 }}>Ajoutez une base de données</a> d'abord.</span>
            </div>
          )}
        </div>

        {/* Stats rapides */}
        {employees.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <div className="stat-card">
              <div className="stat-icon blue"><Users /></div>
              <div><div className="stat-value">{employees.length}</div><div className="stat-label">Employés chargés</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FileArchive /></div>
              <div><div className="stat-value">{withFile}</div><div className="stat-label">Avec fichier</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><Mail /></div>
              <div><div className="stat-value">{withoutFile}</div><div className="stat-label">Sans fichier</div></div>
            </div>
          </div>
        )}

        {/* Table */}
        {employees.length > 0 && (
          <div className="card" style={{ padding:0 }}>
            {/* Search */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
              <input className="form-input" placeholder="Rechercher par nom, matricule ou email..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ maxWidth:360 }} />
            </div>

            <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Civilité</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Fichier</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => (
                    <tr key={i}>
                      <td><span className="cell-mono">{e.matricule}</span></td>
                      <td><span className="cell-muted">{e.civilite}</span></td>
                      <td style={{ fontWeight:500 }}>{e.nom}</td>
                      <td>{e.prenom}</td>
                      <td><span className="cell-muted">{e.email}</span></td>
                      <td>
                        {e.has_file
                          ? <span className="badge badge-success"><CheckCircle size={11} />{e.filename}</span>
                          : <span className="badge badge-neutral">Aucun</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && search && (
              <div style={{ padding:'30px', textAlign:'center', color:'var(--text-3)', fontSize:'0.875rem' }}>
                Aucun résultat pour « {search} »
              </div>
            )}
          </div>
        )}

        {employees.length === 0 && !loading && (
          <div className="card">
            <div className="empty-state">
              <Users />
              <h3>Aucun employé chargé</h3>
              <p>Sélectionnez une base et cliquez sur "Charger les employés"</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}