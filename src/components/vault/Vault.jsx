import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderOpen, Link, FileText, StickyNote, Trash2, X, ExternalLink, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

const DEFAULT_CATS = ['Proposals', 'Portfolio', 'SOPs', 'Client Files', 'Logins & Credentials', 'Resources']
const TYPE_ICONS = { link: Link, pdf: FileText, note: StickyNote }
const TYPE_COLORS = { link: '#38BDF8', pdf: '#F472B6', note: '#FBBF24' }

export default function Vault() {
  const [docs, setDocs] = useState([])
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('wl_vault_cats')
    return saved ? JSON.parse(saved) : DEFAULT_CATS
  })
  const [selectedCat, setSelectedCat] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({ type: 'link' })
  const [newCat, setNewCat] = useState('')
  const { toast } = useNotification()

  useEffect(() => { fetchDocs() }, [])

  const fetchDocs = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
    setDocs(data || [])
  }

  const handleAdd = async () => {
    if (!form.title || !form.category) return toast('Title and category are required', 'error')
    if (form.type === 'link' && !form.url) return toast('URL is required for links', 'error')
    const { error } = await supabase.from('documents').insert({
      title: form.title,
      description: form.description || '',
      category: form.category,
      type: form.type,
      url: form.url || null,
      content: form.content || null
    })
    if (error) return toast('Error saving document', 'error')
    toast('Saved to vault!', 'success')
    setForm({ type: 'link' })
    setShowAdd(false)
    fetchDocs()
  }

  const handleDelete = async (id) => {
    await supabase.from('documents').delete().eq('id', id)
    toast('Deleted', 'info')
    setShowDelete(null)
    fetchDocs()
  }

  const handleAddCat = () => {
    if (!newCat.trim()) return
    const updated = [...categories, newCat.trim()]
    setCategories(updated)
    localStorage.setItem('wl_vault_cats', JSON.stringify(updated))
    setNewCat('')
    setShowAddCat(false)
    toast('Category added!', 'success')
  }

  const catDocs = selectedCat ? docs.filter(d => d.category === selectedCat) : []

  if (selectedCat) {
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setSelectedCat(null)}>
              ← Back
            </button>
            <div>
              <div className="page-title">{selectedCat}</div>
              <div className="page-subtitle">{catDocs.length} item{catDocs.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm({ type: 'link', category: selectedCat }); setShowAdd(true) }}>
            <Plus size={16} /> Add Item
          </button>
        </div>

        {catDocs.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={40} />
            <h3>This folder is empty</h3>
            <p>Add links, notes, or PDFs to this category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {catDocs.map(doc => {
                const Icon = TYPE_ICONS[doc.type] || FileText
                const color = TYPE_COLORS[doc.type] || '#94A3B8'
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{
                      padding: '16px 20px', background: 'var(--bg-surface)',
                      border: '1px solid var(--border)', borderLeft: `3px solid ${color}`,
                      borderRadius: 'var(--radius-sm)', display: 'flex',
                      alignItems: 'flex-start', gap: 14
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, background: `${color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{doc.title}</div>
                      {doc.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{doc.description}</div>}
                      {doc.type === 'link' && doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer" style={{
                          fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <ExternalLink size={11} /> {doc.url}
                        </a>
                      )}
                      {doc.type === 'note' && doc.content && (
                        <div style={{
                          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
                          background: 'var(--bg-elevated)', padding: '8px 12px',
                          borderRadius: 6, whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto'
                        }}>{doc.content}</div>
                      )}
                    </div>
                    <button onClick={() => setShowDelete(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {showDelete && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 360 }}>
                <div className="modal-title" style={{ color: '#F87171' }}>Delete Item?</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This will permanently remove this item from your vault.</p>
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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Document Vault</div>
          <div className="page-subtitle">All your important files, links and notes in one place</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowAddCat(true)}><Plus size={16} /> Add Category</button>
          <button className="btn btn-primary" onClick={() => { setForm({ type: 'link' }); setShowAdd(true) }}><Plus size={16} /> Add Item</button>
        </div>
      </div>

      <div className="grid-3">
        {categories.map((cat, i) => {
          const count = docs.filter(d => d.category === cat).length
          const colors = ['#38BDF8', '#F472B6', '#4ADE80', '#FBBF24', '#A78BFA', '#FB923C']
          const color = colors[i % colors.length]
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
              onClick={() => setSelectedCat(cat)}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderTop: `3px solid ${color}`, borderRadius: 'var(--radius)',
                padding: '20px', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
              }}>
                <FolderOpen size={20} color={color} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} item{count !== 1 ? 's' : ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add to Vault</div>
              <div className="form-group">
                <label className="label">Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['link', 'note', 'pdf'].map(t => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
                      flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${form.type === t ? 'var(--color-primary)' : 'var(--border)'}`,
                      background: form.type === t ? 'var(--color-primary-20)' : 'transparent',
                      color: form.type === t ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Title *</label>
                <input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <input className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Category *</label>
                <select className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {form.type === 'link' && (
                <div className="form-group">
                  <label className="label">URL *</label>
                  <input className="input" type="url" placeholder="https://" value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })} />
                </div>
              )}
              {form.type === 'note' && (
                <div className="form-group">
                  <label className="label">Note Content</label>
                  <textarea className="input" rows={5} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />
                </div>
              )}
              {form.type === 'pdf' && (
                <div className="form-group">
                  <label className="label">PDF URL or Description</label>
                  <input className="input" value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="Paste a link to your PDF" />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Save to Vault</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAddCat && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddCat(false)}>
            <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 380 }}
              onClick={e => e.stopPropagation()}>
              <div className="modal-title">New Category</div>
              <div className="form-group">
                <label className="label">Category Name</label>
                <input className="input" value={newCat} onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCat()} placeholder="e.g. Client Contracts" autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowAddCat(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddCat}>Add Category</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
