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
    const {
      userId,
      username,
      userEmail,
      status = 'offline',
      shareInfo = 'true',
    } = userData
    const newUser = new User({ userId, username, userEmail, status, shareInfo })
    const user = await findUserById(userId)
    if (!user) await newUser.save()
    else {
      return false
    }
    return true
  } catch (error) {
    console.error('Error adding user:', error)
    return false
  }
}

async function findUserById(userId) {
  try {
    const user = await User.findOne({ userId: userId })
    if (user) {
      return user
    } else {
      return null
    }
  } catch (error) {
    console.error('Error finding user:', error)
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

async function getAllUsers() {
  try {
    const users = await User.find()
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

async function getPublicUsers() {
  try {
    const users = await User.find({ shareInfo: true })
    return users
  } catch (error) {
    console.error('Error fetching public users:', error)
  }
}

async function updateUserStatus(userId, status) {
  try {
    const user = await findUserById(userId)
    if (!user) return false

    await User.updateOne({ _id: user._id }, { $set: { status: status } })
    return true
  } catch (error) {
    console.error('Error updating user status:', error)
    return false
  }
}

async function updateUserPrivacy(userId, shareInfo) {
  try {
    const user = await findUserById(userId)
    if (!user) return false

    await User.updateOne({ _id: user._id }, { $set: { shareInfo: shareInfo } })
    return true
  } catch (error) {
    console.error('Error updating user privacy:', error)
    return false
  }
}

async function deleteUser(userId) {
  try {
    await User.findByIdAndDelete(userId)
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

async function setInitstatus(userId) {
  try {
    const user = await findUserById(userId)
    if (!user) return false

    await User.updateOne({ _id: user._id }, { $set: { setInit: true } })
    return true
  } catch (error) {
    console.error('Error setting user init status:', error)
    return false
  }
}

module.exports = {
  addUser,
  fetchUserlist,
  findUserById,
  getAllUsers,
  getPublicUsers,
  updateUserStatus,
  updateUserPrivacy,
  deleteUser,
  setInitstatus,
}
