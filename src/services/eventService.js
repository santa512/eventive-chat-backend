const Event = require('../models/events')
const axios = require('axios')
require('dotenv').config()

const config = {
    headers: {
      Authorization: 'Basic Yjg3MjQ5YmQ2MTk4YjRkYjc5N2Q3M2Y4NmUzNzhjNjE6',
      'Content-Type': 'application/json',
    },
  }

async function fetchEvents() {
  try {
    const response = await axios.get(
      process.env.EVENTIVE_API + `/event_buckets/${process.env.EVENT_BUCKET_ID}/events`,
      config
    )
    
    const events = response.data.events.map((event) => ({
      eventId: event.id,
      eventBucket: event.event_bucket,
      eventName: event.name,
      eventStartDate: new Date(event.start_time),
      eventEndDate: new Date(event.end_time),
    }))

    for (const event of events) {
      const newEvent = new Event(event);
      await newEvent.save();
    }

    return response.data.events
  } catch (error) {
    console.error('Error fetching events:', error)
  }
}

async function getEvents() {
  try {
    const events = Event.find();
    return events;
  } catch (error) {
    console.error('Error getting events:', error);
  }
}

module.exports = {
  fetchEvents,
  getEvents,
}