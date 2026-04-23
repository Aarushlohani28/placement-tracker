import { useState, useEffect, useRef } from 'react'
import api from '../api'
import { socket } from '../socket'
import { resolveUrl } from '../utils/resolveUrl'

export default function Chat({ currentUser, initialTargetUser, conversations, refreshConversations }) {
  const [targetUser, setTargetUser] = useState(initialTargetUser || null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const messagesEndRef = useRef(null)

  // Uplifted socket.connect() is now handled globally in App.jsx. 
  // We just listen to receiveMessage here if we need real-time appends for the CURRENT active chat.
  useEffect(() => {
    const handleReceive = (message) => {
      // If we are actively looking at the thread, append it
      setMessages((prev) => [...prev, message])
      
      // If the message is from our active target, immediately mark it as read
      if (targetUser && message.sender === targetUser._id) {
        api.put(`/api/messages/${targetUser._id}/mark-read`).then(() => {
          refreshConversations()
        })
      }
    }

    socket.on('receiveMessage', handleReceive)
    return () => {
      socket.off('receiveMessage', handleReceive)
    }
  }, [targetUser])

  // When target user changes, fetch their message history and mark them as read
  useEffect(() => {
    if (!targetUser) return
    api.get(`/api/messages/${targetUser._id}`)
      .then(({ data }) => setMessages(data))
      .catch(console.error)
      
    // Mark read
    api.put(`/api/messages/${targetUser._id}/mark-read`).then(() => {
      refreshConversations()
    })
  }, [targetUser])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !imageFile) || !targetUser || uploading) return

    setUploading(true)
    let mediaUrl = ''

    try {
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        const { data } = await api.post('/api/messages/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        mediaUrl = data.mediaUrl
      }

      const messageData = {
        senderId: currentUser._id,
        receiverId: targetUser._id,
        content: newMessage,
        mediaUrl
      }

      socket.emit('sendMessage', messageData)
      setMessages(prev => [...prev, { ...messageData, sender: currentUser._id, createdAt: new Date() }])
      
      setTimeout(() => refreshConversations(), 300)
      
      setNewMessage('')
      setImageFile(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteChat = async () => {
    if (!window.confirm(`Delete the entire chat with ${targetUser.name}? This will only remove it for you.`)) return
    
    try {
      await api.delete(`/api/messages/${targetUser._id}`)
      setMessages([])
      setTargetUser(null)
      refreshConversations()
    } catch (err) {
      alert('Failed to delete chat.')
    }
  }

  // Filter messages to show only the ones for the active targetUser thread
  const activeMessages = messages.filter(m => 
    (m.sender === currentUser._id && m.receiver === targetUser?._id) ||
    (m.sender === targetUser?._id && m.receiver === currentUser._id)
  )

  const displayConversations = [...conversations]
  if (targetUser && !displayConversations.find(c => c.user._id === targetUser._id)) {
    displayConversations.unshift({
      user: targetUser,
      unreadCount: 0,
      lastMessageAt: new Date()
    })
  }

  return (
    <div className="chat-container">
      
      {/* Sidebar - Contacts */}
      <div className={`chat-sidebar ${targetUser ? 'active-chat' : ''}`}>
        <div style={{ padding: '1rem', background: '#faf8f5', borderBottom: '1px solid var(--color-khaki)' }}>
          <h3 style={{ margin: 0, color: 'var(--color-bistre)' }}>Conversations</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayConversations.map(conv => {
            const u = conv.user
            const isUnread = conv.unreadCount > 0
            return (
              <div 
                key={u._id} 
                onClick={() => setTargetUser(u)}
                style={{
                  padding: '1rem', 
                  borderBottom: '1px solid #f0f0f0', 
                  cursor: 'pointer',
                  background: targetUser?._id === u._id ? 'var(--color-khaki)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img 
                    src={resolveUrl(u.profilePic, 'https://via.placeholder.com/40')} 
                    alt={u.name} 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} 
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{u.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-coffee)' }}>{u.role}</span>
                  </div>
                </div>
                {isUnread && (
                  <div style={{ background: '#c00', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${targetUser ? 'active-chat' : ''}`}>
        {targetUser ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-khaki)', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="chat-back-btn" 
                  onClick={() => setTargetUser(null)}
                >
                  &larr; Back
                </button>
                <img 
                  src={resolveUrl(targetUser.profilePic, 'https://via.placeholder.com/40')} 
                  alt={targetUser.name} 
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} 
                />
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-bistre)' }}>{targetUser.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-coffee)', textTransform: 'capitalize' }}>{targetUser.role}</span>
                </div>
              </div>

              <button 
                onClick={handleDeleteChat} 
                style={{ background: '#c00', color: 'white', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Delete Chat
              </button>

            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fdfbf9' }}>
              {activeMessages.map((msg, i) => {
                const isMine = msg.sender === currentUser._id
                return (
                  <div key={i} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ 
                      padding: '0.8rem 1rem', 
                      borderRadius: isMine ? '15px 15px 0 15px' : '15px 15px 15px 0',
                      background: isMine ? 'var(--color-bistre)' : '#ffe4c4',
                      color: isMine ? '#fff' : '#333'
                    }}>
                      {msg.mediaUrl && (
                        <div style={{ marginBottom: msg.content ? '0.5rem' : '0' }}>
                          <img 
                            src={resolveUrl(msg.mediaUrl)} 
                            alt="Attachment" 
                            onClick={() => setSelectedPhoto(resolveUrl(msg.mediaUrl))}
                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }} 
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem', textAlign: isMine ? 'right' : 'left' }}>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--color-khaki)', display: 'flex', gap: '0.5rem', background: '#fff', alignItems: 'center' }}>
              <label style={{ cursor: 'pointer', background: 'var(--color-beige)', padding: '0.6rem', borderRadius: '50%', color: 'var(--color-bistre)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span title="Attach Photo">📷</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFile(e.target.files[0])} />
              </label>
              {imageFile && (
                <div style={{ fontSize: '0.7rem', background: '#e0e0e0', padding: '0.3rem 0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imageFile.name}</span>
                  <button type="button" onClick={() => setImageFile(null)} style={{ background: 'transparent', color: '#c00', border: 'none', padding: 0, margin: 0, fontWeight: 'bold' }}>&times;</button>
                </div>
              )}
              <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '1px solid var(--color-chamois)' }}
              />
              <button type="submit" disabled={uploading} style={{ borderRadius: '20px', padding: '0 1.5rem', background: uploading ? 'gray' : 'var(--color-bistre)' }}>
                {uploading ? '...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-coffee)' }}>
            Select a conversation from the sidebar to start chatting.
          </div>
        )}
      </div>

      {/* Full Screen Image Modal */}
      {selectedPhoto && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setSelectedPhoto(null)}
        >
          <img 
            src={selectedPhoto} 
            alt="Expanded Attachment" 
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }} 
          />
        </div>
      )}
    </div>
  )
}
