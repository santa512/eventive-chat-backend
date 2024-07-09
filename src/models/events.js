const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventName: { type: String, required: true },
    eventBucket: { type: String, required: true },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    location: { type: String, required: false },
    // add other fields as needed
  },
  { timestamps: true }
)

module.exports = mongoose.model('Event', EventSchema)
