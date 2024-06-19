const Message = require('../models/messages')

async function addMessage(msg) {
  const { senderId, receiverId, text, time } = msg
  try {
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text: text,
      time: time,
    })
    await message.save()
  } catch (error) {
    console.error(error)
  }
}

async function getPrivateMessage(senderId, receiverId, count = 0, limit = 10) {
  return Message.find({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  })
    .sort('-time')
    .skip(count)
    .limit(limit)
}

async function removeMessage() {
  try {
    // Add code for removing a message
  } catch (error) {
    console.error(error)
  }
}
async function getMessageHistory() {
  return Message.find({})
  try {
    // Add code for getting message history
  } catch (error) {
    console.error(error)
  }
}

async function getAllMessages() {
  try {
    // Add code for getting all messages
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  addMessage,
  removeMessage,
  getMessageHistory,
  getAllMessages,
  getPrivateMessage,
}
