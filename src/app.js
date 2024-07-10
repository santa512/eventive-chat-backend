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
const { initEventAlert } = require('./utils/notification')
const { fetchEvents } = require('./services/eventService')
const io1 = require('socket.io-client');

const app = express()
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())

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

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ userId }) => {
    const chatId = userId
    console.log('userJoined:' + userId);
    socket.join(chatId)
    userService.updateUserStatus(userId, 'online')
    socket.broadcast.emit('userStateChange', {
      userId: userId,
      status: 'online',
    })

    socket.on('disconnect', () => {
      userService.updateUserStatus(userId, 'offline')
      socket.broadcast.emit('userStateChange', {
        userId: userId,
        status: 'offline',
      })
    })
  })
  socket.on('changePrivacy', ({ userId, shareInfo }) => {
    userService.updateUserPrivacy(userId, shareInfo)
    socket.broadcast.emit('userStateChange', {
      userId: userId,
      status: shareInfo ? 'added' : 'removed',
    })
  })
  socket.on('sendMessage', (msg) => {
    // Save the message document to the database
    console.log('send message:' + msg);
    messageService
      .addMessage(msg)
      .then(() => {
        io.to(msg.receiver).emit('message', msg)
        if(msg.sender != msg.receiver)
          io.to(msg.sender).emit('message', msg)
      })
      .catch((err) => {
        console.error(err)
      })
  })
})

//database connect
mongoose
  .connect(process.env.DB_HOST, {
    ssl: true,
  })
  .then(() => {
    console.log('MongoDB Connected...')
    userService.fetchUserlist()
    fetchEvents().then((events) => {
      initEventAlert((attendees, event) => {
        //in-app notification
        const socket = io1('https://eventive-chat-backend.onrender.com', {
          //production env
          withCredentials: true,
          extraHeaders: {
            'Content-Type': 'application/json',
          },
          transports: ['websocket', 'polling'],
        });
        socket.on('connect', () => {
          console.log('Socket connection established');
          socket.emit('joinRoom', '667525513fbd75006504d59f');

          attendees.forEach(attendee => {
            const msg = {
            sender: attendee.id, 
            receiver: attendee.id, 
            text: `Hello, ${attendee.name}! Just a quick reminder that ${event.eventName} will be starting in 10 minutes at ${event.location}.`}; 
            socket.emit('sendMessage', msg);
          });
        });
      })
    })
  })
  .catch((err) => console.log(err))

const PORT = process.env.PORT || 443
server.listen(PORT, () => {
  console.log(`🎯 Server is running on PORT: ${PORT}`)
})
