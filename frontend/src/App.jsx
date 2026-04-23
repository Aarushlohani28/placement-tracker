import { useState, useEffect } from 'react'
import api from './api'
import './index.css'

// ─── helpers ───────────────────────────────────────────────
const saveAuth = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify({
    _id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    cgpa: data.cgpa,
    branch: data.branch,
    designation: data.designation,
    profilePic: data.profilePic
  }))
}

const getAuth = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token && user) return { token, user: JSON.parse(user) }
  return null
}

const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

import Profile from './components/Profile'
import Directory from './components/Directory'
import Chat from './components/Chat'
import { socket } from './socket'

// ─── App ───────────────────────────────────────────────────
function App() {
  const [authState, setAuthState] = useState(getAuth)

  const handleLogin = (data) => {
    saveAuth(data)
    setAuthState({ token: data.token, user: data })
  }

  const handleUpdateUser = (updatedUser) => {
    const newData = { ...updatedUser, token: authState.token }
    saveAuth(newData)
    setAuthState({ token: authState.token, user: updatedUser })
  }

  const handleLogout = () => {
    clearAuth()
    setAuthState(null)
  }

  return (
    <>
      {!authState ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <DashboardShell authState={authState} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      )}
    </>
  )
}

// ─── Auth Page (Login + Register) ──────────────────────────
function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'student', cgpa: '', branch: '', year: '', designation: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form.role === 'admin'
          ? { name: form.name, email: form.email, password: form.password, role: form.role, designation: form.designation }
          : { ...form, cgpa: parseFloat(form.cgpa), year: parseInt(form.year) }

      const { data } = await api.post(endpoint, payload)
      onLogin(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">CAMPUS PLACEMENT TRACKER</h2>

        {error && (
          <div style={{ background: '#fee', color: '#c00', padding: '0.8rem',
            borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" value={form.name}
                onChange={handleChange} placeholder="Your full name" required />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email}
              onChange={handleChange} placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Enter your password" required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'admin' ? (
                <div className="form-group">
                  <label htmlFor="designation">Designation</label>
                  <input id="designation" type="text" value={form.designation}
                    onChange={handleChange} placeholder="e.g. Placement Officer" required />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="branch">Branch</label>
                    <input id="branch" type="text" value={form.branch}
                      onChange={handleChange} placeholder="e.g. Computer Science" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cgpa">CGPA</label>
                    <input id="cgpa" type="number" step="0.1" min="0" max="10"
                      value={form.cgpa} onChange={handleChange} placeholder="e.g. 8.5" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <select id="year" value={form.year} onChange={handleChange}>
                      <option value="">Select year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          <div className="login-buttons">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
            <button type="button" className="btn-secondary"
              onClick={() => { setIsLogin(!isLogin); setError('') }}>
              {isLogin ? 'Register instead' : 'Login instead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Dashboard Shell ────────────────────────────────────────
function DashboardShell({ authState, onLogout, onUpdateUser }) {
  const [currentView, setCurrentView] = useState('Dashboard')
  const [chatTarget, setChatTarget] = useState(null)
  
  const [conversations, setConversations] = useState([])
  const [totalUnread, setTotalUnread] = useState(0)

  const user = authState.user

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/api/messages/all/conversations')
        setConversations(data)
        const unread = data.reduce((sum, c) => sum + c.unreadCount, 0)
        setTotalUnread(unread)
      } catch (err) {
        console.error(err)
      }
    }
    fetchConversations()

    socket.connect()
    socket.emit('join', user._id)

    const handleReceive = (msg) => {
      fetchConversations()
    }

    socket.on('receiveMessage', handleReceive)

    return () => {
      socket.off('receiveMessage')
      socket.disconnect()
    }
  }, [user._id])

  const refreshConversations = async () => {
    try {
      const { data } = await api.get('/api/messages/all/conversations')
      setConversations(data)
      const unread = data.reduce((sum, c) => sum + c.unreadCount, 0)
      setTotalUnread(unread)
    } catch (err) {}
  }

  const studentNav = ['Dashboard', 'Directory', 'Chat', 'Drives', 'Applications', 'My Profile']
  const adminNav = ['Dashboard', 'Directory', 'Chat', 'Companies', 'Drives', 'Applications', 'Interviews', 'My Profile']
  const navItems = user.role === 'admin' ? adminNav : studentNav

  const handleStartChat = (targetUser) => {
    setChatTarget(targetUser)
    setCurrentView('Chat')
  }

  const handleUserUpdate = (updatedUser) => {
    onUpdateUser(updatedUser)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':    return <Dashboard user={user} />
      case 'Directory':    return <Directory currentUser={user} onStartChat={handleStartChat} />
      case 'Chat':         return <Chat currentUser={user} initialTargetUser={chatTarget} conversations={conversations} refreshConversations={refreshConversations} />
      case 'My Profile':   return <Profile user={user} onUpdateUser={handleUserUpdate} onLogout={onLogout} />
      case 'Drives':       return <Drives user={user} />
      case 'Applications': return <Applications user={user} />
      case 'Companies':    return <Companies />
      case 'Interviews':   return <Interviews />
      default:             return <Dashboard user={user} />
    }
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-brand">CAMPUS PLACEMENT TRACKER</div>
        <div className="navbar-user">
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout}
            style={{ padding: '0.4em 0.8em', fontSize: '0.9em' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="sidebar-content-wrapper">
        <aside className="sidebar">
          {navItems.map(item => {
            const isChat = item === 'Chat'
            return (
              <div key={item}
                className={`nav-item ${currentView === item ? 'active' : ''}`}
                onClick={() => setCurrentView(item)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{item}</span>
                {isChat && totalUnread > 0 && (
                  <span style={{ 
                    background: '#c00', color: 'white', borderRadius: '12px', 
                    padding: '0.1rem 0.5rem', fontSize: '0.8rem', fontWeight: 'bold' 
                  }}>
                    {totalUnread}
                  </span>
                )}
              </div>
            )
          })}
        </aside>

        <main className="main-content">
          <div className="page-header">
            <h1 className="page-title">{currentView}</h1>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// ─── Dashboard ──────────────────────────────────────────────
function Dashboard({ user }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user.role === 'student') {
          const { data } = await api.get('/api/applications/my')
          setStats({
            total: data.length,
            shortlisted: data.filter(a => a.status === 'shortlisted').length,
            offered: data.filter(a => a.status === 'offered').length,
            rejected: data.filter(a => a.status === 'rejected').length,
          })
        } else {
          const [apps, drives, companies] = await Promise.all([
            api.get('/api/applications'),
            api.get('/api/drives'),
            api.get('/api/companies'),
          ])
          setStats({
            applications: apps.data.length,
            drives: drives.data.length,
            companies: companies.data.length,
            offers: apps.data.filter(a => a.status === 'offered').length,
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [user.role])

  return (
    <div>
      <div className="card">
        <h2>Welcome back, {user.name}!</h2>
        <p>Here is an overview of your campus placement progress.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
        {user.role === 'student' ? (
          <>
            <StatCard title="Total Applied" value={stats?.total ?? '...'} note="Drives applied to" />
            <StatCard title="Shortlisted" value={stats?.shortlisted ?? '...'} note="Active processes" color="chamois" />
            <StatCard title="Offers" value={stats?.offered ?? '...'} note="Offers received" color="bistre" />
          </>
        ) : (
          <>
            <StatCard title="Total Drives" value={stats?.drives ?? '...'} note="Placement drives" />
            <StatCard title="Companies" value={stats?.companies ?? '...'} note="Partner companies" color="chamois" />
            <StatCard title="Applications" value={stats?.applications ?? '...'} note="Total applications" color="bistre" />
            <StatCard title="Offers Made" value={stats?.offers ?? '...'} note="Students with offers" />
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, note, color }) {
  const bg = color === 'chamois'
    ? 'linear-gradient(135deg, var(--color-chamois), var(--color-coffee))'
    : color === 'bistre'
    ? 'linear-gradient(135deg, var(--color-bistre), var(--color-chamois))'
    : undefined
  return (
    <div className="stat-card" style={{ background: bg }}>
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      <p>{note}</p>
    </div>
  )
}

// ─── Companies (Admin) ──────────────────────────────────────
function Companies() {
  const [companies, setCompanies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', industry: '', website: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/companies')
      .then(({ data }) => setCompanies(data))
      .catch(() => setError('Failed to load companies'))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/api/companies', form)
      setCompanies([...companies, data])
      setShowForm(false)
      setForm({ name: '', industry: '', website: '', description: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add company')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return
    try {
      await api.delete(`/api/companies/${id}`)
      setCompanies(companies.filter(c => c._id !== id))
    } catch {
      setError('Failed to delete company')
    }
  }

  if (loading) return <div className="card"><p>Loading...</p></div>

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Partner Companies</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Company'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} style={{ padding: '1.5rem', border: '1px solid var(--color-chamois)', borderRadius: '8px', marginBottom: '1.5rem', background: '#faf8f5' }}>
          <h3 style={{ marginTop: 0 }}>Add New Company</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input placeholder="Company Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} required />
            <input placeholder="Industry" value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} required />
            <input placeholder="Website URL" value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} />
            <input placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} />
          </div>
          <button type="submit" style={{ background: 'var(--color-bistre)' }}>
            Submit Company
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {companies.map(company => (
          <div key={company._id} style={{ padding: '1.2rem', border: '1px solid var(--color-khaki)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: 'var(--color-bistre)' }}>{company.name}</span>
              <span style={{ color: 'var(--color-coffee)', marginLeft: '1rem' }}>{company.industry}</span>
            </div>
            <button onClick={() => handleDelete(company._id)}
              style={{ background: '#c00', fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Drives ─────────────────────────────────────────────────
function Drives({ user }) {
  const [drives, setDrives] = useState([])
  const [companies, setCompanies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applyingId, setApplyingId] = useState(null)
  const [appliedDriveIds, setAppliedDriveIds] = useState(new Set())
  const [form, setForm] = useState({
    company: '', role: '', package: '',
    eligibilityCGPA: '', branches: '', date: '', venue: '', description: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          api.get('/api/drives'),
          api.get('/api/companies')
        ]
        if (user.role === 'student') {
          promises.push(api.get('/api/applications/my'))
        }
        
        const results = await Promise.all(promises)
        setDrives(results[0].data)
        setCompanies(results[1].data)
        
        if (user.role === 'student') {
          const myApps = results[2].data
          const ids = new Set(myApps.map(app => app.drive?._id || app.drive))
          setAppliedDriveIds(ids)
        }
      } catch {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.role])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        package: parseFloat(form.package),
        eligibilityCGPA: parseFloat(form.eligibilityCGPA),
        branches: form.branches.split(',').map(b => b.trim())
      }
      const { data } = await api.post('/api/drives', payload)
      setDrives([...drives, data])
      setShowForm(false)
      setForm({ company: '', role: '', package: '', eligibilityCGPA: '', branches: '', date: '', venue: '', description: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add drive')
    }
  }

  const handleApply = async (driveId) => {
    setApplyingId(driveId)
    try {
      await api.post('/api/applications', { driveId })
      alert('Applied successfully!')
      setAppliedDriveIds(prev => new Set([...prev, driveId]))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplyingId(null)
    }
  }

  if (loading) return <div className="card"><p>Loading...</p></div>

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Placement Drives</h2>
        {user.role === 'admin' && (
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Drive'}
          </button>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} style={{ padding: '1.5rem', border: '1px solid var(--color-chamois)', borderRadius: '8px', marginBottom: '1.5rem', background: '#faf8f5' }}>
          <h3 style={{ marginTop: 0 }}>Add New Drive</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} required>
              <option value="">Select Company</option>
              {companies.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input placeholder="Job Role (e.g. Software Engineer)" value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} required />
            <input placeholder="Package (LPA)" type="number" value={form.package}
              onChange={e => setForm({ ...form, package: e.target.value })}
              style={{ flex: 1, minWidth: '150px' }} required />
            <input placeholder="Min CGPA" type="number" step="0.1" value={form.eligibilityCGPA}
              onChange={e => setForm({ ...form, eligibilityCGPA: e.target.value })}
              style={{ flex: 1, minWidth: '150px' }} required />
            <input placeholder="Branches (comma separated)" value={form.branches}
              onChange={e => setForm({ ...form, branches: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} />
            <input type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              style={{ flex: 1, minWidth: '150px' }} required />
            <input placeholder="Venue" value={form.venue}
              onChange={e => setForm({ ...form, venue: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} />
            <input placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ flex: 1, minWidth: '200px' }} />
          </div>
          <button type="submit" style={{ background: 'var(--color-bistre)' }}>
            Submit Drive
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {drives.map(drive => (
          <div key={drive._id} style={{ padding: '1.5rem', border: '1px solid var(--color-khaki)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-bistre)' }}>
                {drive.company?.name} — {drive.role}
              </h3>
              <span style={{
                background: drive.status === 'upcoming' ? 'var(--color-chamois)' : 'var(--color-khaki)',
                color: drive.status === 'upcoming' ? 'white' : 'var(--color-bistre)',
                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'capitalize'
              }}>
                {drive.status}
              </span>
            </div>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-coffee)' }}>
              Package: {drive.package} LPA &nbsp;|&nbsp;
              Min CGPA: {drive.eligibilityCGPA} &nbsp;|&nbsp;
              Date: {new Date(drive.date).toLocaleDateString()}
            </p>
            {drive.branches?.length > 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-coffee)' }}>
                Branches: {drive.branches.join(', ')}
              </p>
            )}
            {user.role === 'student' && drive.status === 'upcoming' && (
              <button
                style={{ marginTop: '1rem', opacity: appliedDriveIds.has(drive._id) ? 0.6 : 1, cursor: appliedDriveIds.has(drive._id) ? 'not-allowed' : 'pointer' }}
                disabled={applyingId === drive._id || appliedDriveIds.has(drive._id)}
                onClick={() => handleApply(drive._id)}>
                {appliedDriveIds.has(drive._id) ? 'Applied' : applyingId === drive._id ? 'Applying...' : 'Apply Now'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Applications ───────────────────────────────────────────
function Applications({ user }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const endpoint = user.role === 'admin' ? '/api/applications' : '/api/applications/my'
    api.get(endpoint)
      .then(({ data }) => setApplications(data))
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false))
  }, [user.role])

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await api.put(`/api/applications/${id}`, { status })
      setApplications(applications.map(a => a._id === id ? data : a))
    } catch {
      alert('Failed to update status')
    }
  }

  const statusColor = (status) => {
    const colors = {
      applied: '#3b82f6',
      shortlisted: '#f59e0b',
      interviewed: '#8b5cf6',
      offered: '#10b981',
      rejected: '#ef4444'
    }
    return colors[status] || '#888'
  }

  if (loading) return <div className="card"><p>Loading...</p></div>

  return (
    <div className="card">
      <h2>{user.role === 'admin' ? 'All Student Applications' : 'My Applications'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {applications.length === 0 && <p>No applications found.</p>}
        {applications.map(app => (
          <div key={app._id} style={{ padding: '1.5rem', border: '1px solid var(--color-khaki)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-bistre)' }}>
                  {app.drive?.company?.name} — {app.drive?.role}
                </h3>
                {user.role === 'admin' && (
                  <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', color: 'var(--color-coffee)' }}>
                    Student: {app.student?.name} ({app.student?.email})
                    &nbsp;| CGPA: {app.student?.cgpa}
                  </p>
                )}
                <p style={{ margin: '0.3rem 0', fontSize: '0.85rem', color: 'var(--color-coffee)' }}>
                  Package: {app.drive?.package} LPA &nbsp;|&nbsp;
                  Applied: {new Date(app.appliedDate).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <span style={{
                  background: statusColor(app.status),
                  color: 'white', padding: '0.3rem 0.8rem',
                  borderRadius: '20px', fontSize: '0.8rem', textTransform: 'capitalize'
                }}>
                  {app.status}
                </span>
                {user.role === 'admin' && (
                  <select
                    value={app.status}
                    onChange={e => handleStatusUpdate(app._id, e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '0.3rem' }}>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Interviews (Admin) ─────────────────────────────────────
function Interviews() {
  const [applications, setApplications] = useState([])
  const [rounds, setRounds] = useState({})
  const [showForm, setShowForm] = useState(null)
  const [form, setForm] = useState({ roundName: '', date: '', notes: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/applications')
      .then(({ data }) => setApplications(
        data.filter(a => ['shortlisted', 'interviewed'].includes(a.status))
      ))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadRounds = async (applicationId) => {
    try {
      const { data } = await api.get(`/api/interviews/${applicationId}`)
      setRounds(prev => ({ ...prev, [applicationId]: data }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddRound = async (e, applicationId) => {
    e.preventDefault()
    try {
      await api.post('/api/interviews', { applicationId, ...form })
      setForm({ roundName: '', date: '', notes: '' })
      setShowForm(null)
      loadRounds(applicationId)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add round')
    }
  }

  const handleUpdateResult = async (roundId, result, applicationId) => {
    try {
      await api.put(`/api/interviews/${roundId}`, { result })
      loadRounds(applicationId)
    } catch {
      alert('Failed to update result')
    }
  }

  if (loading) return <div className="card"><p>Loading...</p></div>

  return (
    <div className="card">
      <h2>Interview Schedules</h2>
      <p style={{ color: 'var(--color-coffee)', marginBottom: '1.5rem' }}>
        Showing shortlisted and interviewed applications
      </p>

      {applications.length === 0 && <p>No active interviews found.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {applications.map(app => (
          <div key={app._id} style={{ border: '1px solid var(--color-khaki)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: '#faf8f5', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: 'var(--color-bistre)' }}>
                  {app.student?.name} → {app.drive?.company?.name} ({app.drive?.role})
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-coffee)' }}>
                  CGPA: {app.student?.cgpa} | Status: {app.status}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ fontSize: '0.85rem' }}
                  onClick={() => {
                    loadRounds(app._id)
                    setShowForm(showForm === app._id ? null : app._id)
                  }}>
                  {showForm === app._id ? 'Close' : '+ Add Round'}
                </button>
              </div>
            </div>

            {showForm === app._id && (
              <form onSubmit={e => handleAddRound(e, app._id)}
                style={{ padding: '1rem', borderTop: '1px solid var(--color-khaki)', background: '#fff' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                  <input placeholder="Round name (e.g. Technical Round 1)"
                    value={form.roundName}
                    onChange={e => setForm({ ...form, roundName: e.target.value })}
                    style={{ flex: 1, minWidth: '200px' }} required />
                  <input type="date" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={{ flex: 1, minWidth: '150px' }} />
                  <input placeholder="Notes"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    style={{ flex: 1, minWidth: '200px' }} />
                </div>
                <button type="submit" style={{ background: 'var(--color-bistre)', fontSize: '0.85rem' }}>
                  Add Round
                </button>
              </form>
            )}

            {rounds[app._id] && (
              <div style={{ padding: '1rem', borderTop: '1px solid var(--color-khaki)' }}>
                {rounds[app._id].length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-coffee)' }}>No rounds added yet.</p>
                )}
                {rounds[app._id].map(round => (
                  <div key={round._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{round.roundName}</strong>
                      {round.date && <span style={{ fontSize: '0.8rem', color: 'var(--color-coffee)', marginLeft: '0.5rem' }}>
                        {new Date(round.date).toLocaleDateString()}
                      </span>}
                      {round.notes && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-coffee)' }}>{round.notes}</p>}
                    </div>
                    <select value={round.result}
                      onChange={e => handleUpdateResult(round._id, e.target.value, app._id)}
                      style={{ fontSize: '0.8rem', padding: '0.2rem' }}>
                      <option value="pending">Pending</option>
                      <option value="cleared">Cleared</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App