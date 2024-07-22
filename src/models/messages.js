const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  time: { type: Date, default: () => new Date().toLocaleString() },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: undefined},
  autodelete: { type: Boolean, default: false },
})

MessageSchema.index({createdAt: 1}, {expireAfterSeconds: 600 });

module.exports = mongoose.model('Message', MessageSchema)
