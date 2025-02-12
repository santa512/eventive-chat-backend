const Message = require('../models/messages')

async function addMessage(msg) {
  const { sender, receiver, text, autodelete } = msg
  try {
    const message = new Message({
      sender: sender,
      receiver: receiver,
      text: text,
      read: false,
      autodelete: autodelete,
      createdAt: autodelete ? new Date() : undefined,
    })
    await message.save()
  } catch (error) {
    console.error(error)
  }
}

async function getPrivateMessage(senderId, receiverId, count = 0, limit = 10) {
  Message.find({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  })
  .sort('-time')
  .skip(count)
  .limit(limit)
  .then(messages => {
    // Assuming messages have been successfully fetched, now mark them as read
    Message.updateMany({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      read: false // This ensures only unread messages are updated
    }, {
      $set: { read: true }
    })
    .then(updateResult => {
      // Handle success, maybe log how many messages were marked as read
      console.log(updateResult.modifiedCount + ' messages marked as read');
    })
    .catch(err => {
      // Handle possible update errors
      console.error('Error marking messages as read:', err);
    });
  })
  .catch(err => {
    // Handle errors from the initial message fetch
    console.error('Error fetching messages:', err);
  });
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

async function getUnreadMessageCount(senderId, receiverId) {
  return Message.countDocuments({
    $and: [
      {
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      },
      { read: false }
    ]
  });
}

async function removeMessage(id) {
  try {
    // Add code for removing a message
    await Message.findByIdAndRemove(id);
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

async function updateMessage(msgId, updatedText, updatedStatus = true) {
  try {
    const message = await Message.findById(msgId);
    if (message) {
      message.text = updatedText;
      message.read = updatedStatus;
      await message.save();
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  addMessage,
  removeMessage,
  getMessageHistory, //not used
  getAllMessages, //not used
  getPrivateMessage,
  getTotalMessageCount,
  getUnreadMessageCount,
  updateMessage,
}
