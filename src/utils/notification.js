const cron = require('node-cron');
const moment = require('moment-timezone');
const eventService = require('../services/eventService');
const { getEventAttendees } = require('../services/userService');
const { addMessage } = require('../services/messageService');

// A map to keep track of dynamically added tasks
const tasks = {};

async function initEventAlert () {
    const events = await eventService.getEvents();
    events.forEach((event) => {
      const localTime = moment.tz(event.eventStartDate, "GMT-0400").tz(moment.tz.guess()).subtract(10, 'minutes'); // Convert to local time zone
      const cronTime = `${localTime.minute()} ${localTime.hour()} ${localTime.date()} ${localTime.month() + 1} *`; // Cron format: minute hour day month *
      
      addTask(event.eventName, cronTime, () => {
        console.log(`Just a quick reminder that ${event.eventName} will be starting in 10 minutes at ${event.location}.`);
        getEventAttendees(event.eventId).then((attendees) => {
          attendees.forEach(attendee => {
            addMessage({
              sender: attendee.id, 
              receiver: attendee.id, 
              text: `Hello, ${attendee.name}! Just a quick reminder that ${event.eventName} will be starting in 10 minutes at ${event.location}. Attendees: ${attendees.map(attendee => attendee.name).join(', ')}`});
          });
      });
    });
})}
// Function to add a new task
const addTask = (taskName, cronTime, taskFunction) => {
  // Check if the task already exists
  if (tasks[taskName]) {
    console.log(`Task ${taskName} already exists. Overwriting...`);
    tasks[taskName].stop();
  }

  // Schedule the new task
  tasks[taskName] = cron.schedule(cronTime, taskFunction);
  console.log(`Task ${taskName} scheduled with cron time ${cronTime}`);
};

// Function to remove a task
const removeTask = (taskName) => {
  if (tasks[taskName]) {
    tasks[taskName].stop();
    delete tasks[taskName];
    console.log(`Task ${taskName} removed.`);
  } else {
    console.log(`Task ${taskName} does not exist.`);
  }
};

// Export the functions
module.exports = {
  initEventAlert,
  addTask,
  removeTask,
};
