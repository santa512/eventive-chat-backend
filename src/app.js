// dependencies
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const formatMessage = require('./utils/messages')
const cors = require('cors')
const https = require('https')
const fs = require('fs')
const mongoose = require('mongoose')

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAttendees,
} = require('./utils/users')

const app = express()
const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  room: String,
  time: { type: Date, default: () => new Date().toLocaleString() },
})
const Message = mongoose.model('Message', MessageSchema)
mongoose
  .connect(
    'mongodb+srv://dxfest24:8PqL84vxeHk0KXaA@cluster0.rwbftx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
    }
  )
  .then(() => {
    console.log('MongoDB Connected...')
  })
  .catch((err) => console.log(err))

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open')
})

mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err)
})

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected')
})
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
    socket.emit(
      'message',
      formatMessage(botName, 'Welcome to Double exposure 2024!')
    )

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
    console.log('---chatMessage---')
    const messageDocument = new Message({
      username: user.username,
      text: msg,
      room: user.room,
      time: Date.now(), // Add timestamp property with current timestamp
    })
    console.log('---message::' + messageDocument)
    // Save the message document to the database
    messageDocument
      .save()
      .then(() => {
        console.log('---message-saved')
        io.to(user.room).emit('message', formatMessage(user.username, msg))
      })
      .catch((err) => {
        console.error(err)
      })
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

  //send initial message history
  socket.on('getMessageHistory', ({ room }) => {
    Message.find({ room: room })
      .then((messages) => {
        socket.emit('messageHistory', messages)
      })
      .catch((err) => {
        console.error(err)
      })
  })

  //send additional message history by scroll up
  socket.on('getMoreMessageHistory', ({ room, count }) => {
    Message.find({ room: room })
      .sort({ time: -1 }) // Sort messages by time in descending order
      .skip(count) // Skip the messages that have already been sent
      .limit(10) // Limit the number of messages to 10
      .then((messages) => {
        // Send the messages in reverse order so the oldest message comes first
        socket.emit('moreMessageHistory', messages.reverse())
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
