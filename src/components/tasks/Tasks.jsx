import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2, AlertCircle, Filter } from 'lucide-react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const CATEGORIES = ['Client Work', 'Prospecting', 'Admin', 'Personal', 'Finance', 'Other']
const PRIORITY_COLORS = { Low: '#4ADE80', Medium: '#FBBF24', High: '#FB923C', Urgent: '#F87171' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({ priority: 'Medium', category: 'Admin' })
  const [filterCat, setFilterCat] = useState('All')
  const [filterPri, setFilterPri] = useState('All')
  const [showCompleted, setShowCompleted] = useState(false)
  const { toast } = useNotification()

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('due_date').order('created_at', { ascending: false })
    setTasks(data || [])
  }

  const handleAdd = async () => {
    if (!form.title) return toast('Task title is required', 'error')
    const { error } = await supabase.from('tasks').insert({
      title: form.title,
      description: form.description || '',
      due_date: form.due_date || null,
      due_time: form.due_time || null,
      priority: form.priority || 'Medium',
      category: form.category || 'Admin',
      completed: false
    })
    if (error) return toast('Error adding task', 'error')
    if (form.due_date) {
      await supabase.from('calendar_events').insert({
        title: form.title,
        date: form.due_date,
        time: form.due_time || null,
        type: 'task',
        color: PRIORITY_COLORS[form.priority || 'Medium']
      })
    }
    toast('Task added!', 'success')
    setForm({ priority: 'Medium', category: 'Admin' })
    setShowAdd(false)
    fetchTasks()
  }

  const toggleComplete = async (task) => {
    const { error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    if (error) return
    if (!task.completed) toast('Task done! 💪', 'success')
    fetchTasks()
  }

  const handleDelete = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    toast('Task deleted', 'info')
    setShowDelete(null)
    fetchTasks()
  }

  const filtered = tasks.filter(t => {
    if (t.completed !== showCompleted) return false
    if (filterCat !== 'All' && t.category !== filterCat) return false
    if (filterPri !== 'All' && t.priority !== filterPri) return false
    return true
  })

  const todayTasks = filtered.filter(t => t.due_date && isToday(parseISO(t.due_date)))
  const overdueTasks = filtered.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)))
  const upcomingTasks = filtered.filter(t => !t.due_date || (!isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))))

  const TaskCard = ({ task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px', background: 'var(--bg-surface)',
        border: `1px solid ${task.completed ? 'var(--border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', opacity: task.completed ? 0.6 : 1,
        transition: 'var(--transition)'
      }}
    >
      {/* Checkbox */}
      <motion.div
        onClick={() => toggleComplete(task)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${task.completed ? '#4ADE80' : PRIORITY_COLORS[task.priority] || 'var(--border)'}`,
          background: task.completed ? '#4ADE80' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 1, transition: 'var(--transition)'
        }}
      >
        {task.completed && <Check size={13} color="#0D0F14" strokeWidth={3} />}
      </motion.div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
          textDecoration: task.completed ? 'line-through' : 'none'
        }}>{task.title}</div>
        {task.description && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.description}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            background: `${PRIORITY_COLORS[task.priority]}22`, color: PRIORITY_COLORS[task.priority]
          }}>{task.priority}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
            background: 'var(--bg-elevated)', color: 'var(--text-muted)'
          }}>{task.category}</span>
          {task.due_date && (
            <span style={{
              fontSize: 11, color: isPast(parseISO(task.due_date)) && !task.completed ? '#F87171' : 'var(--text-muted)'
            }}>
              {isToday(parseISO(task.due_date)) ? 'Due today' : format(parseISO(task.due_date), 'MMM d')}
              {task.due_time && ` at ${task.due_time}`}
            </span>
          )}
        </div>
      </div>

      <button onClick={() => setShowDelete(task.id)} style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#F87171',
  padding: 4
}}>
  <Trash2 size={14} />
</button>

  const Section = ({ title, tasks, color }) => tasks.length > 0 ? (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        {color === '#F87171' && <AlertCircle size={12} />} {title} ({tasks.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <AnimatePresence>
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </AnimatePresence>
      </div>
    </div>
  ) : null

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{filtered.filter(t => !t.completed).length} pending tasks</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
          <Filter size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
        </div>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`tag ${filterCat === c ? 'active' : ''}`} style={{ fontSize: 12 }}>{c}</button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        {['All', ...PRIORITIES].map(p => (
          <button key={p} onClick={() => setFilterPri(p)}
            className={`tag ${filterPri === p ? 'active' : ''}`} style={{ fontSize: 12 }}>{p}</button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className={`tag ${showCompleted ? 'active' : ''}`} onClick={() => setShowCompleted(!showCompleted)} style={{ fontSize: 12 }}>
            {showCompleted ? 'Show Active' : 'Show Completed'}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Check size={40} />
          <h3>{showCompleted ? 'No completed tasks' : 'All clear!'}</h3>
          <p>{showCompleted ? 'Complete some tasks to see them here.' : 'No tasks match your filters.'}</p>
        </div>
      ) : (
        <>
          <Section title="Overdue" tasks={overdueTasks} color="#F87171" />
          <Section title="Due Today" tasks={todayTasks} color="var(--color-primary)" />
          <Section title="Upcoming" tasks={upcomingTasks} color="var(--text-secondary)" />
        </>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add Task</div>
              <div className="form-group">
                <label className="label">Task Title *</label>
                <input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Due Date</label>
                  <input className="input" type="date" value={form.due_date || ''} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Due Time</label>
                  <input className="input" type="time" value={form.due_time || ''} onChange={e => setForm({ ...form, due_time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Add Task</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {showDelete && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 360 }}>
              <div className="modal-title" style={{ color: '#F87171' }}>Delete Task?</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This will permanently remove this task.</p>
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
