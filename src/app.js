// dependencies
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const formatMessage = require('./utils/messages')
const cors = require('cors')
const https = require('https')

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAttendees,
} = require('./utils/users')

const app = express()
const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
}
// Allow all origins
app.use(cors())

// Allow specific origin(s)
app.use(
  cors({
    origin: '*',
  })
)

const server = https.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin === 'null') {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})

// set static file
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'XeroxChat Bot'

// run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to XeroxChat!'))

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
