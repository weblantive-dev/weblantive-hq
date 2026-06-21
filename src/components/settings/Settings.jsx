import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Palette, Briefcase, DollarSign, Bell, LogOut, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTheme, PRESET_THEMES } from '../../lib/ThemeContext'
import { useNotification } from '../../lib/NotificationContext'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } }

export default function Settings() {
  const { darkMode, setDarkMode, primaryColor, setPrimaryColor, accentColor, setAccentColor, activeTheme, applyTheme } = useTheme()
  const { toast } = useNotification()
  const [settings, setSettings] = useState({
    display_name: 'Mulanda',
    business_name: 'Weblantive',
    revenue_goal_zar: 0,
    revenue_goal_usd: 0,
    pricing_starter_usd: 350,
    pricing_standard_usd: 500,
    pricing_premium_usd: 700,
    payment_deposit: 40,
    payment_balance: 60
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').limit(1).single()
    if (data) setSettings(prev => ({ ...prev, ...data }))
  }

  const handleSave = async () => {
    const { data: existing } = await supabase.from('settings').select('id').limit(1).single()
    if (existing) {
      await supabase.from('settings').update(settings).eq('id', existing.id)
    } else {
      await supabase.from('settings').insert(settings)
    }
    toast('Settings saved!', 'success')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const Section = ({ icon: Icon, title, children }) => (
    <motion.div variants={item} className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color="var(--color-primary)" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
      </div>
      {children}
    </motion.div>
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Customize Weblantive HQ to your liking</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ minWidth: 120 }}>
          <Save size={15} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance">
        {/* Dark/Light Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Dark Mode</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toggle between dark and light theme</div>
          </div>
          <div
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: 52, height: 28, borderRadius: 999, position: 'relative', cursor: 'pointer',
              background: darkMode ? 'var(--color-primary)' : 'var(--border)', transition: 'var(--transition)'
            }}
          >
            <motion.div
              animate={{ x: darkMode ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                position: 'absolute', top: 3, width: 22, height: 22,
                borderRadius: '50%', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {darkMode ? <Moon size={11} color="var(--color-primary)" /> : <Sun size={11} color="#FBBF24" />}
            </motion.div>
          </div>
        </div>

        {/* Preset Themes */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Preset Themes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(PRESET_THEMES).map(([name, colors]) => (
              <button
                key={name}
                onClick={() => applyTheme(name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  borderRadius: 999, border: `1px solid ${activeTheme === name ? colors.primary : 'var(--border)'}`,
                  background: activeTheme === name ? `${colors.primary}22` : 'transparent',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: activeTheme === name ? colors.primary : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', gap: 3 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.primary }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.accent }} />
                </div>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Primary Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: 44, height: 40, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent', padding: 2 }} />
              <input className="input" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Accent Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                style={{ width: 44, height: 40, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent', padding: 2 }} />
              <input className="input" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} />
            </div>
          </div>
        </div>
      </Section>

      {/* Profile */}
      <Section icon={Briefcase} title="Profile & Business">
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Display Name</label>
            <input className="input" value={settings.display_name || ''} onChange={e => setSettings({ ...settings, display_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">Business Name</label>
            <input className="input" value={settings.business_name || ''} onChange={e => setSettings({ ...settings, business_name: e.target.value })} />
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section icon={DollarSign} title="Default Pricing Tiers (USD)">
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {[
            { label: 'Starter Package', key: 'pricing_starter_usd', desc: '3-page site' },
            { label: 'Standard Package', key: 'pricing_standard_usd', desc: '5-page site' },
            { label: 'Premium Package', key: 'pricing_premium_usd', desc: '5 pages + SEO' },
          ].map(p => (
            <div key={p.key} className="form-group">
              <label className="label">{p.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>$</span>
                <input className="input" type="number" style={{ paddingLeft: 24 }} value={settings[p.key] || ''}
                  onChange={e => setSettings({ ...settings, [p.key]: e.target.value })} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Deposit % (upfront)</label>
            <input className="input" type="number" value={settings.payment_deposit || 40}
              onChange={e => setSettings({ ...settings, payment_deposit: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">Balance % (on delivery)</label>
            <input className="input" type="number" value={settings.payment_balance || 60}
              onChange={e => setSettings({ ...settings, payment_balance: e.target.value })} />
          </div>
        </div>
      </Section>

      {/* Revenue Goals */}
      <Section icon={DollarSign} title="Monthly Revenue Goals">
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Goal (ZAR)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>R</span>
              <input className="input" type="number" style={{ paddingLeft: 24 }} value={settings.revenue_goal_zar || ''}
                onChange={e => setSettings({ ...settings, revenue_goal_zar: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Goal (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>$</span>
              <input className="input" type="number" style={{ paddingLeft: 24 }} value={settings.revenue_goal_usd || ''}
                onChange={e => setSettings({ ...settings, revenue_goal_usd: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </div>
      </Section>

      {/* Danger Zone */}
      <motion.div variants={item} style={{ marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ color: '#F87171', borderColor: '#F8717133' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </motion.div>
    </motion.div>
  )
}
