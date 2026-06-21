import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

const EVENT_COLORS = {
  task: '#38BDF8',
  follow_up: '#FBBF24',
  client: '#4ADE80',
  manual: '#A78BFA',
  deadline: '#F87171'
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({})
  const [view, setView] = useState('month')
  const { toast } = useNotification()

  useEffect(() => { fetchEvents() }, [currentDate])

  const fetchEvents = async () => {
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')
    const { data } = await supabase.from('calendar_events')
      .select('*').gte('date', start).lte('date', end)
    setEvents(data || [])
  }

  const handleAdd = async () => {
    if (!form.title || !form.date) return toast('Title and date are required', 'error')
    const { error } = await supabase.from('calendar_events').insert({
      title: form.title,
      date: form.date,
      time: form.time || null,
      type: form.type || 'manual',
      color: EVENT_COLORS[form.type || 'manual']
    })
    if (error) return toast('Error adding event', 'error')
    if (form.create_task) {
      await supabase.from('tasks').insert({
        title: form.title, due_date: form.date,
        priority: 'Medium', category: 'Admin', completed: false
      })
    }
    toast('Event added!', 'success')
    setForm({})
    setShowAdd(false)
    fetchEvents()
  }

  const handleDelete = async (id) => {
    await supabase.from('calendar_events').delete().eq('id', id)
    toast('Event removed', 'info')
    setEvents(prev => prev.filter(e => e.id !== id))
    setSelectedDay(prev => prev)
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const eventsOnDay = (day) => events.filter(e => e.date === format(day, 'yyyy-MM-dd'))

  const selectedDayEvents = selectedDay ? eventsOnDay(selectedDay) : []

  return (
    <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="page-title">{format(currentDate, 'MMMM yyyy')}</div>
            <div className="page-subtitle">Calendar</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
            <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight size={16} />
            </button>
            <button className="btn btn-primary" onClick={() => {
              setForm({ date: selectedDay ? format(selectedDay, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd') })
              setShowAdd(true)
            }}>
              <Plus size={16} /> Add Event
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map(day => {
            const dayEvents = eventsOnDay(day)
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const todayDay = isToday(day)
            return (
              <motion.div
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.02 }}
                style={{
                  minHeight: 80, padding: '8px', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--color-primary-20)' : todayDay ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  opacity: isCurrentMonth ? 1 : 0.4,
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  fontSize: 13, fontWeight: todayDay ? 800 : 500,
                  color: todayDay ? 'var(--color-primary)' : 'var(--text-primary)',
                  marginBottom: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  {format(day, 'd')}
                  {todayDay && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 5px',
                      borderRadius: 4, background: `${event.color || '#38BDF8'}22`,
                      color: event.color || '#38BDF8',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Side Panel - Selected Day */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              width: 300, background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 20, height: 'fit-content',
              position: 'sticky', top: 0, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{format(selectedDay, 'EEEE')}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{format(selectedDay, 'MMMM d, yyyy')}</div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '6px 10px' }}
                onClick={() => {
                  setForm({ date: format(selectedDay, 'yyyy-MM-dd') })
                  setShowAdd(true)
                }}>
                <Plus size={14} />
              </button>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Nothing scheduled.<br />Click + to add an event.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedDayEvents.map(event => (
                  <div key={event.id} style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderLeft: `3px solid ${event.color || '#38BDF8'}`,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{event.title}</div>
                      {event.time && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{event.time}</div>}
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: event.color || '#38BDF8',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4
                      }}>{event.type?.replace('_', ' ')}</div>
                    </div>
                    <button onClick={() => handleDelete(event.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 2
                    }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add Calendar Event</div>
              <div className="form-group">
                <label className="label">Title *</label>
                <input className="input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Date *</label>
                  <input className="input" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Time</label>
                  <input className="input" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Type</label>
                <select className="input" value={form.type || 'manual'} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="manual">General</option>
                  <option value="task">Task</option>
                  <option value="follow_up">Follow-up Call</option>
                  <option value="client">Client Deadline</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <input type="checkbox" id="create_task" checked={!!form.create_task}
                  onChange={e => setForm({ ...form, create_task: e.target.checked })}
                  style={{ width: 16, height: 16 }} />
                <label htmlFor="create_task" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Also create a task for this
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Add Event</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
