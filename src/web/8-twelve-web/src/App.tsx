import { useEffect, useState, type FormEvent } from 'react'
import Starter from './Starter'
import { Auth } from './Auth'
import { Analytics } from './Analytics'
import { ProductsPage, UsersPage } from './Management'
import { TransactionTable } from './Transactions'
import { formatDate, initialProducts, initialUsers, money, today, transactions } from './mockData'
import { Brand, Empty, Icon, PageHeading } from './ui'
import './prototype.css'

const navigation = [
  { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: 'analytics', label: 'Sales Analytics', icon: 'analytics' },
  { route: 'transactions', label: 'Transactions', icon: 'transactions' },
  { route: 'products', label: 'Products', icon: 'products' },
  { route: 'inventory', label: 'Inventory', icon: 'inventory' },
  { route: 'users', label: 'User Management', icon: 'users' },
  { route: 'settings', label: 'Settings', icon: 'settings' },
]
const getRoute = () => window.location.hash.slice(1).replace(/^\//, '') || 'dashboard'

function App() {
  const [route, setRoute] = useState(getRoute)
  const [products, setProducts] = useState(initialProducts)
  const [users, setUsers] = useState(initialUsers)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState('')
  const [storeName, setStoreName] = useState('8-Twelve Kiosk')
  const [alerts, setAlerts] = useState(true)

  useEffect(() => {
    const update = () => { setRoute(getRoute()); setMobileOpen(false); setProfileOpen(false); setNotificationsOpen(false) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [toast])
  const navigate = (next: string) => { window.location.hash = `/${next}`; setRoute(next); setMobileOpen(false); setProfileOpen(false); setNotificationsOpen(false); window.scrollTo(0, 0) }
  const notify = (message: string) => setToast(message)
  const completed = transactions.filter(item => item.status === 'Completed')
  const salesToday = completed.filter(item => item.date === today)
  const lowStock = products.filter(product => product.stock < 10)
  const search = (event: FormEvent) => { event.preventDefault(); if (query.trim()) { setSearchTerm(query.trim()); navigate('search') } }
  const title = navigation.find(item => item.route === route)?.label ?? (route === 'search' ? 'Search results' : 'Dashboard')

  if (route === 'starter') return <Starter />
  if (route === 'login' || route === 'register') return <><Auth key={route} register={route === 'register'} navigate={navigate} notify={notify} />{toast && <div className="toast" role="status">{toast}</div>}</>

  return <div className={`prototype admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand"><Brand /><button className="collapse-button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)}><Icon name="arrow" size={17} /></button></div>
      <div className="sidebar-label">MAIN MENU</div>
      <nav aria-label="Admin navigation">{navigation.map((item, index) => <div key={item.route}>{index === 6 && <div className="sidebar-label secondary-label">PREFERENCES</div>}<button title={item.label} className={`nav-item ${route === item.route ? 'active' : ''}`} aria-current={route === item.route ? 'page' : undefined} onClick={() => navigate(item.route)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{route === item.route && <span className="nav-indicator" />}</button></div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><span>✦</span><strong>Here for the everyday.</strong><p>A little more insight for your business.</p><button onClick={() => navigate('analytics')}>Explore analytics →</button></div><button className="nav-item logout" onClick={() => { notify('Signed out of the demo view.'); navigate('login') }}><Icon name="logout" size={19} /><span>Log out</span></button></div>
    </aside>
    <div className="admin-main">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><div className="breadcrumb"><span>Pages</span><span>/</span><strong>{title}</strong></div></div><div className="topbar-actions"><form className="top-search" onSubmit={search}><Icon name="search" size={18} /><label className="sr-only" htmlFor="global-search">Search all demo data</label><input id="global-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search anything..." /><kbd>↵</kbd></form><div className="popover-wrap"><button className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false) }}><Icon name="bell" /><span /></button>{notificationsOpen && <div className="popover notification-popover"><strong>Notifications</strong><p>{alerts ? `${lowStock.length} products are running low on stock.` : 'Stock alerts are turned off.'}</p><button onClick={() => navigate('inventory')}>View inventory →</button></div>}</div><div className="top-divider" /><div className="popover-wrap"><button className="profile-button" aria-expanded={profileOpen} onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false) }}><span className="avatar admin-avatar">AD</span><span className="profile-text"><strong>Admin User</strong><small>Store administrator</small></span><span className="chevron">⌄</span></button>{profileOpen && <div className="popover profile-popover"><strong>Admin User</strong><small>Demo administrator</small><button onClick={() => navigate('settings')}>Profile & settings</button><button onClick={() => navigate('login')}>Log out</button></div>}</div></div></header>
      <main className="content">
        {route === 'dashboard' && <><PageHeading eyebrow="YOUR STORE AT A GLANCE" title="Good to see you, Admin 👋" description="Here’s what’s happening at your kiosk today." action={<div className="today-pill"><Icon name="calendar" size={17} /> {formatDate(today)}</div>} /><div className="stats-grid">
          <Stat label="Total sales today" value={money(salesToday.reduce((sum, item) => sum + item.amount, 0))} icon="₱" detail="Completed today" tone="red" />
          <Stat label="Total revenue" value={money(completed.reduce((sum, item) => sum + item.amount, 0))} icon="↗" detail="All-time completed sales" tone="green" />
          <Stat label="Total transactions" value={String(transactions.length)} icon="▤" detail="All demo transactions" tone="blue" />
          <Stat label="Registered users" value={String(users.length)} icon="♙" detail={`${users.filter(user => user.active).length} active accounts`} tone="purple" />
          <Stat label="Total products" value={String(products.length)} icon="▣" detail="In your catalog" tone="orange" />
          <Stat label="Low stock items" value={String(lowStock.length)} icon="!" detail="Fewer than 10 units" tone="yellow" />
        </div><div className="section-title"><div><h2>Sales at a glance</h2><p>A closer look at how your store is performing.</p></div><button className="text-button" onClick={() => navigate('analytics')}>View analytics →</button></div><Analytics dashboard /><section className="panel table-panel recent-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Keep track of your latest store activity.</p></div><button className="outline-button" onClick={() => navigate('transactions')}>View all <span>→</span></button></div><TransactionTable compact /></section></>}
        {route === 'analytics' && <><PageHeading eyebrow="INSIGHTS" title="Sales analytics" description="Explore your store’s performance with simulated sales data." /><Analytics /></>}
        {route === 'transactions' && <><PageHeading eyebrow="STORE ACTIVITY" title="Transactions" description="Monitor and explore your transaction history." /><div className="stats-grid three"><Stat label="Total transactions" value={String(transactions.length)} icon="▤" detail="All demo transactions" tone="blue" /><Stat label="Completed revenue" value={money(completed.reduce((sum, item) => sum + item.amount, 0))} icon="₱" detail={`${completed.length} completed transactions`} tone="green" /><Stat label="Pending transactions" value={String(transactions.filter(item => item.status === 'Pending').length)} icon="◷" detail="Awaiting completion" tone="yellow" /></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Transaction history</h2><p>All transactions in one place.</p></div></div><TransactionTable /></section></>}
        {route === 'users' && <><PageHeading eyebrow="YOUR COMMUNITY" title="User management" description="View and manage your registered customers." /><UsersPage users={users} setUsers={setUsers} notify={notify} /></>}
        {(route === 'products' || route === 'inventory') && <><PageHeading eyebrow="YOUR CATALOG" title={route === 'products' ? 'Products' : 'Inventory'} description={route === 'products' ? 'Manage the products available at your kiosk.' : 'Keep an eye on stock levels and stay ready for customers.'} /><ProductsPage products={products} setProducts={setProducts} notify={notify} inventory={route === 'inventory'} /></>}
        {route === 'settings' && <><PageHeading eyebrow="PREFERENCES" title="Settings" description="Personalize your demo workspace." /><section className="panel settings-panel"><h2>Store preferences</h2><p>These settings only apply during this browser session.</p><form onSubmit={event => { event.preventDefault(); notify('Demo settings saved locally.') }} className="modal-form"><label>Store name<input value={storeName} required onChange={event => setStoreName(event.target.value)} /></label><label className="check"><input type="checkbox" checked={alerts} onChange={event => setAlerts(event.target.checked)} /> Show low-stock notifications</label><div><button className="primary-button">Save preferences</button></div></form></section><section className="panel settings-panel"><h2>About this prototype</h2><p>All data is simulated. Changes reset on refresh. No real accounts, transactions, or backend services are used.</p><button className="outline-button" onClick={() => navigate('starter')}>View original starter screen →</button></section></>}
        {route === 'search' && <><PageHeading eyebrow="QUICK SEARCH" title="Search results" description={`Matches for “${searchTerm}” across demo data.`} /><SearchResults term={searchTerm} users={users} products={products} navigate={navigate} /></>}
        {!['dashboard', 'analytics', 'transactions', 'products', 'inventory', 'users', 'settings', 'search'].includes(route) && <Empty text="This page doesn't exist. Choose a page from the navigation." />}
        <footer className="footer"><span>© 2026 8-Twelve Kiosk. Made for everyday business.</span><span>Frontend demo · Mock data only</span></footer>
      </main>
    </div>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}

function Stat({ label, value, icon, detail, tone }: { label: string; value: string; icon: string; detail: string; tone: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>
}

function SearchResults({ term, users, products, navigate }: { term: string; users: typeof initialUsers; products: typeof initialProducts; navigate: (route: string) => void }) {
  const search = term.toLowerCase()
  const results = [
    ...users.filter(user => `${user.name} ${user.username} ${user.email}`.toLowerCase().includes(search)).map(user => ({ label: user.name, detail: `User · @${user.username}`, route: 'users' })),
    ...products.filter(product => `${product.name} ${product.category}`.toLowerCase().includes(search)).map(product => ({ label: product.name, detail: `Product · ${product.category}`, route: 'products' })),
    ...transactions.filter(item => `${item.id} ${item.customer}`.toLowerCase().includes(search)).map(item => ({ label: item.id, detail: `Transaction · ${item.customer}`, route: 'transactions' })),
  ]
  return <section className="panel">{results.length ? <div className="search-results">{results.map((result, index) => <button key={`${result.route}-${index}`} onClick={() => navigate(result.route)}><span><strong>{result.label}</strong><small>{result.detail}</small></span><span>→</span></button>)}</div> : <Empty text="No matching users, products, or transactions." />}</section>
}

export default App
