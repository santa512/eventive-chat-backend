const express = require('express')
const router = express.Router()
const userService = require('../services/userService')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.get('/users', async (req, res) => {
  try {
    res.json(await userService.getAllUsers())
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/users/:userId', async (req, res) => {
  try {
    res.status(200).json(await userService.findUserById(req.params.userId))
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/userlist', async (req, res) => {
  try {
    res.json(await userService.fetchUserlist())
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/adduser', async (req, res) => {
  try {
    console.log('!!!!')
    await userService.addUser(req.body)
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

module.exports = router