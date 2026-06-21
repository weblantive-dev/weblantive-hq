import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Trash2, Filter } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

const EXPENSE_CATS = ['Hosting', 'Tools', 'Software', 'Marketing', 'Other']
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } }

export default function Finance() {
  const [income, setIncome] = useState([])
  const [expenses, setExpenses] = useState([])
  const [clients, setClients] = useState([])
  const [settings, setSettings] = useState(null)
  const [showAdd, setShowAdd] = useState(null) // 'income' | 'expense'
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({})
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useNotification()

  useEffect(() => { fetchAll() }, [filterMonth])

  const fetchAll = async () => {
    const start = `${filterMonth}-01`
    const end = format(endOfMonth(new Date(`${filterMonth}-01`)), 'yyyy-MM-dd')
    const [inc, exp, cl, s] = await Promise.all([
      supabase.from('income').select('*').gte('date', start).lte('date', end).order('date', { ascending: false }),
      supabase.from('expenses').select('*').gte('date', start).lte('date', end).order('date', { ascending: false }),
      supabase.from('clients').select('id,business_name,balance_usd,balance_zar,total_price_usd,deposit_paid_usd').gt('balance_usd', 0),
      supabase.from('settings').select('*').limit(1).single()
    ])
    setIncome(inc.data || [])
    setExpenses(exp.data || [])
    setClients(cl.data || [])
    setSettings(s.data)
  }

  const handleAddIncome = async () => {
    if (!form.client_name || !form.amount_zar) return toast('Client name and ZAR amount are required', 'error')
    const { error } = await supabase.from('income').insert({
      client_name: form.client_name,
      amount_zar: parseFloat(form.amount_zar || 0),
      amount_usd: parseFloat(form.amount_usd || 0),
      date: form.date || format(new Date(), 'yyyy-MM-dd'),
      type: form.type || 'Deposit'
    })
    if (error) return toast('Error adding income', 'error')
    toast('Income logged! 💰', 'success')
    setForm({})
    setShowAdd(null)
    fetchAll()
  }

  const handleAddExpense = async () => {
    if (!form.name || !form.amount_zar) return toast('Name and ZAR amount are required', 'error')
    const { error } = await supabase.from('expenses').insert({
      name: form.name,
      category: form.category || 'Other',
      amount_zar: parseFloat(form.amount_zar || 0),
      amount_usd: parseFloat(form.amount_usd || 0),
      date: form.date || format(new Date(), 'yyyy-MM-dd')
    })
    if (error) return toast('Error adding expense', 'error')
    toast('Expense logged', 'info')
    setForm({})
    setShowAdd(null)
    fetchAll()
  }

  const handleDelete = async (type, id) => {
    await supabase.from(type).delete().eq('id', id)
    toast('Deleted', 'info')
    setShowDelete(null)
    fetchAll()
  }

  const totalIncZar = income.reduce((s, i) => s + (i.amount_zar || 0), 0)
  const totalIncUsd = income.reduce((s, i) => s + (i.amount_usd || 0), 0)
  const totalExpZar = expenses.reduce((s, e) => s + (e.amount_zar || 0), 0)
  const totalExpUsd = expenses.reduce((s, e) => s + (e.amount_usd || 0), 0)
  const profitZar = totalIncZar - totalExpZar
  const profitUsd = totalIncUsd - totalExpUsd
  const goalZar = settings?.revenue_goal_zar || 0
  const goalUsd = settings?.revenue_goal_usd || 0
  const progressZar = goalZar > 0 ? Math.min((totalIncZar / goalZar) * 100, 100) : 0
  const progressUsd = goalUsd > 0 ? Math.min((totalIncUsd / goalUsd) * 100, 100) : 0

  const StatCard = ({ label, zar, usd, color, icon: Icon }) => (
    <motion.div variants={item} className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{zar < 0 ? '-' : ''}R{Math.abs(zar).toLocaleString()}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>${Math.abs(usd).toLocaleString()} USD</div>
    </motion.div>
  )

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Finance Tracker</div>
          <div className="page-subtitle">Track revenue, expenses and profit</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="month" className="input" style={{ width: 160 }} value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)} />
          <button className="btn btn-primary" onClick={() => { setForm({ type: 'Deposit', date: format(new Date(), 'yyyy-MM-dd') }); setShowAdd('income') }}>
            <Plus size={16} /> Income
          </button>
          <button className="btn btn-ghost" onClick={() => { setForm({ category: 'Other', date: format(new Date(), 'yyyy-MM-dd') }); setShowAdd('expense') }}>
            <Plus size={16} /> Expense
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {['overview', 'transactions', 'outstanding'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '10px 18px', background: 'transparent', border: 'none',
            borderBottom: `2px solid ${activeTab === t ? 'var(--color-primary)' : 'transparent'}`,
            color: activeTab === t ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            transition: 'var(--transition)', marginBottom: -1
          }}>{t}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div variants={container} initial="hidden" animate="show">
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <StatCard label="Revenue" zar={totalIncZar} usd={totalIncUsd} color="#4ADE80" icon={TrendingUp} />
            <StatCard label="Expenses" zar={totalExpZar} usd={totalExpUsd} color="#F87171" icon={TrendingDown} />
            <StatCard label="Net Profit" zar={profitZar} usd={profitUsd} color={profitZar >= 0 ? '#38BDF8' : '#F87171'} icon={DollarSign} />
          </div>

          {/* Revenue Goals */}
          <motion.div variants={item} className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>
                <Target size={14} style={{ display: 'inline', marginRight: 6 }} />Monthly Revenue Goals
              </div>
            </div>
            <div className="grid-2">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>ZAR Goal</span>
                  <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700 }}>R{totalIncZar.toLocaleString()} / R{goalZar.toLocaleString()}</span>
                </div>
                <div className="progress-bar-track">
                  <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${progressZar}%` }} transition={{ duration: 1, delay: 0.2 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, marginTop: 4 }}>{Math.round(progressZar)}% of goal</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>USD Goal</span>
                  <span style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 700 }}>${totalIncUsd.toLocaleString()} / ${goalUsd.toLocaleString()}</span>
                </div>
                <div className="progress-bar-track">
                  <motion.div className="progress-bar-fill" style={{ background: 'var(--color-accent)' }} initial={{ width: 0 }} animate={{ width: `${progressUsd}%` }} transition={{ duration: 1, delay: 0.4 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700, marginTop: 4 }}>{Math.round(progressUsd)}% of goal</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeTab === 'transactions' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Income</div>
            {income.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>No income logged this month.</div>
            ) : income.map(inc => (
              <div key={inc.id} style={{
                display: 'flex', alignItems: 'center', padding: '12px 16px',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderLeft: '3px solid #4ADE80', borderRadius: 'var(--radius-sm)', marginBottom: 6
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{inc.client_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inc.type} · {inc.date}</div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#4ADE80' }}>R{(inc.amount_zar || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>${(inc.amount_usd || 0).toLocaleString()}</div>
                </div>
                <button onClick={() => setShowDelete({ type: 'income', id: inc.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F87171', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Expenses</div>
            {expenses.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>No expenses logged this month.</div>
            ) : expenses.map(exp => (
              <div key={exp.id} style={{
                display: 'flex', alignItems: 'center', padding: '12px 16px',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderLeft: '3px solid #F87171', borderRadius: 'var(--radius-sm)', marginBottom: 6
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{exp.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.category} · {exp.date}</div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F87171' }}>R{(exp.amount_zar || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>${(exp.amount_usd || 0).toLocaleString()}</div>
                </div>
                <button onClick={() => setShowDelete({ type: 'expenses', id: exp.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'outstanding' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Clients who still owe the remaining balance.
          </div>
          {clients.length === 0 ? (
            <div className="empty-state">
              <DollarSign size={36} />
              <h3>All paid up!</h3>
              <p>No outstanding balances from clients.</p>
            </div>
          ) : clients.map(client => (
            <div key={client.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderLeft: '3px solid #FBBF24', borderRadius: 'var(--radius-sm)', marginBottom: 8
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{client.business_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deposit paid: ${client.deposit_paid_usd}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FBBF24' }}>${client.balance_usd} owed</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>of ${client.total_price_usd} total</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Income Modal */}
      <AnimatePresence>
        {showAdd === 'income' && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(null)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">Log Income</div>
              {[
                { label: 'Client Name *', key: 'client_name' },
                { label: 'Amount (ZAR) *', key: 'amount_zar', type: 'number' },
                { label: 'Amount (USD)', key: 'amount_usd', type: 'number' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="label">{f.label}</label>
                  <input className="input" type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Type</label>
                  <select className="input" value={form.type || 'Deposit'} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option>Deposit</option>
                    <option>Final Payment</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Date</label>
                  <input className="input" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddIncome}>Log Income</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAdd === 'expense' && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(null)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">Log Expense</div>
              <div className="form-group">
                <label className="label">Expense Name *</label>
                <input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hostinger Agency Plan" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Amount (ZAR) *</label>
                  <input className="input" type="number" value={form.amount_zar || ''} onChange={e => setForm({ ...form, amount_zar: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Amount (USD)</label>
                  <input className="input" type="number" value={form.amount_usd || ''} onChange={e => setForm({ ...form, amount_usd: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Category</label>
                  <select className="input" value={form.category || 'Other'} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Date</label>
                  <input className="input" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddExpense}>Log Expense</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDelete && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 360 }}>
              <div className="modal-title" style={{ color: '#F87171' }}>Delete Entry?</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This will permanently remove this record.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowDelete(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(showDelete.type, showDelete.id)}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
