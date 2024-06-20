const Message = require('../models/messages')

async function addMessage(msg) {
  const { sender, receiver, text } = msg
  try {
    const message = new Message({
      sender: sender,
      receiver: receiver,
      text: text,
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

async function getUsersSortedByLastMessage(userId) {
  try {
    const users = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { time: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
          },
          lastMessageTime: { $first: '$time' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $sort: { lastMessageTime: -1 },
      },
      {
        $project: {
          _id: '$user._id',
          userId: '$user.userId',
          username: '$user.username',
          userEmail: '$user.userEmail',
          status: '$user.status',
          lastMessageTime: 1,
        },
      },
    ])

    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

module.exports = {
  addMessage,
  removeMessage,
  getMessageHistory,
  getAllMessages,
  getPrivateMessage,
  getUsersSortedByLastMessage,
  getTotalMessageCount,
}
