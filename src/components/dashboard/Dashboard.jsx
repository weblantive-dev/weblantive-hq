import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, startOfMonth, endOfMonth } from 'date-fns'
import { CheckSquare, DollarSign, AlertCircle, Smile, Quote } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getDailyContent } from '../../lib/content'
import { useNotification } from '../../lib/NotificationContext'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [todayEvents, setTodayEvents] = useState([])
  const [outstanding, setOutstanding] = useState([])
  const [income, setIncome] = useState([])
  const [expenses, setExpenses] = useState([])
  const [settings, setSettings] = useState(null)
  const { toast } = useNotification()
  const { greeting, joke, quote } = getDailyContent()
  const today = new Date()

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const todayStr = format(today, 'yyyy-MM-dd')
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')

    const [t, e, c, i, exp, s] = await Promise.all([
      supabase.from('tasks').select('*').eq('completed', false).order('due_date'),
      supabase.from('calendar_events').select('*').eq('date', todayStr),
      supabase.from('clients').select('id,business_name,balance_usd,balance_zar').gt('balance_usd', 0),
      supabase.from('income').select('amount_zar,amount_usd').gte('date', monthStart).lte('date', monthEnd),
      supabase.from('expenses').select('amount_zar,amount_usd').gte('date', monthStart).lte('date', monthEnd),
      supabase.from('settings').select('*').limit(1).single()
    ])

    setTasks(t.data || [])
    setTodayEvents(e.data || [])
    setOutstanding(c.data || [])
    setIncome(i.data || [])
    setExpenses(exp.data || [])
    setSettings(s.data)
  }

  const toggleTask = async (id, completed) => {
    await supabase.from('tasks').update({ completed: !completed }).eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    toast('Task completed! 🎉', 'success')
  }

  const todayTasks = tasks.filter(t => t.due_date === format(today, 'yyyy-MM-dd'))
  const totalIncomeZar = income.reduce((s, i) => s + (i.amount_zar || 0), 0)
  const totalIncomeUsd = income.reduce((s, i) => s + (i.amount_usd || 0), 0)
  const totalExpZar = expenses.reduce((s, e) => s + (e.amount_zar || 0), 0)
  const goalZar = settings?.revenue_goal_zar || 0
  const goalUsd = settings?.revenue_goal_usd || 0
  const progressZar = goalZar > 0 ? Math.min((totalIncomeZar / goalZar) * 100, 100) : 0
  const progressUsd = goalUsd > 0 ? Math.min((totalIncomeUsd / goalUsd) * 100, 100) : 0

  const priorityColor = { Low: '#4ADE80', Medium: '#FBBF24', High: '#FB923C', Urgent: '#F87171' }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          {format(today, 'EEEE, MMMM d, yyyy')}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Dashboard</div>
      </motion.div>

      {/* PA Widget */}
      <motion.div variants={item} style={{
        background: 'linear-gradient(135deg, var(--color-primary-20), var(--bg-surface))',
        border: '1px solid var(--color-primary)',
        borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 120, height: 120,
          background: 'var(--color-primary)', borderRadius: '50%', opacity: 0.06
        }} />
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
          {greeting}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          You have <strong style={{ color: 'var(--color-primary)' }}>{todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}</strong> due today
          {todayEvents.length > 0 && <> and <strong style={{ color: 'var(--color-accent)' }}>{todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''}</strong> on the calendar.</>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
            padding: '14px 16px', border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Smile size={14} color="var(--color-accent)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Daily Joke</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{joke}</div>
          </div>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
            padding: '14px 16px', border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Quote size={14} color="var(--color-primary)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Motivation</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>{quote}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Revenue Goal */}
        <motion.div variants={item} className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">Monthly Revenue Goal</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>RANDS (ZAR)</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>R{totalIncomeZar.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>of R{goalZar.toLocaleString()} goal</div>
              <div className="progress-bar-track" style={{ marginTop: 8 }}>
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressZar}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, marginTop: 4 }}>{Math.round(progressZar)}%</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>DOLLARS (USD)</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>${totalIncomeUsd.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>of ${goalUsd.toLocaleString()} goal</div>
              <div className="progress-bar-track" style={{ marginTop: 8 }}>
                <motion.div
                  className="progress-bar-fill"
                  style={{ background: 'var(--color-accent)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressUsd}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700, marginTop: 4 }}>{Math.round(progressUsd)}%</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stat */}
        <motion.div variants={item} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card-title">Net Profit (Month)</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: totalIncomeZar - totalExpZar >= 0 ? '#4ADE80' : '#F87171' }}>
            R{(totalIncomeZar - totalExpZar).toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            ${(totalIncomeUsd - expenses.reduce((s, e) => s + (e.amount_usd || 0), 0)).toLocaleString()} USD
          </div>
        </motion.div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Today's Tasks */}
        <motion.div variants={item} className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={14} /> Today's Tasks
            <span style={{
              marginLeft: 'auto', background: 'var(--color-primary-20)',
              color: 'var(--color-primary)', borderRadius: 999, fontSize: 11,
              fontWeight: 700, padding: '2px 8px'
            }}>{todayTasks.length}</span>
          </div>
          {todayTasks.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              No tasks due today. You're clear! 🎉
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayTasks.slice(0, 6).map(task => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
                }}>
                  <div
                    onClick={() => toggleTask(task.id, task.completed)}
                    style={{
                      width: 18, height: 18, borderRadius: 5,
                      border: `2px solid ${priorityColor[task.priority] || 'var(--border)'}`,
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.category}</div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: `${priorityColor[task.priority]}22`,
                    color: priorityColor[task.priority]
                  }}>{task.priority}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Outstanding Payments */}
        <motion.div variants={item} className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} color="#FBBF24" /> Outstanding Payments
            {outstanding.length > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#FBBF2420',
                color: '#FBBF24', borderRadius: 999, fontSize: 11,
                fontWeight: 700, padding: '2px 8px'
              }}>{outstanding.length}</span>
            )}
          </div>
          {outstanding.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              All clients are paid up 💰
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {outstanding.map(client => (
                <div key={client.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{client.business_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Balance outstanding</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>${client.balance_usd}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>R{client.balance_zar}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
