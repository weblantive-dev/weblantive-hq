import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import { ThemeProvider } from './lib/ThemeContext'
import { NotificationProvider } from './lib/NotificationContext'
import Sidebar from './components/layout/Sidebar'
import Login from './components/layout/Login'
import QuickAdd from './components/layout/QuickAdd'
import NotificationPanel from './components/layout/NotificationPanel'
import Dashboard from './components/dashboard/Dashboard'
import CRM from './components/crm/CRM'
import Clients from './components/clients/Clients'
import CalendarPage from './components/calendar/Calendar'
import Tasks from './components/tasks/Tasks'
import Finance from './components/finance/Finance'
import Vault from './components/vault/Vault'
import SOPs from './components/sops/SOPs'
import Settings from './components/settings/Settings'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
}

function AppLayout({ children }) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar onNotificationClick={() => setNotifOpen(o => !o)} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <QuickAdd />
    </div>
  )
}

function AuthGuard({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <AuthGuard>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/vault" element={<Vault />} />
                    <Route path="/sops" element={<SOPs />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  )
}
