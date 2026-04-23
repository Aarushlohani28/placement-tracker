import { useState, useEffect } from 'react'
import api from '../api'

export default function Directory({ currentUser, onStartChat }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [currentUser._id])

  const fetchUsers = () => {
    api.get('/api/users')
      .then(({ data }) => setUsers(data.filter(u => u._id !== currentUser._id)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Approve account deletion? This action cannot be reversed.')) return
    try {
      await api.delete(`/api/users/${id}`)
      setUsers(users.filter(u => u._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  if (loading) return <div className="card"><p>Loading directory...</p></div>

  // Search logic
  const searchLower = searchQuery.toLowerCase()
  const matchedUsers = users.filter(u => {
    const roleMatch = filter === 'all' || u.role === filter
    const textMatch = 
      (u.name && u.name.toLowerCase().includes(searchLower)) ||
      (u.email && u.email.toLowerCase().includes(searchLower)) ||
      (u.branch && u.branch.toLowerCase().includes(searchLower)) ||
      (u.designation && u.designation.toLowerCase().includes(searchLower))
    return roleMatch && textMatch
  })

  // Separate deletion requests if admin
  const deletionRequests = currentUser.role === 'admin' ? matchedUsers.filter(u => u.deletionRequested) : []
  const standardUsers = currentUser.role === 'admin' ? matchedUsers.filter(u => !u.deletionRequested) : matchedUsers

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>People Directory</h2>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search name, email, branch..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.4rem', border: '1px solid var(--color-chamois)', borderRadius: '4px', maxWidth: '300px' }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.4rem', border: '1px solid var(--color-chamois)', borderRadius: '4px', width: 'auto' }}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {currentUser.role === 'admin' && deletionRequests.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#ffe4e4', border: '1px solid #ffaaaa', borderRadius: '8px' }}>
          <h3 style={{ color: '#c00', marginTop: 0 }}>Pending Deletion Requests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {deletionRequests.map(user => (
              <UserCard key={user._id} user={user} onStartChat={onStartChat} onDelete={handleDelete} isAdmin={true} isDeleteRequest={true} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {standardUsers.map(user => (
          <UserCard key={user._id} user={user} onStartChat={onStartChat} onDelete={handleDelete} isAdmin={currentUser.role === 'admin'} />
        ))}
        {standardUsers.length === 0 && <p style={{ gridColumn: '1 / -1', color: 'var(--color-coffee)' }}>No people found.</p>}
      </div>
    </div>
  )
}

function UserCard({ user, onStartChat, onDelete, isAdmin, isDeleteRequest }) {
  return (
    <div style={{ padding: '1.2rem', border: '1px solid var(--color-khaki)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: isDeleteRequest ? '#fff' : 'transparent' }}>
      <img 
        src={user.profilePic ? `http://localhost:5000${user.profilePic}` : 'https://via.placeholder.com/80'} 
        alt={user.name} 
        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', marginBottom: '1rem', border: '2px solid var(--color-chamois)' }} 
      />
      <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--color-bistre)' }}>{user.name}</h4>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--color-coffee)', textTransform: 'capitalize' }}>
        {user.role} {user.role === 'admin' && user.designation ? ` - ${user.designation}` : ''}
        {user.role === 'student' && user.branch ? ` - ${user.branch}` : ''}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexDirection: 'column' }}>
        <button 
          onClick={() => onStartChat(user)} 
          style={{ background: 'var(--color-bistre)', fontSize: '0.85rem', padding: '0.4rem 1rem', width: '100%' }}>
          Message
        </button>
        {isAdmin && isDeleteRequest && (
          <button 
            onClick={() => onDelete(user._id)} 
            style={{ background: '#c00', color: '#fff', fontSize: '0.85rem', padding: '0.4rem 1rem', width: '100%' }}>
            Approve Deletion
          </button>
        )}
      </div>
    </div>
  )
}
