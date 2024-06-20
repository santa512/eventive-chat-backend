// dependencies
require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const mongoose = require('mongoose')
const router = require('./routes/routes')

const userService = require('./services/userService')
const messageService = require('./services/messageService')

const app = express()
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())

//database connect
mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
  })
  .then(() => {
    console.log('MongoDB Connected...')
    userService.fetchUserlist()
  })
  .catch((err) => console.log(err))

//production env
app.use(
  cors({
    origin: '*',
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

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Origin',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
  },
})

app.use('/', router)
// set static file
// app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ userId }) => {
    userService.updateUserStatus(userId, 'online')
    console.log('user joined : ' + userId)
    socket.broadcast.emit('userStateChange', {
      userId: userId,
      status: 'online',
    })

    socket.on('disconnect', () => {
      userService.updateUserStatus(userId, 'offline')
      console.log('user left : ' + userId)
      socket.broadcast.emit('userStateChange', {
        userId: userId,
        status: 'offline',
      })
    })
  })
  socket.on('joinPrivateChat', ({ senderId, receiverId }) => {
    // Create a unique identifier for the chat between two users
    const chatId = [senderId, receiverId].sort().join('_')
    socket.join(chatId)
    userService.updateUserStatus(senderId, 'online')
  })
  socket.on('changePrivacy', ({ userId, shareInfo }) => {
    userService.updateUserPrivacy(userId, shareInfo)
    socket.broadcast.emit('userStateChange', {
      userId: userId,
      status: shareInfo ? 'added' : 'removed',
    })
  })
  socket.on('sendMessage', (msg) => {
    const chatId = [msg.sender, msg.receiver].sort().join('_')
    // Save the message document to the database
    messageService
      .addMessage(msg)
      .then(() => {
        io.to(chatId).emit('message', msg)
      })
      .catch((err) => {
        console.error(err)
      })
  })
})

const PORT = process.env.PORT || 443
server.listen(PORT, () => {
  console.log(`🎯 Server is running on PORT: ${PORT}`)
})
