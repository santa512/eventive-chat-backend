const cron = require('node-cron');
const moment = require('moment-timezone');
const eventService = require('../services/eventService');

// A map to keep track of dynamically added tasks
const tasks = {};

async function initEventAlert () {
    const events = await eventService.getEvents();
    for (const event of events) {
        const eventTime = moment(event.time).tz('America/New_York');
        const eventDate = eventTime.format('YYYY-MM-DD');
        const eventTimeOfDay = eventTime.format('HH:mm');
    }
}

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
  addTask,
  removeTask,
};
