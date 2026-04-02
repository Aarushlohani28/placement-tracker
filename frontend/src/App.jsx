import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [authState, setAuthState] = useState(null)
  
  const handleLogin = (authData) => {
    setAuthState(authData)
  }

  const handleLogout = () => {
    setAuthState(null)
  }

  return (
    <>
      {!authState ? (
        <Login onLogin={handleLogin} />
      ) : (
        <DashboardShell authState={authState} onLogout={handleLogout} />
      )}
    </>
  )
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [simulatedResponse, setSimulatedResponse] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Simulate API call and response
    const response = {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      role: role,
      user: {
        email: email || "user@example.com",
        name: role === 'student' ? "John Doe" : "Admin User"
      }
    }
    
    setSimulatedResponse(response)
    
    // Simulate delay before actual login completes
    setTimeout(() => {
      onLogin(response)
    }, 1500)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">CAMPUS PLACEMENT TRACKER</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role: {role.charAt(0).toUpperCase() + role.slice(1)}</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="auth-links">
            <a href="#forgot">Forgot Password?</a>
          </div>

          <div className="login-buttons">
            <button type="submit" className="btn-primary">Login</button>
            <button type="button" className="btn-secondary">Register</button>
          </div>
        </form>
      </div>

      {simulatedResponse && (
        <div className="debug-response">
          <p>Simulating backend response...</p>
          <pre>{JSON.stringify(simulatedResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

function DashboardShell({ authState, onLogout }) {
  const [currentView, setCurrentView] = useState('Dashboard')
  
  const studentNavItems = ['Dashboard', 'Drives', 'Applications']
  const adminNavItems = ['Dashboard', 'Companies', 'Drives', 'Applications', 'Interviews']
  
  const navItems = authState.role === 'admin' ? adminNavItems : studentNavItems

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard role={authState.role} name={authState.user.name} />
      case 'Drives':
        return <Drives role={authState.role} />
      case 'Applications':
        return <Applications role={authState.role} />
      case 'Companies':
        return <Companies />
      case 'Interviews':
        return <Interviews />
      default:
        return <Dashboard role={authState.role} name={authState.user.name} />
    }
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-brand">CAMPUS PLACEMENT TRACKER</div>
        <div className="navbar-user">
          <span>Welcome, {authState.user.name}</span>
          <button onClick={onLogout} style={{ padding: '0.4em 0.8em', fontSize: '0.9em' }}>Logout</button>
        </div>
      </nav>
      
      <div className="sidebar-content-wrapper">
        <aside className="sidebar">
          {navItems.map(item => (
            <div 
              key={item} 
              className={`nav-item ${currentView === item ? 'active' : ''}`}
              onClick={() => setCurrentView(item)}
            >
              {item}
            </div>
          ))}
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

// Sub-components for views
function Dashboard({ role, name }) {
  return (
    <div>
      <div className="card">
        <h2>Welcome back, {name}!</h2>
        <p>Here is an overview of your campus placement progress.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {role === 'student' ? (
          <>
            <div className="stat-card">
              <h3>Applications</h3>
              <div className="stat-value">3</div>
              <p>You have applied to 3 drives.</p>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--color-chamois), var(--color-coffee))' }}>
              <h3>Shortlisted</h3>
              <div className="stat-value">1</div>
              <p>Active interview processes.</p>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <h3>Upcoming Drives</h3>
              <div className="stat-value">15</div>
              <p>There are 15 upcoming drives.</p>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--color-chamois), var(--color-coffee))' }}>
              <h3>Total Students</h3>
              <div className="stat-value">450</div>
              <p>Registered for placements.</p>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--color-bistre), var(--color-chamois))' }}>
              <h3>Active Companies</h3>
              <div className="stat-value">24</div>
              <p>Currently hiring.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Drives({ role }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Placement Drives List</h2>
        {role === 'admin' && <button>+ Add New Drive</button>}
      </div>
      
      <div style={{ padding: '1.5rem', border: '1px solid var(--color-khaki)', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-bistre)' }}>TechCorp Software Engineer</h3>
          <span style={{ background: 'var(--color-chamois)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Registration Open</span>
        </div>
        <p style={{ marginTop: '0.5rem', color: 'var(--color-coffee)' }}>Package: 12 LPA | Eligibility CGPA: 7.5</p>
        {role === 'student' && <button style={{ marginTop: '1rem' }}>Apply Now</button>}
      </div>

      <div style={{ padding: '1.5rem', border: '1px solid var(--color-khaki)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-bistre)' }}>DataSys Data Analyst</h3>
          <span style={{ background: 'var(--color-khaki)', color: 'var(--color-bistre)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Closed</span>
        </div>
        <p style={{ marginTop: '0.5rem', color: 'var(--color-coffee)' }}>Package: 8 LPA | Eligibility CGPA: 7.0</p>
      </div>
    </div>
  )
}

function Applications({ role }) {
  return (
    <div className="card">
      <h2>{role === 'admin' ? 'Student Applications' : 'My Applications'}</h2>
      <p style={{ marginTop: '1rem' }}>List of applications will be displayed here.</p>
    </div>
  )
}

function Companies() {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Partner Companies</h2>
        <button>+ Add Company</button>
      </div>
      <p>Manage company profiles and details here.</p>
    </div>
  )
}

function Interviews() {
  return (
    <div className="card">
      <h2>Interview Schedules</h2>
      <p style={{ marginTop: '1rem' }}>Manage and track all ongoing interviews for active placement drives.</p>
    </div>
  )
}

export default App
