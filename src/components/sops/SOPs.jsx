import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, X, Trash2, Edit, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

const DEFAULT_CATS = ['Prospecting', 'Client Onboarding', 'Delivery', 'Finance', 'General']

export default function SOPs() {
  const [sops, setSops] = useState([])
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ category: 'General' })
  const [filterCat, setFilterCat] = useState('All')
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('wl_sop_cats')
    return saved ? JSON.parse(saved) : DEFAULT_CATS
  })
  const [newCat, setNewCat] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const { toast } = useNotification()

  useEffect(() => { fetchSOPs() }, [])

  const fetchSOPs = async () => {
    const { data } = await supabase.from('sops').select('*').order('created_at', { ascending: false })
    setSops(data || [])
  }

  const handleAdd = async () => {
    if (!form.title || !form.content) return toast('Title and content are required', 'error')
    const { error } = await supabase.from('sops').insert({
      title: form.title,
      content: form.content,
      category: form.category || 'General'
    })
    if (error) return toast('Error saving SOP', 'error')
    toast('SOP saved!', 'success')
    setForm({ category: 'General' })
    setShowAdd(false)
    fetchSOPs()
  }

  const handleUpdate = async () => {
    if (!selected) return
    const { error } = await supabase.from('sops').update({
      title: selected.title,
      content: selected.content,
      category: selected.category
    }).eq('id', selected.id)
    if (error) return toast('Error saving', 'error')
    toast('SOP updated!', 'success')
    setEditing(false)
    fetchSOPs()
  }

  const handleDelete = async (id) => {
    await supabase.from('sops').delete().eq('id', id)
    toast('SOP deleted', 'info')
    setShowDelete(null)
    setSelected(null)
    fetchSOPs()
  }

  const handleDuplicate = async (sop) => {
    await supabase.from('sops').insert({ title: `${sop.title} (Copy)`, content: sop.content, category: sop.category })
    toast('SOP duplicated!', 'success')
    fetchSOPs()
  }

  const handleAddCat = () => {
    if (!newCat.trim()) return
    const updated = [...categories, newCat.trim()]
    setCategories(updated)
    localStorage.setItem('wl_sop_cats', JSON.stringify(updated))
    setNewCat('')
    setShowAddCat(false)
    toast('Category added!', 'success')
  }

  const filtered = filterCat === 'All' ? sops : sops.filter(s => s.category === filterCat)
  const catColors = { 'Prospecting': '#38BDF8', 'Client Onboarding': '#F472B6', 'Delivery': '#4ADE80', 'Finance': '#FBBF24', 'General': '#A78BFA' }

  return (
    <div style={{ position: 'relative' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">SOPs</div>
          <div className="page-subtitle">Standard Operating Procedures — paste and save instantly</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowAddCat(true)}><Plus size={16} /> Category</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add SOP</button>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['All', ...categories].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`tag ${filterCat === c ? 'active' : ''}`} style={{ fontSize: 12 }}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={40} />
          <h3>No SOPs yet</h3>
          <p>Paste any SOP Claude generates for you and save it here as a card.</p>
        </div>
      ) : (
        <div className="grid-3">
          <AnimatePresence>
            {filtered.map((sop, i) => {
              const color = catColors[sop.category] || '#94A3B8'
              return (
                <motion.div
                  key={sop.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderTop: `3px solid ${color}`, borderRadius: 'var(--radius)',
                    padding: 20, cursor: 'pointer', transition: 'var(--transition)',
                    display: 'flex', flexDirection: 'column'
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, background: `${color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <FileText size={16} color={color} />
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={e => { e.stopPropagation(); handleDuplicate(sop) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <Copy size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setShowDelete(sop.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, flex: 1 }}
                    onClick={() => { setSelected(sop); setEditing(false) }}>
                    {sop.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {sop.content.slice(0, 100)}...
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}22`, padding: '2px 8px', borderRadius: 999 }}>{sop.category}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(sop.created_at), 'MMM d')}</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Side Panel Viewer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelected(null); setEditing(false) }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 800 }} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', right: 0, top: 0, height: '100vh', width: 560,
                background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
                boxShadow: '-4px 0 32px rgba(0,0,0,0.2)', zIndex: 900,
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                {editing ? (
                  <input className="input" value={selected.title} onChange={e => setSelected({ ...selected, title: e.target.value })} style={{ flex: 1, fontSize: 18, fontWeight: 800 }} />
                ) : (
                  <div style={{ fontSize: 18, fontWeight: 800, flex: 1 }}>{selected.title}</div>
                )}
                <button className="btn btn-ghost" style={{ padding: '7px 12px' }} onClick={() => editing ? handleUpdate() : setEditing(true)}>
                  {editing ? <><FileText size={14} /> Save</> : <><Edit size={14} /> Edit</>}
                </button>
                <button onClick={() => { setSelected(null); setEditing(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                {editing ? (
                  <textarea className="input" value={selected.content} rows={30}
                    onChange={e => setSelected({ ...selected, content: e.target.value })}
                    style={{ width: '100%', minHeight: 500, fontFamily: 'var(--font-main)', lineHeight: 1.8, fontSize: 14 }} />
                ) : (
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                    {selected.content}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {selected.category} · Last updated {format(new Date(selected.created_at), 'MMM d, yyyy')}
                </span>
                <button onClick={() => setShowDelete(selected.id)} className="btn btn-ghost" style={{ color: '#F87171', padding: '6px 12px' }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add SOP Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
              <div className="modal-title">Add SOP</div>
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="label">SOP Title *</label>
                  <input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cold Calling Process" />
                </div>
                <div className="form-group">
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Content * — paste your SOP here</label>
                <textarea className="input" rows={14} value={form.content || ''}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Paste the full SOP content here. It will be saved and formatted as-is..." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Save SOP</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAddCat && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddCat(false)}>
            <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 380 }}
              onClick={e => e.stopPropagation()}>
              <div className="modal-title">New SOP Category</div>
              <div className="form-group">
                <label className="label">Category Name</label>
                <input className="input" value={newCat} onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCat()} autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowAddCat(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddCat}>Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDelete && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 360 }}>
              <div className="modal-title" style={{ color: '#F87171' }}>Delete SOP?</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This will permanently remove this SOP.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowDelete(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(showDelete)}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
