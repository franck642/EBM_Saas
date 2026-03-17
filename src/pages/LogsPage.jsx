import { useState, useEffect } from 'react'
import { emailsApi } from '../services/api'
import { ScrollText, CheckCircle, XCircle, RefreshCw, Lock, FileText } from 'lucide-react'

export default function LogsPage() {
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | success | failed

  const load = () => {
    setLoading(true)
    emailsApi.logs(200).then(r => setLogs(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = logs.filter(l => filter === 'all' || l.status === filter)
  const successCount = logs.filter(l => l.status === 'success').length
  const failedCount  = logs.filter(l => l.status === 'failed').length

  return (
    <>
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1>Historique des envois</h1>
            <p style={{ marginTop:4 }}>Journal complet de tous les bulletins envoyés</p>
          </div>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          <div className="stat-card">
            <div className="stat-icon blue"><ScrollText /></div>
            <div><div className="stat-value">{logs.length}</div><div className="stat-label">Total envois</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle /></div>
            <div><div className="stat-value">{successCount}</div><div className="stat-label">Réussis</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><XCircle /></div>
            <div><div className="stat-value">{failedCount}</div><div className="stat-label">Échoués</div></div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[['all','Tous'], ['success','Réussis'], ['failed','Échoués']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div className="spinner" style={{ width:32, height:32 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <ScrollText />
              <h3>Aucun enregistrement</h3>
              <p>Les envois apparaîtront ici</p>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Période</th>
                  <th>Matricule</th>
                  <th>Employé</th>
                  <th>Email</th>
                  <th>Fichier</th>
                  <th>Mode</th>
                  <th>Date d'envoi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={i}>
                    <td>
                      {l.status === 'success'
                        ? <span className="badge badge-success"><span className="badge-dot" />Envoyé</span>
                        : <span className="badge badge-danger"><span className="badge-dot" />Échec</span>
                      }
                    </td>
                    <td><span className="cell-mono">{l.period}</span></td>
                    <td><span className="cell-mono">{l.matricule}</span></td>
                    <td style={{ fontWeight:500 }}>{l.employee_name || '—'}</td>
                    <td><span className="cell-muted">{l.employee_email}</span></td>
                    <td>
                      {l.filename
                        ? <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.78rem', color:'var(--text-2)' }}>
                            <FileText size={12} />{l.filename}
                          </span>
                        : <span className="cell-muted">—</span>
                      }
                    </td>
                    <td>
                      {l.encrypted
                        ? <span className="badge badge-info"><Lock size={10} /> Crypté</span>
                        : <span className="badge badge-neutral">PDF direct</span>
                      }
                    </td>
                    <td><span className="cell-muted">{new Date(l.sent_at).toLocaleString('fr-FR')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Détail erreurs */}
        {filtered.some(l => l.error_message) && (
          <div className="card" style={{ marginTop:16 }}>
            <h3 style={{ marginBottom:14 }}>Détail des erreurs</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.filter(l => l.error_message).map((l, i) => (
                <div key={i} className="alert alert-danger">
                  <XCircle size={17} />
                  <div>
                    <strong>{l.employee_name || l.matricule}</strong>
                    <span style={{ marginLeft:8, fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>
                      {l.error_message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}