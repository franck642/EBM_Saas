import { useState, useEffect, useRef } from 'react'
import { dbProfilesApi, employeesApi, filesApi, emailsApi } from '../services/api'
import toast from 'react-hot-toast'
import {
  Lock, Send, CheckCircle, XCircle, AlertCircle,
  FileUp, RefreshCw, Database, ChevronDown, ChevronUp, Users
} from 'lucide-react'

export default function SendPage() {
  const [profiles, setProfiles]     = useState([])
  const [profileId, setProfileId]   = useState('')
  const [employees, setEmployees]   = useState([])
  const [selected, setSelected]     = useState({})   // { [matricule]: bool }
  const [period, setPeriod]         = useState(() => {
    const d = new Date(); return `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  })
  const [encrypted, setEncrypted]   = useState(true)
  const [step, setStep]             = useState(1)    // 1=config, 2=upload, 3=encrypt, 4=send
  const [uploading, setUploading]   = useState(false)
  const [encrypting, setEncrypting] = useState(false)
  const [sending, setSending]       = useState(false)
  const [results, setResults]       = useState(null)
  const [loadingEmps, setLoadingEmps] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    dbProfilesApi.list().then(r => {
      setProfiles(r.data)
      if (r.data.length === 1) setProfileId(String(r.data[0].id))
    })
  }, [])

  const loadEmployees = async () => {
    if (!profileId) return toast.error('Sélectionnez une base')
    setLoadingEmps(true)
    try {
      const res = await employeesApi.list(profileId)
      setEmployees(res.data)
      const all = {}
      res.data.forEach(e => { all[e.matricule] = true })
      setSelected(all)
      setStep(s => Math.max(s, 2))
      toast.success(`${res.data.length} employés chargés`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur chargement')
    } finally {
      setLoadingEmps(false)
    }
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    try {
      const res = await filesApi.upload(form)
      toast.success(`${res.data.length} fichier(s) uploadé(s)`)
      // Recharger les employés pour mettre à jour has_file
      if (profileId) {
        const emp = await employeesApi.list(profileId)
        setEmployees(emp.data)
      }
      setStep(s => Math.max(s, 3))
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Erreur upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleEncrypt = async () => {
    if (!profileId) return toast.error('Sélectionnez une base')
    setEncrypting(true)
    try {
      const res = await filesApi.encrypt(Number(profileId))
      const { success_count, error_count, errors } = res.data
      if (success_count > 0) toast.success(`${success_count} fichier(s) crypté(s)`)
      if (error_count > 0)   toast.error(`${error_count} erreur(s) : ${errors.slice(0,2).join(', ')}`)
      setStep(s => Math.max(s, 4))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur cryptage')
    } finally {
      setEncrypting(false)
    }
  }

  const selectedCount = Object.values(selected).filter(Boolean).length
  const toggleAll = () => {
    const allOn = employees.every(e => selected[e.matricule])
    const next  = {}
    employees.forEach(e => { next[e.matricule] = !allOn })
    setSelected(next)
  }

  const handleSend = async () => {
    if (!profileId)    return toast.error('Sélectionnez une base')
    if (!selectedCount) return toast.error('Sélectionnez au moins un employé')
    if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(period)) return toast.error('Période invalide (MM/YYYY)')

    const matricules = employees.filter(e => selected[e.matricule]).map(e => e.matricule)
    setSending(true)
    setResults(null)
    try {
      const res = await emailsApi.send({
        profile_id: Number(profileId),
        period, matricules, encrypted,
      })
      setResults(res.data)
      const { success_count, error_count } = res.data
      if (error_count === 0) toast.success(`✅ ${success_count} bulletin(s) envoyé(s) !`)
      else toast.error(`${error_count} échec(s) sur ${success_count + error_count} envois`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  const stepDone = (n) => step > n

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Envoyer les bulletins</h1>
          <p style={{ marginTop:4 }}>Uploadez, cryptez et envoyez les bulletins de paie par email</p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          {/* ─── Colonne gauche : configuration ─── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Étape 1 — Config */}
            <Section num={1} title="Configuration" done={stepDone(1)}>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="form-group">
                  <label className="form-label">Base de données de paie</label>
                  <select className="form-select" value={profileId}
                    onChange={e => { setProfileId(e.target.value); setEmployees([]); setSelected({}) }}>
                    <option value="">-- Sélectionner --</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Période (MM/YYYY)</label>
                    <input className="form-input" placeholder="05/2025" value={period}
                      onChange={e => setPeriod(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mode d'envoi</label>
                    <div style={{ display:'flex', gap:8, marginTop:2 }}>
                      {[true, false].map(val => (
                        <button key={String(val)} type="button"
                          onClick={() => setEncrypted(val)}
                          className={`btn btn-sm ${encrypted === val ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex:1, justifyContent:'center' }}>
                          {val ? <><Lock size={12} /> ZIP crypté</> : <><Send size={12} /> PDF direct</>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="btn btn-secondary" onClick={loadEmployees} disabled={loadingEmps || !profileId}>
                  {loadingEmps ? <span className="spinner spinner-sm" /> : <RefreshCw size={14} />}
                  Charger les employés
                </button>
              </div>
            </Section>

            {/* Étape 2 — Upload */}
            <Section num={2} title="Uploader les PDFs" done={stepDone(2)}>
              <input ref={fileInputRef} type="file" accept=".pdf" multiple style={{ display:'none' }}
                onChange={handleUpload} />
              <div className={`drop-zone ${uploading ? 'active' : ''}`}
                onClick={() => fileInputRef.current?.click()}>
                {uploading ? (
                  <><div className="spinner" style={{ margin:'0 auto 12px' }} /><p style={{ color:'var(--text-2)' }}>Upload en cours...</p></>
                ) : (
                  <>
                    <FileUp style={{ margin:'0 auto 12px' }} />
                    <p style={{ color:'var(--text-1)', fontWeight:600, marginBottom:4 }}>Cliquez pour uploader</p>
                    <p style={{ fontSize:'0.78rem' }}>PDFs au format MATRICULE_AAAAMMJJ.pdf</p>
                    <p style={{ fontSize:'0.72rem', marginTop:4 }}>ex: 12345_20250531.pdf</p>
                  </>
                )}
              </div>
            </Section>

            {/* Étape 3 — Cryptage */}
            {encrypted && (
              <Section num={3} title="Crypter les fichiers" done={stepDone(3)}>
                <p style={{ fontSize:'0.85rem', marginBottom:14 }}>
                  Les PDFs seront compressés en ZIP protégés par mot de passe.<br />
                  <strong>Mot de passe = matricule de l'employé.</strong>
                </p>
                <button className="btn btn-primary w-full" style={{ justifyContent:'center' }}
                  onClick={handleEncrypt} disabled={encrypting || employees.length === 0}>
                  {encrypting ? <span className="spinner spinner-sm" /> : <Lock size={14} />}
                  {encrypting ? 'Cryptage en cours...' : 'Crypter tous les fichiers'}
                </button>
              </Section>
            )}
          </div>

          {/* ─── Colonne droite : liste employés + envoi ─── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            <Section num={encrypted ? 4 : 3} title={`Envoyer — ${selectedCount} sélectionné(s)`} done={false}>
              {employees.length === 0 ? (
                <div className="empty-state" style={{ padding:'30px 0' }}>
                  <Users size={32} style={{ margin:'0 auto 10px', opacity:0.3 }} />
                  <p style={{ fontSize:'0.82rem' }}>Chargez les employés (étape 1)</p>
                </div>
              ) : (
                <>
                  {/* Header table */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <button className="btn btn-ghost btn-sm" onClick={toggleAll}>
                      {employees.every(e => selected[e.matricule]) ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>
                      {employees.filter(e => e.has_file).length} / {employees.length} avec fichier
                    </span>
                  </div>

                  {/* Liste */}
                  <div style={{ maxHeight:360, overflowY:'auto', display:'flex', flexDirection:'column', gap:4, marginBottom:16 }}>
                    {employees.map(e => {
                      const isSelected = !!selected[e.matricule]
                      return (
                        <div key={e.matricule}
                          onClick={() => setSelected(s => ({ ...s, [e.matricule]: !s[e.matricule] }))}
                          style={{
                            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                            background: isSelected ? 'rgba(37,99,235,0.08)' : 'var(--surface-2)',
                            border: `1px solid ${isSelected ? 'rgba(37,99,235,0.3)' : 'var(--border)'}`,
                            borderRadius:'var(--radius-sm)', cursor:'pointer',
                            transition:'all 0.1s ease',
                          }}>
                          <div className={`checkbox-custom ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <CheckCircle size={10} />}
                          </div>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:'var(--blue-glow)', width:60, flexShrink:0 }}>
                            {e.matricule}
                          </span>
                          <span style={{ flex:1, fontSize:'0.85rem', fontWeight:500 }} className="truncate">
                            {e.civilite} {e.nom} {e.prenom}
                          </span>
                          {e.has_file
                            ? <CheckCircle size={13} style={{ color:'var(--success)', flexShrink:0 }} />
                            : <AlertCircle size={13} style={{ color:'var(--text-3)', flexShrink:0 }} />
                          }
                        </div>
                      )
                    })}
                  </div>

                  <button className="btn btn-success btn-lg w-full" style={{ justifyContent:'center' }}
                    onClick={handleSend} disabled={sending || selectedCount === 0}>
                    {sending ? <span className="spinner spinner-sm" /> : <Send size={15} />}
                    {sending ? 'Envoi en cours...' : `Envoyer ${selectedCount} bulletin(s)`}
                  </button>
                </>
              )}
            </Section>

            {/* Résultats */}
            {results && (
              <div className="card" style={{ padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                  <h3>Résultats d'envoi</h3>
                  <div style={{ display:'flex', gap:10 }}>
                    <span className="badge badge-success"><CheckCircle size={11} />{results.success_count} ok</span>
                    {results.error_count > 0 && <span className="badge badge-danger"><XCircle size={11} />{results.error_count} échec</span>}
                  </div>
                </div>
                <div style={{ maxHeight:220, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                  {results.results.map((r, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
                      background:'var(--surface-2)', borderRadius:'var(--radius-sm)',
                    }}>
                      {r.success
                        ? <CheckCircle size={13} style={{ color:'var(--success)', flexShrink:0 }} />
                        : <XCircle    size={13} style={{ color:'var(--danger)',  flexShrink:0 }} />
                      }
                      <span style={{ flex:1, fontSize:'0.82rem' }} className="truncate">
                        <strong>{r.employee_name || r.matricule}</strong>
                        {!r.success && <span style={{ color:'var(--danger)', marginLeft:8, fontSize:'0.75rem' }}>{r.error}</span>}
                      </span>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{r.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ num, title, done, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card" style={{ padding:0 }}>
      <button type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:12, padding:'16px 20px',
          background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}>
        <div style={{
          width:24, height:24, borderRadius:'50%',
          background: done ? 'var(--success)' : 'var(--blue)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.7rem', fontWeight:700, color:'white', flexShrink:0,
        }}>
          {done ? '✓' : num}
        </div>
        <span style={{ flex:1, fontWeight:600, color:'var(--text-1)' }}>{title}</span>
        {open ? <ChevronUp size={15} style={{ color:'var(--text-3)' }} /> : <ChevronDown size={15} style={{ color:'var(--text-3)' }} />}
      </button>
      {open && <div style={{ padding:'18px 20px' }}>{children}</div>}
    </div>
  )
}
