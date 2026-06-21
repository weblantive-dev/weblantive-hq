import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'
import { useNotification } from '../../lib/NotificationContext'

export default function NotificationPanel({ open, onClose }) {
  const { reminders, dismissReminder, unreadCount } = useNotification()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 850 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              position: 'fixed', top: 60, left: 'calc(var(--sidebar-width) + 20px)',
              width: 340, background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)', zIndex: 900, overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={15} color="var(--color-primary)" />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{
                    background: 'var(--color-accent)', color: '#0D0F14',
                    borderRadius: 999, fontSize: 10, fontWeight: 800,
                    padding: '1px 7px'
                  }}>{unreadCount}</span>
                )}
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {reminders.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <Check size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                  You're all caught up!
                </div>
              ) : (
                reminders.map(r => (
                  <div key={r.id} style={{
                    padding: '14px 20px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'flex-start', gap: 12
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: r.read ? 'var(--border)' : 'var(--color-accent)',
                      marginTop: 5, flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.title}</div>
                      {r.message && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.message}</div>}
                    </div>
                    <button onClick={() => dismissReminder(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                      <X size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
