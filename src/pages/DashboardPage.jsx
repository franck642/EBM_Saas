import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dbProfilesApi, employeesApi, filesApi, emailsApi } from '../services/api'
import { Database, Users, FileArchive, Send, ChevronRight, CheckCircle, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [files, setFiles]       = useState([])
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      dbProfilesApi.list(),
      filesApi.list(),
      emailsApi.logs(10),
    ]).then(([p, f, l]) => {
      setProfiles(p.data)
      setFiles(f.data.files || [])
      setLogs(l.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const pdfCount = files.filter(f => f.type === 'pdf').length
  const zipCount = files.filter(f => f.type === 'zip').length
  const successLogs = logs.filter(l => l.status === 'success').length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = user?.first_name || user?.email?.split('@')[0] || ''

  const steps = [
    {
      num: '01', title: 'Bases de données',
      desc: profiles.length > 0 ? `${profiles.length} base(s) configurée(s)` : 'Aucune base configurée',
      done: profiles.length > 0, path: '/databases', icon: Database,
    },
    {
      num: '02', title: 'Employés',
      desc: profiles.length > 0 ? 'Charger depuis une base' : 'Configurez d\'abord une base',
      done: false, path: '/employees', icon: Users,
    },
    {
      num: '03', title: 'Bulletins PDF',
      desc: pdfCount > 0 ? `${pdfCount} PDF uploadé(s)` : 'Aucun PDF uploadé',
      done: pdfCount > 0, path: '/send', icon: FileArchive,
    },
    {
      num: '04', title: 'Envoi',
      desc: 'Crypter et envoyer les bulletins',
      done: false, path: '/send', icon: Send,
    },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{greeting}, {firstName} 👋</h1>
          <p style={{ marginTop: 4 }}>Tableau de bord — {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:28 }}>
          <div className="stat-card">
            <div className="stat-icon blue"><Database /></div>
            <div>
              <div className="stat-value">{loading ? '—' : profiles.length}</div>
              <div className="stat-label">Base(s) de paie</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><FileArchive /></div>
            <div>
              <div className="stat-value">{loading ? '—' : pdfCount}</div>
              <div className="stat-label">PDFs disponibles</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan"><FileArchive /></div>
            <div>
              <div className="stat-value">{loading ? '—' : zipCount}</div>
              <div className="stat-label">ZIPs cryptés</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Send /></div>
            <div>
              <div className="stat-value">{loading ? '—' : successLogs}</div>
              <div className="stat-label">Envois récents</div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Workflow */}
          <div className="card">
            <h3 style={{ marginBottom:20 }}>Workflow d'envoi</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {steps.map((s, i) => (
                <button key={i}
                  onClick={() => navigate(s.path)}
                  style={{
                    display:'flex', alignItems:'center', gap:14,
                    padding:'14px 16px',
                    background: s.done ? 'rgba(16,185,129,0.06)' : 'var(--surface-2)',
                    border: `1px solid ${s.done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-md)',
                    cursor:'pointer', textAlign:'left',
                    transition:'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = s.done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}
                >
                  <div style={{
                    width:36, height:36, borderRadius:'var(--radius-sm)',
                    background: s.done ? 'rgba(16,185,129,0.15)' : 'var(--surface-3)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color: s.done ? 'var(--success)' : 'var(--text-3)',
                    flexShrink:0,
                  }}>
                    <s.icon size={17} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:'0.72rem', fontFamily:'var(--font-mono)', color:'var(--text-3)' }}>{s.num}</span>
                      <span style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--text-1)' }}>{s.title}</span>
                    </div>
                    <div style={{ fontSize:'0.78rem', color: s.done ? 'var(--success)' : 'var(--text-3)', marginTop:2 }}>{s.desc}</div>
                  </div>
                  {s.done
                    ? <CheckCircle size={16} style={{ color:'var(--success)', flexShrink:0 }} />
                    : <ChevronRight size={16} style={{ color:'var(--text-3)', flexShrink:0 }} />
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Derniers envois */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3>Derniers envois</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/logs')}>
                Voir tout <ChevronRight size={13} />
              </button>
            </div>

            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                <div className="spinner" />
              </div>
            ) : logs.length === 0 ? (
              <div className="empty-state" style={{ padding:'40px 20px' }}>
                <Send />
                <h3>Aucun envoi</h3>
                <p>Les envois apparaîtront ici</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {logs.slice(0, 6).map((log, i) => (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 12px',
                    background:'var(--surface-2)',
                    borderRadius:'var(--radius-sm)',
                  }}>
                    {log.status === 'success'
                      ? <CheckCircle size={15} style={{ color:'var(--success)', flexShrink:0 }} />
                      : <XCircle    size={15} style={{ color:'var(--danger)',  flexShrink:0 }} />
                    }
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--text-1)' }} className="truncate">
                        {log.employee_name || log.employee_email}
                      </div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>
                        {log.period} · {new Date(log.sent_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <span className={`badge badge-${log.status === 'success' ? 'success' : 'danger'}`} style={{ fontSize:'0.65rem' }}>
                      {log.status === 'success' ? 'Envoyé' : 'Échec'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bases configurées */}
        {profiles.length > 0 && (
          <div className="card" style={{ marginTop:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3>Bases de données configurées</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/databases')}>
                Gérer <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:12 }}>
              {profiles.map(p => (
                <div key={p.id} style={{
                  padding:'14px 16px',
                  background:'var(--surface-2)',
                  border:'1px solid var(--border)',
                  borderRadius:'var(--radius-md)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <Database size={15} style={{ color:'var(--blue-light)' }} />
                    <span style={{ fontWeight:600, fontSize:'0.88rem' }}>{p.name}</span>
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
                    {p.database}
                  </div>
                  <div style={{ marginTop:8 }}>
                    {p.test_success === true  && <span className="badge badge-success"><span className="badge-dot" />OK</span>}
                    {p.test_success === false && <span className="badge badge-danger"><span className="badge-dot" />Erreur</span>}
                    {p.test_success === null  && <span className="badge badge-neutral">Non testé</span>}
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