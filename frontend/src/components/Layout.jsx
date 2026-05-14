import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import {
  Shield, LayoutDashboard, Bell, ScrollText, Gamepad2,
  Sword, BookOpen, Activity, LogOut, Menu, X, ChevronRight, User
} from 'lucide-react'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { to: '/alerts',    icon: Bell,            label: 'Alerts' },
  { to: '/logs',      icon: ScrollText,      label: 'Activity Logs' },
  { to: '/accounts',  icon: Gamepad2,        label: 'Gaming Accounts' },
  { to: '/risk',      icon: Activity,        label: 'Risk Score' },
  { to: '/threats',   icon: Sword,           label: 'Threat Simulator' },
  { to: '/education', icon: BookOpen,        label: 'Security Guide' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Desktop: collapsed = icon-only. Mobile: open = overlay visible.
  const [collapsed, setCollapsed]         = useState(false)
  const [mobileOpen, setMobileOpen]       = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out securely')
    navigate('/login')
  }

  const closeMobile = () => setMobileOpen(false)

  const sidebarContent = (showLabels) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-purple-900/20 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
          <Shield size={18} color="white" />
        </div>
        {showLabels && (
          <div>
            <div className="font-display text-white text-sm tracking-widest font-bold">GAMEGUARD</div>
            <div className="font-mono-gg text-purple-400 text-xs">PROTECTION ACTIVE</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
                   onClick={closeMobile}
                   className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                   title={!showLabels ? label : undefined}>
            <Icon size={16} className="flex-shrink-0" />
            {showLabels && <span>{label}</span>}
            {showLabels && <ChevronRight size={12} className="ml-auto opacity-40" />}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-purple-900/20 p-3 flex-shrink-0">
        <div className={`flex items-center gap-3 ${!showLabels ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
            <User size={14} color="white" />
          </div>
          {showLabels && (
            <div className="flex-1 min-w-0">
              <div className="font-display text-white text-xs truncate">{user?.username}</div>
              <div className="font-mono-gg text-purple-400 text-xs truncate">{user?.email}</div>
            </div>
          )}
          {showLabels && (
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={closeMobile} />
      )}

      {/* Mobile sidebar — fixed overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 transition-transform duration-300
        lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'linear-gradient(180deg, rgba(10,10,26,0.98) 0%, rgba(8,8,18,0.99) 100%)', borderRight: '1px solid rgba(124,58,237,0.15)' }}>
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar — always visible, collapsible */}
      <aside className={`
        hidden lg:flex flex-col flex-shrink-0 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `} style={{ background: 'linear-gradient(180deg, rgba(10,10,26,0.9) 0%, rgba(8,8,18,0.95) 100%)', borderRight: '1px solid rgba(124,58,237,0.15)' }}>
        {sidebarContent(!collapsed)}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-purple-900/20 flex-shrink-0"
                style={{ background: 'rgba(8,8,18,0.7)', backdropFilter: 'blur(10px)' }}>
          {/* Mobile: hamburger. Desktop: collapse toggle */}
          <button
            onClick={() => { if (window.innerWidth >= 1024) setCollapsed(c => !c); else setMobileOpen(o => !o) }}
            className="text-gray-500 hover:text-purple-400 transition-colors">
            {(mobileOpen || !collapsed) ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono-gg text-green-400 text-xs">SECURE CONNECTION</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
