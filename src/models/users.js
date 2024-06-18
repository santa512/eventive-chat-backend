const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    // add other fields as needed
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)
