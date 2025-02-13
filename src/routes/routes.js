const express = require('express')
const router = express.Router()
const userService = require('../services/userService')
const messageService = require('../services/messageService')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

// --- User action beginning ---

// get all ordered users
router.get('/users', async (req, res) => {
  try {
    res.json(await userService.getPublicUsers(req.query.userId))
  } catch (error) {
    res.status(500).send(error)
  }
})

// get sorted user list
router.get('/sortedusers', async (req, res) => {
  try {
    res.json(await messageService.getUsersSortedByLastMessage(req.query.userId))
  } catch (error) {
    res.status(500).send(error)
  }
})

// get user by userId
router.get('/user', async (req, res) => {
  try {
    res.status(200).json(await userService.findUserById(req.query.userId))
  } catch (error) {
    res.status(500).send(error)
  }
})

// fetch user list from Eventive
router.get('/userlist', async (req, res) => {
  try {
    res.json(await userService.fetchUserlist())
  } catch (error) {
    res.status(500).send(error)
  }
})

// add user
router.post('/adduser', async (req, res) => {
  try {
    await userService.addUser({
      userId: req.body.userId,
      username: req.body.username,
      userEmail: req.body.userEmail,
    })
    res.status(200).send('User added successfully')
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/updatestatus/:userId/', async (req, res) => {
  if (req.body.status) {
    await userService.updateUserStatus(req.params.userId, req.body.status)
    res.status(200).send('User status updated successfully')
  }
  if (req.body.shareInfo) {
    await userService.updateUserPrivacy(req.params.userId, req.body.shareInfo)
    res.status(200).send('User privacy updated successfully')
  }
})

router.post('/userinit', async (req, res) => {
  try {
    await userService.setInitstatus(req.query.userId)
    res.status(200).send('User init status updated successfully')
  } catch (error) {
    res.status(500).status(error)
  }
})

router.post('/addphonenum/:userId/', async (req, res) => {
  try {
    await userService.updateUserPhoneNum(req.params.userId, req.body.phoneNumber)
    res.status(200).send('Phone number added successfully')
  } catch (error) {
    res.status(500).send(error)
  }
})
// --- User action ending ---

// --- Message action beginning ---
router.post('/messages', async (req, res) => {
  try {
    await messageService.addMessage(req.body)
    res.status(200).send('Message added successfully')
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/messages/:msgId', async (req, res) => {
  const msgId = req.params.msgId
  try {
    await messageService.updateMessage(msgId, req.body.text, req.body.read)
    res.status(200).send('Message updated successfully')
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/messages', async (req, res) => {
  const senderId = req.query.senderId
  const receiverId = req.query.receiverId
  const count = req.query.count
  try {
    res.json(
      await messageService.getPrivateMessage(senderId, receiverId, count)
    )
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/messagecount', async (req, res) => {
  const senderId = req.query.senderId
  const receiverId = req.query.receiverId
  try {
    res.json(await messageService.getTotalMessageCount(senderId, receiverId))
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/unreadcount', async (req, res) => {
  const senderId = req.query.senderId
  const receiverId = req.query.receiverId
  try {
    res.json(await messageService.getUnreadMessageCount(senderId, receiverId))
  } catch (error) {
    res.status(500).send(error)
  }
})
// --- Message action ending ---

module.exports = router
