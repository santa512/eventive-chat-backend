const Message = require('../models/messages')

async function addMessage(msg) {
  const { sender, receiver, text } = msg
  try {
    const message = new Message({
      sender: sender,
      receiver: receiver,
      text: text,
      read: false,
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

async function getTotalMessageCount(senderId, receiverId) {
  return Message.countDocuments({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  })
}

async function removeMessage() {
  try {
    // Add code for removing a message
  } catch (error) {
    console.error(error)
  }
}
async function getMessageHistory() {
  try {
    // Add code for getting message history
    return Message.find({})
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
  removeMessage, //not used
  getMessageHistory, //not used
  getAllMessages, //not used
  getPrivateMessage,
  getTotalMessageCount,
}
