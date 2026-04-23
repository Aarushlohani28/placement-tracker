const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const Message = require('./models/Message')

dotenv.config()

connectDB()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/companies', require('./routes/companyRoutes'))  
app.use('/api/drives', require('./routes/driveRoutes'))
app.use('/api/applications', require('./routes/applicationRoutes'))
app.use('/api/interviews', require('./routes/interviewRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/messages', require('./routes/messageRoutes'))

app.get('/', (req, res) => {
  res.send('Placement Tracker API is running!')
})

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  socket.on('join', (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined their room`)
  })

  socket.on('sendMessage', async (data) => {
    try {
      const message = await Message.create({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content,
        mediaUrl: data.mediaUrl || ''
      })
      // Emit to receiver's room
      io.to(data.receiverId).emit('receiveMessage', message)
      // Emit back to sender's room so multiple tabs stay synced (optional but helpful)
      io.to(data.senderId).emit('receiveMessage', message)
    } catch (error) {
      console.error('Error saving message:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})