const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const stripeScript = document.createElement('script')
stripeScript.type = 'text/javascript'
stripeScript.src = 'https://js.stripe.com/v3/'

const eventiveScript = document.createElement('script')
eventiveScript.type = 'text/javascript'
eventiveScript.src = 'https://doubleexposure24.eventive.org/loader.js'
document.head.appendChild(stripeScript)
document.head.appendChild(eventiveScript)

eventiveScript.onload = function () {
  // Your code that uses the Eventive object goes here
  Eventive.on('ready', () => {
    // Eventive Everywhere has been fully initialized!
    // It's safe to use login status methods now.
    if (window.Eventive.isLoggedIn()) {
      initializeChat()
    } else if (!window.Eventive.isLoggedIn()) {
      const eventiveLoginDiv = document.createElement('div')
      eventiveLoginDiv.classList.add('eventive-login')
      document.body.appendChild(eventiveLoginDiv)
      // window.location.href = '/login?next=%2Fchat';
    }
  })
}

const intervalId = setInterval(function () {
  // Your code that uses the Eventive object goes here
  Eventive.on('ready', () => {
    // Eventive Everywhere has been fully initialized!
    // It's safe to use login status methods now.
    if (window.Eventive.isLoggedIn()) {
      clearInterval(intervalId)
      initializeChat()
    }
  })
}, 1000)

function initializeChat() {
  const username = Eventive.getPersonDetails().name
  const room = 'Double Exposure 24'
  const socket = io('https://real-time-chat-application-master.vercel.app:443')

  // Join chatroom
  socket.emit('joinRoom', { username, room })
  // get room and users
  socket.on('roomUsers', ({ room, users, attendees }) => {
    console.log('user list : ' + attendees)
    outputRoomName(room)
    outputUsers(users, attendees, username)
  })

  // message from server
  socket.on('message', (message) => {
    // console.log(message);
    outputMessage(message)

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
  })

  // message submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // get message text
    const msg = e.target.elements.msg.value

    // emit message to server
    socket.emit('chatMessage', msg)

    // clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
  })
}

// output message to DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
   <p class="text">
      ${message.text}
   </p>`

  document.querySelector('.chat-messages').appendChild(div)
}

// add room name to DOM
function outputRoomName(room) {
  roomName.innerHTML = room
}

// add users to DOM
function outputUsers(users, attendees, username) {
  // userList.innerHTML = `${users.map((user) => `<li>${user.username}</li>`).join('')}`;
  userList.innerHTML = `${attendees
    .map(
      (user) =>
        `<li class="${user === username ? 'current-user' : ''}">${user}</li>`
    )
    .join('')}`
}

function show_userlist() {
  const chatSidebar = document.getElementsByClassName('chat-sidebar')[0]
  const chatMain = document.getElementsByClassName('chat-main')[0]
  const chatMessages = document.getElementsByClassName('chat-messages')[0]

  if (chatSidebar.style.display === 'block') {
    chatSidebar.style.display = 'none'
    chatSidebar.style.width = '25%'
    chatMain.style.display = 'block'
    chatMessages.style.display = 'block'
  } else {
    if (window.innerWidth > 500) {
      chatSidebar.style.display = 'block'
      chatMain.style.display = 'grid'
      chatSidebar.style.width = '100%'
    } else {
      chatSidebar.style.display = 'block'
      chatMessages.style.display = 'none'
      chatSidebar.style.width = '100%'
    }
  }
}
