import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck, Calendar, CheckSquare,
  DollarSign, FolderOpen, FileText, Settings, LogOut, Bell, Zap
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../lib/NotificationContext'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/crm', icon: Users, label: 'CRM & Prospects' },
  { to: '/clients', icon: UserCheck, label: 'Clients' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/vault', icon: FolderOpen, label: 'Document Vault' },
  { to: '/sops', icon: FileText, label: 'SOPs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ onNotificationClick }) {
  const navigate = useNavigate()
  const { unreadCount } = useNotification()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color="#0D0F14" fill="#0D0F14" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Weblantive</div>
            <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '1px' }}>HQ</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--color-primary-20)' : 'transparent',
              marginBottom: 2,
              transition: 'var(--transition)'
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onNotificationClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 12px',
            background: 'transparent', border: 'none',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)',
            marginBottom: 2, position: 'relative', transition: 'var(--transition)'
          }}
        >
          <Bell size={16} />
          Notifications
          {unreadCount > 0 && (
            <span style={{
              marginLeft: 'auto', background: 'var(--color-accent)',
              color: '#0D0F14', borderRadius: 999, fontSize: 10,
              fontWeight: 800, padding: '2px 7px', minWidth: 20, textAlign: 'center'
            }}>{unreadCount}</span>
          )}
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', marginTop: 4
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Mulanda</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CEO · Weblantive</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            transition: 'var(--transition)'
          }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
