import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Save, Trash2, ChevronRight, ArrowLeft, Phone, Mail, Globe, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

const PROJECT_STAGES = ['Not Started', 'In Progress', 'In Review', 'Delivered', 'Complete']
const stageColors = {
  'Not Started': '#94A3B8',
  'In Progress': '#38BDF8',
  'In Review': '#FBBF24',
  'Delivered': '#A78BFA',
  'Complete': '#4ADE80'
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({})
  const [noteText, setNoteText] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const { toast } = useNotification()

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
  }

  const handleAdd = async () => {
    if (!form.business_name) return toast('Business name is required', 'error')
    const deposit_usd = parseFloat(form.deposit_paid_usd || 0)
    const total_usd = parseFloat(form.total_price_usd || 0)
    const deposit_zar = parseFloat(form.deposit_paid_zar || 0)
    const total_zar = parseFloat(form.total_price_zar || 0)
    const { error } = await supabase.from('clients').insert({
      business_name: form.business_name,
      contact_name: form.contact_name || '',
      email: form.email || '',
      phone: form.phone || '',
      country: form.country || 'US',
      project_type: form.project_type || '',
      pages: parseInt(form.pages || 0),
      total_price_usd: total_usd,
      total_price_zar: total_zar,
      deposit_paid_usd: deposit_usd,
      deposit_paid_zar: deposit_zar,
      balance_usd: total_usd - deposit_usd,
      balance_zar: total_zar - deposit_zar,
      project_stage: 'Not Started',
      start_date: form.start_date || null,
      delivery_date: form.delivery_date || null,
      notes: ''
    })
    if (error) return toast('Error adding client', 'error')
    toast('Client added! 🎉', 'success')
    setForm({})
    setShowAdd(false)
    fetchClients()
  }

  const handleUpdate = async () => {
    if (!selected) return
    const total_usd = parseFloat(selected.total_price_usd || 0)
    const deposit_usd = parseFloat(selected.deposit_paid_usd || 0)
    const total_zar = parseFloat(selected.total_price_zar || 0)
    const deposit_zar = parseFloat(selected.deposit_paid_zar || 0)
    const { error } = await supabase.from('clients').update({
      business_name: selected.business_name,
      contact_name: selected.contact_name,
      email: selected.email,
      phone: selected.phone,
      country: selected.country,
      project_type: selected.project_type,
      pages: selected.pages,
      total_price_usd: total_usd,
      total_price_zar: total_zar,
      deposit_paid_usd: deposit_usd,
      deposit_paid_zar: deposit_zar,
      balance_usd: total_usd - deposit_usd,
      balance_zar: total_zar - deposit_zar,
      project_stage: selected.project_stage,
      start_date: selected.start_date,
      delivery_date: selected.delivery_date,
      onboarding_data: selected.onboarding_data
    }).eq('id', selected.id)
    if (error) return toast('Error saving', 'error')
    toast('Client updated!', 'success')
    fetchClients()
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    const existing = selected.notes || ''
    const updated = existing + `\n[${format(new Date(), 'dd MMM yyyy HH:mm')}] ${noteText}`
    await supabase.from('clients').update({ notes: updated }).eq('id', selected.id)
    setSelected(prev => ({ ...prev, notes: updated }))
    setNoteText('')
    toast('Note added', 'success')
  }

  const handleDelete = async (id) => {
    await supabase.from('clients').delete().eq('id', id)
    toast('Client deleted', 'info')
    setShowDelete(null)
    setSelected(null)
    fetchClients()
  }

  const tabs = ['details', 'finance', 'onboarding', 'notes']

  if (selected) {
    const stage = selected.project_stage || 'Not Started'
    const stageIdx = PROJECT_STAGES.indexOf(stage)
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setSelected(null)}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="page-title">{selected.business_name}</div>
            <div className="page-subtitle">{selected.contact_name} · {selected.country}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleUpdate}><Save size={15} /> Save Changes</button>
            <button className="btn btn-ghost" style={{ color: '#F87171' }} onClick={() => setShowDelete(selected.id)}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Project Stage</div>
          <div style={{ display: 'flex', gap: 0 }}>
            {PROJECT_STAGES.map((s, i) => (
              <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div
                  onClick={() => setSelected({ ...selected, project_stage: s })}
                  style={{
                    flex: 1, padding: '10px 12px', textAlign: 'center',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    background: i <= stageIdx ? stageColors[stage] + '22' : 'var(--bg-elevated)',
                    color: i <= stageIdx ? stageColors[stage] : 'var(--text-muted)',
                    borderTop: `2px solid ${i <= stageIdx ? stageColors[stage] : 'var(--border)'}`,
                    transition: 'var(--transition)'
                  }}
                >{s}</div>
                {i < PROJECT_STAGES.length - 1 && (
                  <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '10px 18px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeTab === t ? 'var(--color-primary)' : 'transparent'}`,
              color: activeTab === t ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              transition: 'var(--transition)', marginBottom: -1
            }}>{t}</button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="grid-2">
            {[
              { label: 'Business Name', key: 'business_name' },
              { label: 'Contact Name', key: 'contact_name' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Project Type', key: 'project_type' },
              { label: 'Number of Pages', key: 'pages', type: 'number' },
              { label: 'Start Date', key: 'start_date', type: 'date' },
              { label: 'Delivery Date', key: 'delivery_date', type: 'date' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="label">{f.label}</label>
                <input className="input" type={f.type || 'text'}
                  value={selected[f.key] || ''} onChange={e => setSelected({ ...selected, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="label">Country</label>
              <select className="input" value={selected.country || 'US'} onChange={e => setSelected({ ...selected, country: e.target.value })}>
                {['US', 'Canada', 'UK', 'Australia', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div>
            <div className="grid-2" style={{ marginBottom: 24 }}>
              <div className="card" style={{ borderLeft: '3px solid #4ADE80' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>TOTAL (USD)</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>${parseFloat(selected.total_price_usd || 0).toLocaleString()}</div>
              </div>
              <div className="card" style={{ borderLeft: '3px solid #FBBF24' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>BALANCE OWED (USD)</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#FBBF24' }}>${parseFloat(selected.balance_usd || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="grid-2">
              {[
                { label: 'Total Price (USD)', key: 'total_price_usd' },
                { label: 'Total Price (ZAR)', key: 'total_price_zar' },
                { label: 'Deposit Paid (USD)', key: 'deposit_paid_usd' },
                { label: 'Deposit Paid (ZAR)', key: 'deposit_paid_zar' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="label">{f.label}</label>
                  <input className="input" type="number" value={selected[f.key] || ''} onChange={e => setSelected({ ...selected, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'onboarding' && (
          <div className="form-group">
            <label className="label">Onboarding Data (paste from form)</label>
            <textarea className="input" rows={12} style={{ minHeight: 300, fontFamily: 'monospace', fontSize: 13 }}
              value={selected.onboarding_data || ''}
              onChange={e => setSelected({ ...selected, onboarding_data: e.target.value })}
              placeholder="Paste your onboarding form responses here..." />
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: 16, minHeight: 200,
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8,
              whiteSpace: 'pre-wrap', marginBottom: 12
            }}>
              {selected.notes || 'No notes yet. Add your first note below.'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Add a note or communication log..."
                value={noteText} onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
              <button className="btn btn-primary" onClick={handleAddNote} style={{ whiteSpace: 'nowrap' }}>Add Note</button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showDelete && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 380 }}>
                <div className="modal-title" style={{ color: '#F87171' }}>Delete Client?</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                  This will permanently remove this client and all their data.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setShowDelete(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(showDelete)}>Yes, Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">{clients.length} total clients</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <Globe size={40} />
          <h3>No clients yet</h3>
          <p>Once you close a deal, add them here to track the project.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map(client => (
            <motion.div key={client.id} variants={item}
              onClick={() => { setSelected(client); setActiveTab('details') }}
              whileHover={{ x: 4 }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '18px 20px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)'
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--color-primary-20)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0
              }}>
                {client.business_name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{client.business_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{client.contact_name} · {client.project_type}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700,
                  background: `${stageColors[client.project_stage] || '#94A3B8'}22`,
                  color: stageColors[client.project_stage] || '#94A3B8',
                  marginBottom: 4
                }}>{client.project_stage}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: client.balance_usd > 0 ? '#FBBF24' : '#4ADE80' }}>
                  ${parseFloat(client.total_price_usd || 0).toLocaleString()}
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div className="modal-title">Add New Client</div>
              <div className="grid-2">
                {[
                  { label: 'Business Name *', key: 'business_name' },
                  { label: 'Contact Name', key: 'contact_name' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Project Type', key: 'project_type', placeholder: 'e.g. 5-page website' },
                  { label: 'Pages', key: 'pages', type: 'number' },
                  { label: 'Total Price (USD)', key: 'total_price_usd', type: 'number' },
                  { label: 'Total Price (ZAR)', key: 'total_price_zar', type: 'number' },
                  { label: 'Deposit Paid (USD)', key: 'deposit_paid_usd', type: 'number' },
                  { label: 'Deposit Paid (ZAR)', key: 'deposit_paid_zar', type: 'number' },
                  { label: 'Start Date', key: 'start_date', type: 'date' },
                  { label: 'Delivery Date', key: 'delivery_date', type: 'date' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="label">{f.label}</label>
                    <input className="input" type={f.type || 'text'} placeholder={f.placeholder || ''}
                      value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="label">Country</label>
                  <select className="input" value={form.country || 'US'} onChange={e => setForm({ ...form, country: e.target.value })}>
                    {['US', 'Canada', 'UK', 'Australia', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Add Client</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
