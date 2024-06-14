// dependencies
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const formatMessage = require('./utils/messages')
const cors = require('cors')
const https = require('https')
const fs = require('fs')

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAttendees,
} = require('./utils/users')

const app = express()
const options = {
  key: fs.readFileSync('./src/key.pem'),
  cert: fs.readFileSync('./src/cert.pem'),
}
// Allow all origins
app.use(cors())

// Allow specific origin(s)
app.use(
  cors({
    origin: 'https://doubleexposure24.eventive.org',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Origin',
      'X-Requested-With',
      'Accept',
    ],
  })
)

const server = http.createServer(app)
app.get('/', (req, res) => {
  res.send('Hello, World!')
})

const io = socketIo(server, {
  cors: {
    origin: 'https://doubleexposure24.eventive.org',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Access-Control-Allow-Methods'],
    credentials: true,
  },
})

// set static file
app.use(express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Methods'
  )
  next()
})

const botName = 'Double exposure 2024'

// run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // welcome current user
    socket.emit('message', formatMessage(botName, 'Double exposure 2024'))

    // broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat!`)
      )

    // send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
      attendees: getAttendees(),
    })
  })

  // listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // runs when clients disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat!`)
      )

      // send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const PORT = process.env.PORT || 443
server.listen(PORT, () => {
  console.log(`🎯 Server is running on PORT: ${PORT}`)
})
