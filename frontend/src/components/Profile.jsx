import { useState } from 'react'
import api from '../api'

export default function Profile({ user, onUpdateUser, onLogout }) {
  const [file, setFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [resumeMessage, setResumeMessage] = useState('')
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    designation: user.designation || '',
    branch: user.branch || '',
    cgpa: user.cgpa || '',
    year: user.year || '',
    bio: user.bio || ''
  })
  
  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionRequested, setDeletionRequested] = useState(user.deletionRequested || false)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setMessage('')
    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await api.put(`/api/users/${user._id}/profile-pic`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onUpdateUser({ ...user, profilePic: data.profilePic })
      setMessage('Profile picture updated successfully!')
      setFile(null)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload picture')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = async (e) => {
    e.preventDefault()
    if (!resumeFile) return

    setLoading(true)
    setResumeMessage('')
    const formData = new FormData()
    formData.append('resume', resumeFile)

    try {
      const { data } = await api.put(`/api/users/${user._id}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onUpdateUser({ ...user, resumeURL: data.resumeURL })
      setResumeMessage('Resume uploaded successfully!')
      setResumeFile(null)
    } catch (err) {
      setResumeMessage(err.response?.data?.message || 'Failed to upload resume')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const { data } = await api.put(`/api/users/${user._id}`, editForm)
      onUpdateUser(data) // data is the fully updated user object
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (user.role === 'admin') {
      if (window.confirm('Delete your entire administrator account? This action is instantaneous and cannot be reversed!')) {
        setIsDeleting(true)
        try {
          await api.delete(`/api/users/${user._id}`)
          alert('Account deleted.')
          onLogout()
        } catch (err) {
          alert('Failed to delete account')
          setIsDeleting(false)
        }
      }
    } else {
      if (window.confirm('Request account deletion? This requires administrator approval.')) {
        setIsDeleting(true)
        try {
          await api.post(`/api/users/${user._id}/request-delete`)
          setDeletionRequested(true)
          onUpdateUser({ ...user, deletionRequested: true }) // update local session
          alert('Deletion requested successfully.')
        } catch (err) {
          alert('Failed to request deletion')
        } finally {
          setIsDeleting(false)
        }
      }
    }
  }

  const picUrl = user.profilePic ? `http://localhost:5000${user.profilePic}` : 'https://via.placeholder.com/150'

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Column: Picture */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src={picUrl} 
            alt="Profile" 
            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--color-chamois)' }} 
          />
          <form onSubmit={handleUpload} style={{ marginTop: '1.5rem', background: '#faf8f5', padding: '1rem', border: '1px solid var(--color-khaki)', borderRadius: '8px', width: '100%' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', textAlign: 'center' }}>Update Avatar</h4>
            {message && message.includes('picture') && <p style={{ color: message.includes('success') ? 'green' : 'red', fontSize: '0.8rem', textAlign: 'center' }}>{message}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ padding: '0.4rem', fontSize: '0.8rem' }} />
              <button type="submit" disabled={!file || loading} style={{ padding: '0.4rem' }}>
                {loading && file ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>

          {user.role === 'student' && (
            <form onSubmit={handleResumeUpload} style={{ marginTop: '1rem', background: '#faf8f5', padding: '1rem', border: '1px solid var(--color-khaki)', borderRadius: '8px', width: '100%' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', textAlign: 'center' }}>Professional Resume</h4>
              {user.resumeURL && (
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <a href={`http://localhost:5000${user.resumeURL}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0066cc', textDecoration: 'underline' }}>View Current Resume</a>
                </div>
              )}
              {resumeMessage && <p style={{ color: resumeMessage.includes('success') ? 'green' : 'red', fontSize: '0.8rem', textAlign: 'center' }}>{resumeMessage}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} style={{ padding: '0.4rem', fontSize: '0.8rem' }} />
                <button type="submit" disabled={!resumeFile || loading} style={{ padding: '0.4rem' }}>
                  {loading && resumeFile ? 'Uploading...' : 'Upload PDF'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Details & Edit */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>{user.name}</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              style={{ background: isEditing ? 'var(--color-khaki)' : 'var(--color-chamois)' }}>
              {isEditing ? 'Cancel Edit' : 'Edit Info'}
            </button>
          </div>

          {message && !message.includes('picture') && <p style={{ color: message.includes('success') ? 'green' : 'red', fontSize: '0.9rem' }}>{message}</p>}

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '1.05rem' }}>
              {user.bio && (
                <div style={{ background: '#faf8f5', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-khaki)', fontStyle: 'italic', marginBottom: '1rem' }}>
                  "{user.bio}"
                </div>
              )}
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
              {user.role === 'admin' && <div><strong>Designation:</strong> {user.designation}</div>}
              {user.role === 'student' && (
                <>
                  <div><strong>Branch:</strong> {user.branch}</div>
                  <div><strong>CGPA:</strong> {user.cgpa}</div>
                  <div><strong>Year:</strong> {user.year}</div>
                  {deletionRequested && (
                    <div style={{ marginTop: '1rem', padding: '0.8rem', backgroundColor: '#ffe4e4', color: '#c00', borderRadius: '4px', border: '1px solid #ffaaaa', fontWeight: 'bold' }}>
                      Pending Administrator account deletion logic workflow.
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#faf8f5', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-khaki)' }}>
              <div>
                <label>Name</label>
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Short Bio</span>
                  <span style={{ fontSize: '0.8rem', color: editForm.bio.length >= 200 ? 'red' : 'gray' }}>
                    {editForm.bio.length}/200
                  </span>
                </label>
                <textarea 
                  value={editForm.bio} 
                  onChange={e => {
                    if (e.target.value.length <= 200) {
                      setEditForm({...editForm, bio: e.target.value})
                    }
                  }} 
                  rows="3"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
              {user.role === 'admin' && (
                <div>
                  <label>Designation</label>
                  <input value={editForm.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})} required />
                </div>
              )}
              {user.role === 'student' && (
                <>
                  <div>
                    <label>Branch</label>
                    <input value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} required />
                  </div>
                  <div>
                    <label>CGPA</label>
                    <input type="number" step="0.1" value={editForm.cgpa} onChange={e => setEditForm({...editForm, cgpa: e.target.value})} required />
                  </div>
                  <div>
                    <label>Year</label>
                    <input type="number" value={editForm.year} onChange={e => setEditForm({...editForm, year: e.target.value})} required />
                  </div>
                </>
              )}
              <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', background: 'var(--color-bistre)' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '3rem', borderTop: '2px solid #eee', paddingTop: '1.5rem' }}>
            <button 
              onClick={handleDeleteAccount}
              disabled={isDeleting || deletionRequested}
              style={{ background: deletionRequested ? '#ebb' : '#c00', color: 'white' }}>
              {user.role === 'admin' ? 'Delete Account Permanently' : (deletionRequested ? 'Deletion Requested' : 'Request Account Deletion')}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
