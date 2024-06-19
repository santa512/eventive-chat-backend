// dependencies
require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const formatMessage = require('./utils/messages')
const cors = require('cors')

const mongoose = require('mongoose')
const router = require('./routes/routes')

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAttendees,
} = require('./utils/users')

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
app.use('/', router)

const server = http.createServer(app)

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Access-Control-Allow-Methods'],
    credentials: true,
  },
})

// set static file
// app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Double exposure 2024'

// // run when client connects
// io.on('connection', (socket) => {
//   socket.on('joinRoom', ({ username, room }) => {
//     const user = userJoin(socket.id, username, room)

//     socket.join(user.room)

//     // welcome current user
//     socket.emit(
//       'message',
//       formatMessage(botName, 'Welcome to Double exposure 2024!')
//     )

//     // broadcast when a user connects
//     socket.broadcast
//       .to(user.room)
//       .emit(
//         'message',
//         formatMessage(botName, `${user.username} has joined the chat!`)
//       )

//     // send users and room info
//     io.to(user.room).emit('roomUsers', {
//       room: user.room,
//       users: getRoomUsers(user.room),
//       attendees: getAttendees(),
//     })
//   })

//   // listen for chatMessage
//   socket.on('chatMessage', (msg) => {
//     const user = getCurrentUser(socket.id)
//     console.log('---chatMessage---')

//     const messageDocument = new Message({
//       username: user.username,
//       text: msg,
//       room: user.room,
//       time: Date.now(), // Add timestamp property with current timestamp
//     })
//     console.log('---message::' + messageDocument)
//     // Save the message document to the database
//     messageDocument
//       .save()
//       .then(() => {
//         console.log('---message-saved')
//         io.to(user.room).emit('message', formatMessage(user.username, msg))
//       })
//       .catch((err) => {
//         console.error(err)
//       })
//   })

//   // runs when clients disconnects
//   socket.on('disconnect', () => {
//     const user = userLeave(socket.id)

//     if (user) {
//       io.to(user.room).emit(
//         'message',
//         formatMessage(botName, `${user.username} has left the chat!`)
//       )

//       // send users and room info
//       io.to(user.room).emit('roomUsers', {
//         room: user.room,
//         users: getRoomUsers(user.room),
//       })
//     }
//   })

//   //send initial message history
//   socket.on('getMessageHistory', ({ room }) => {
//     Message.find({ room: room })
//       .sort({ time: -1 }) // Sort messages by time in descending order
//       .limit(10) // Limit the number of messages to 10
//       .then((messages) => {
//         socket.emit('messageHistory', messages)
//       })
//       .catch((err) => {
//         console.error(err)
//       })
//   })

//   //send additional message history by scroll up
//   socket.on('getMoreMessageHistory', ({ room, count }) => {
//     Message.find({ room: room })
//       .sort({ time: -1 }) // Sort messages by time in descending order
//       .skip(count) // Skip the messages that have already been sent
//       .limit(10) // Limit the number of messages to 10
//       .then((messages) => {
//         socket.emit('moreMessageHistory', messages)
//       })
//       .catch((err) => {
//         console.error(err)
//       })
//   })
// })

io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  socket.on('joinPrivateChat', ({ senderId, receiverId }) => {
    // Create a unique identifier for the chat between two users
    const chatId = [senderId, receiverId].sort().join('_')
    socket.join(chatId)
    userService.updateUserStatus(senderId, 'online')
    // Welcome message for the sender
    socket.emit('message', formatMessage(botName, 'Welcome to Eventive 2024!'))

    // Notify the receiver that the sender has joined
    socket.broadcast
      .to(chatId)
      .emit(
        'message',
        formatMessage(botName, 'A new user has joined the chat!')
      )
  })

  socket.on('chatMessage', ({ senderId, receiverId, msg }) => {
    const chatId = [senderId, receiverId].sort().join('_')

    const messageDocument = {
      sender: senderId,
      receiver: receiverId,
      text: msg,
      time: new Date(), // Current timestamp
    }
    // Save the message document to the database
    messageService
      .addMessage(messageDocument)
      .then(() => {
        io.to(chatId).emit('message', formatMessage(senderId, msg))
      })
      .catch((err) => {
        console.error(err)
      })
  })

  // Runs when clients disconnect
  socket.on('disconnect', () => {
    // No specific logic needed for disconnection in 1:1 chat
  })
})

const PORT = process.env.PORT || 443
server.listen(PORT, () => {
  console.log(`🎯 Server is running on PORT: ${PORT}`)
})
