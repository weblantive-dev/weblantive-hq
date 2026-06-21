import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, CheckSquare, Users, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

export default function QuickAdd() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState(null) // 'task' | 'prospect' | 'event'
  const [form, setForm] = useState({})
  const { toast } = useNotification()

  const actions = [
    { key: 'task', icon: CheckSquare, label: 'Add Task', color: '#38BDF8' },
    { key: 'prospect', icon: Users, label: 'Add Prospect', color: '#F472B6' },
    { key: 'event', icon: Calendar, label: 'Add Event', color: '#A78BFA' },
  ]

  const handleSave = async () => {
    try {
      if (mode === 'task') {
        if (!form.title) return toast('Task title is required', 'error')
        const { error } = await supabase.from('tasks').insert({
          title: form.title,
          due_date: form.due_date || null,
          priority: form.priority || 'Medium',
          category: form.category || 'Admin',
          completed: false
        })
        if (error) throw error
        if (form.due_date) {
          await supabase.from('calendar_events').insert({
            title: form.title,
            date: form.due_date,
            type: 'task',
            color: '#38BDF8'
          })
        }
        toast('Task added!', 'success')
      } else if (mode === 'prospect') {
        if (!form.business_name) return toast('Business name is required', 'error')
        const { error } = await supabase.from('prospects').insert({
          business_name: form.business_name,
          contact_name: form.contact_name || '',
          phone: form.phone || '',
          stage: 'Lead',
          country: form.country || 'US'
        })
        if (error) throw error
        toast('Prospect added!', 'success')
      } else if (mode === 'event') {
        if (!form.title || !form.date) return toast('Title and date are required', 'error')
        const { error } = await supabase.from('calendar_events').insert({
          title: form.title,
          date: form.date,
          time: form.time || null,
          type: 'manual',
          color: '#A78BFA'
        })
        if (error) throw error
        toast('Event added!', 'success')
      }
      setForm({})
      setMode(null)
      setOpen(false)
    } catch (err) {
      toast('Something went wrong', 'error')
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setOpen(false); setMode(null); setForm({}) }}
            style={{ position: 'fixed', inset: 0, zIndex: 799 }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 800, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        <AnimatePresence>
          {open && !mode && actions.map((action, i) => (
            <motion.button
              key={action.key}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setMode(action.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', background: 'var(--bg-surface)',
                border: '1px solid var(--border)', borderRadius: 999,
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: 'var(--text-primary)', boxShadow: 'var(--shadow)',
                whiteSpace: 'nowrap'
              }}
            >
              <action.icon size={14} color={action.color} />
              {action.label}
            </motion.button>
          ))}

          {open && mode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 20, width: 300,
                boxShadow: 'var(--shadow)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
                {mode === 'task' ? 'Quick Task' : mode === 'prospect' ? 'Quick Prospect' : 'Quick Event'}
              </div>

              {mode === 'task' && (
                <>
                  <input className="input" placeholder="Task title *" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 8 }} />
                  <input className="input" type="date" value={form.due_date || ''} onChange={e => setForm({ ...form, due_date: e.target.value })} style={{ marginBottom: 8 }} />
                  <select className="input" value={form.priority || 'Medium'} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ marginBottom: 8 }}>
                    {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </>
              )}

              {mode === 'prospect' && (
                <>
                  <input className="input" placeholder="Business name *" value={form.business_name || ''} onChange={e => setForm({ ...form, business_name: e.target.value })} style={{ marginBottom: 8 }} />
                  <input className="input" placeholder="Contact name" value={form.contact_name || ''} onChange={e => setForm({ ...form, contact_name: e.target.value })} style={{ marginBottom: 8 }} />
                  <input className="input" placeholder="Phone number" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ marginBottom: 8 }} />
                </>
              )}

              {mode === 'event' && (
                <>
                  <input className="input" placeholder="Event title *" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 8 }} />
                  <input className="input" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} style={{ marginBottom: 8 }} />
                  <input className="input" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} style={{ marginBottom: 8 }} />
                </>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setMode(null); setForm({}) }}>Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="fab"
          onClick={() => { setOpen(!open); setMode(null); setForm({}) }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: open ? 45 : 0 }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  )
}
