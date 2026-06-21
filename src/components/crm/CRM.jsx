import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Phone, X, Save, Trash2, ChevronRight, Clock } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'
import confetti from 'canvas-confetti'

const STAGES = [
  { key: 'Lead', color: '#94A3B8', label: 'Lead' },
  { key: 'Called', color: '#38BDF8', label: 'Called' },
  { key: 'No Answer', color: '#FBBF24', label: 'No Answer' },
  { key: 'Proposal Sent', color: '#A78BFA', label: 'Proposal Sent' },
  { key: 'Deposit Paid', color: '#4ADE80', label: 'Deposit Paid' },
  { key: 'In Progress', color: '#FB923C', label: 'In Progress' },
  { key: 'Delivered', color: '#67E8F9', label: 'Delivered' },
  { key: 'Paid in Full', color: '#4ADE80', label: 'Paid in Full' },
  { key: 'Rejected', color: '#F87171', label: 'Rejected' },
]

export default function CRM() {
  const [prospects, setProspects] = useState([])
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({})
  const [noteText, setNoteText] = useState('')
  const { toast } = useNotification()

  useEffect(() => { fetchProspects() }, [])

  const fetchProspects = async () => {
    const { data } = await supabase.from('prospects').select('*').order('created_at', { ascending: false })
    setProspects(data || [])
  }

  const handleAdd = async () => {
    if (!form.business_name) return toast('Business name is required', 'error')
    const { error } = await supabase.from('prospects').insert({
      business_name: form.business_name,
      contact_name: form.contact_name || '',
      phone: form.phone || '',
      country: form.country || 'US',
      niche: form.niche || '',
      stage: 'Lead',
      notes: ''
    })
    if (error) return toast('Error adding prospect', 'error')
    toast('Prospect added!', 'success')
    setForm({})
    setShowAdd(false)
    fetchProspects()
  }

  const handleStageChange = async (prospect, newStage) => {
    const { error } = await supabase.from('prospects')
      .update({ stage: newStage, last_action: `Moved to ${newStage}` })
      .eq('id', prospect.id)
    if (error) return toast('Error updating stage', 'error')

    if (newStage === 'No Answer') {
      const followUp = format(addDays(new Date(), 2), 'yyyy-MM-dd')
      const msg = `Follow up call: ${prospect.business_name}`
      await Promise.all([
        supabase.from('tasks').insert({ title: msg, due_date: followUp, priority: 'High', category: 'Prospecting', completed: false, related_to: prospect.id }),
        supabase.from('calendar_events').insert({ title: msg, date: followUp, type: 'follow_up', color: '#FBBF24', related_prospect_id: prospect.id })
      ])
      toast('Follow-up reminder set for 2 days from now 📅', 'info')
    }

    if (newStage === 'Deposit Paid') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#38BDF8', '#F472B6', '#4ADE80', '#FBBF24'] })
      toast('💰 Deal secured! Confetti time!', 'success')
    }

    setSelected(prev => prev ? { ...prev, stage: newStage } : null)
    fetchProspects()
  }

  const handleUpdate = async () => {
    if (!selected) return
    const { error } = await supabase.from('prospects').update({
      business_name: selected.business_name,
      contact_name: selected.contact_name,
      phone: selected.phone,
      country: selected.country,
      niche: selected.niche,
    }).eq('id', selected.id)
    if (error) return toast('Error saving', 'error')
    toast('Saved!', 'success')
    fetchProspects()
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    const existing = selected.notes || ''
    const updated = existing + `\n[${format(new Date(), 'dd MMM yyyy HH:mm')}] ${noteText}`
    await supabase.from('prospects').update({ notes: updated }).eq('id', selected.id)
    setSelected(prev => ({ ...prev, notes: updated }))
    setNoteText('')
    toast('Note added', 'success')
    fetchProspects()
  }

  const handleDelete = async (id) => {
    await supabase.from('prospects').delete().eq('id', id)
    toast('Prospect deleted', 'info')
    setShowDelete(null)
    setSelected(null)
    fetchProspects()
  }

  const stageColor = (stage) => STAGES.find(s => s.key === stage)?.color || '#94A3B8'

  return (
    <div style={{ position: 'relative' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">CRM & Prospects</div>
          <div className="page-subtitle">{prospects.length} total prospects</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Prospect
        </button>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
        {STAGES.map(stage => {
          const cards = prospects.filter(p => p.stage === stage.key)
          return (
            <div key={stage.key} style={{ minWidth: 220, flex: '0 0 220px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 10, padding: '0 4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stage.label}
                  </span>
                </div>
                <span style={{
                  background: `${stage.color}22`, color: stage.color,
                  borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px'
                }}>{cards.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                <AnimatePresence>
                  {cards.map(p => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelected(p)}
                      whileHover={{ y: -2 }}
                      style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderLeft: `3px solid ${stage.color}`,
                        borderRadius: 'var(--radius-sm)', padding: '12px',
                        cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
                        {p.business_name}
                      </div>
                      {p.contact_name && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.contact_name}</div>}
                      {p.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                          <Phone size={10} /> {p.phone}
                        </div>
                      )}
                      {p.niche && (
                        <div style={{ marginTop: 6 }}>
                          <span className="badge badge-blue" style={{ fontSize: 10 }}>{p.niche}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 800 }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="side-panel"
              style={{ zIndex: 900 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.business_name}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={handleUpdate}>
                    <Save size={14} />
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '8px 12px', color: '#F87171' }}
                    onClick={() => setShowDelete(selected.id)}>
                    <Trash2 size={14} />
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setSelected(null)}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Stage Change */}
              <div className="form-group">
                <label className="label">Pipeline Stage</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {STAGES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => handleStageChange(selected, s.key)}
                      style={{
                        padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', border: `1px solid ${selected.stage === s.key ? s.color : 'var(--border)'}`,
                        background: selected.stage === s.key ? `${s.color}22` : 'transparent',
                        color: selected.stage === s.key ? s.color : 'var(--text-muted)',
                        transition: 'var(--transition)'
                      }}
                    >{s.label}</button>
                  ))}
                </div>
              </div>

              <div className="divider" />

              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Business Name</label>
                  <input className="input" value={selected.business_name || ''} onChange={e => setSelected({ ...selected, business_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Contact Name</label>
                  <input className="input" value={selected.contact_name || ''} onChange={e => setSelected({ ...selected, contact_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input className="input" value={selected.phone || ''} onChange={e => setSelected({ ...selected, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Country</label>
                  <select className="input" value={selected.country || 'US'} onChange={e => setSelected({ ...selected, country: e.target.value })}>
                    {['US', 'Canada', 'UK', 'Australia', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="label">Niche</label>
                  <input className="input" value={selected.niche || ''} onChange={e => setSelected({ ...selected, niche: e.target.value })} />
                </div>
              </div>

              <div className="divider" />

              {/* Notes */}
              <div>
                <label className="label">Notes & Call Log</label>
                <div style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: 12, minHeight: 80,
                  fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', marginBottom: 8
                }}>
                  {selected.notes || 'No notes yet.'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
                  <button className="btn btn-primary" onClick={handleAddNote} style={{ whiteSpace: 'nowrap' }}>
                    Add Note
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Prospect Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add Prospect</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Business Name *</label>
                  <input className="input" value={form.business_name || ''} onChange={e => setForm({ ...form, business_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Contact Name</label>
                  <input className="input" value={form.contact_name || ''} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Country</label>
                  <select className="input" value={form.country || 'US'} onChange={e => setForm({ ...form, country: e.target.value })}>
                    {['US', 'Canada', 'UK', 'Australia', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="label">Niche / Industry</label>
                  <input className="input" placeholder="e.g. Plumber, HVAC, Landscaping" value={form.niche || ''} onChange={e => setForm({ ...form, niche: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Add Prospect</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {showDelete && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 380 }}>
              <div className="modal-title" style={{ color: '#F87171' }}>Delete Prospect?</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                This will permanently remove this prospect and all their data. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowDelete(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(showDelete)}>Yes, Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
