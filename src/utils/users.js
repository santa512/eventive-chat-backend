const { addUser, fetchUserlist } = require('../services/userService')
const users = []
let attendees = []

const axios = require('axios')

const eventiveId = '666160b2c5ef760048dc0024'
const url = `https://api.eventive.org/orders?event_id=${eventiveId}`

const config = {
  headers: {
    Authorization: 'Basic Yjg3MjQ5YmQ2MTk4YjRkYjc5N2Q3M2Y4NmUzNzhjNjE6',
    'Content-Type': 'application/json',
  },
}

axios
  .get(url, config)
  .then((response) => {
    attendees = [
      ...new Set(
        response.data.orders
          .filter((order) => order.event_bucket.name === 'Double Exposure 2024')
          .map((order) => order.person.details.name)
      ),
    ]
  })
  .catch((error) => {
    // Handle any errors here
    console.error(error)
  })

// join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room }
  users.push(user)
  return user
}

// get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id)
}

// user leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

// get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room)
}

//get all ordered attendees
function getAttendees() {
  return attendees
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAttendees,
}
