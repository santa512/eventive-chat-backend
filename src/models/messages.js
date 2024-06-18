const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String },
  room: { type: String },
  target: { type: String },
  time: { type: Date, default: () => new Date().toLocaleString() },
})

module.exports = mongoose.model('Message', MessageSchema)
