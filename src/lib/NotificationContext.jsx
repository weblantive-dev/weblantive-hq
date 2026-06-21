import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [reminders, setReminders] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const addReminder = useCallback((reminder) => {
    setReminders(prev => [...prev, { ...reminder, id: Date.now(), read: false }])
  }, [])

  const dismissReminder = useCallback((id) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }, [])

  const unreadCount = reminders.filter(r => !r.read).length

  const icons = { success: CheckCircle, error: AlertCircle, info: Info, reminder: Bell }
  const colors = {
    success: '#4ADE80',
    error: '#F87171',
    info: '#38BDF8',
    reminder: '#F472B6'
  }

  return (
    <NotificationContext.Provider value={{ toast, addReminder, dismissReminder, reminders, unreadCount }}>
      {children}
      <div style={{ position: 'fixed', bottom: 100, right: 32, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type] || Info
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${colors[t.type]}44`,
                  borderLeft: `3px solid ${colors[t.type]}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minWidth: 280,
                  boxShadow: 'var(--shadow)',
                  fontSize: 14,
                  color: 'var(--text-primary)'
                }}
              >
                <Icon size={16} color={colors[t.type]} />
                {t.message}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
