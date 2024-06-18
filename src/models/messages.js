const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  room: String,
  time: { type: Date, default: () => new Date().toLocaleString() },
})

module.exports = mongoose.model('Message', MessageSchema)
