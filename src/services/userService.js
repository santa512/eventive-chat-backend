const axios = require('axios')
const User = require('../models/users')
require('dotenv').config()

const config = {
  headers: {
    Authorization: 'Basic Yjg3MjQ5YmQ2MTk4YjRkYjc5N2Q3M2Y4NmUzNzhjNjE6',
    'Content-Type': 'application/json',
  },
}

async function addUser(userData) {
  try {
    const newUser = new User(userData)
    await newUser.save()
    console.log('User added successfully')
  } catch (error) {
    console.error('Error adding user:', error)
  }
}

async function fetchUserlist() {
  try {
    const response = await axios.get(
      process.env.EVENTIVE_API + `/orders?event_Id=${process.env.EVENT_ID}`,
      config
    )
    // fetch ordered userlist from Eventive
    const userlist = [
      ...new Set(
        response.data.orders
          .filter(
            (order) => order.event_bucket.name === process.env.EVENT_BUCKET
          )
          .map((order) => order.person)
      ),
    ]

    // filter repeated users
    const uniqueUserlist = Array.from(
      new Set(userlist.map((user) => JSON.stringify(user)))
    ).map((user) => JSON.parse(user))

    for (const user of uniqueUserlist) {
      await addUser({
        userId: user.id,
        username: user.details.name,
        userEmail: user.details.email,
      })
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  addUser,
  fetchUserlist,
}
