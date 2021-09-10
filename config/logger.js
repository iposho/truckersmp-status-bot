const fs = require('fs');
const path = require('path');
const moment = require('moment');

const usersLogPath = path.join(__dirname, '../log/users.log');
const errorLogPath = path.join(__dirname, '../log/error.log');

const addEntryToUserLog = (update) => {
  const timestamp = moment().format('HH:mm:ss DD.MM.YYYY');
  const { message } = update;
  const user = message.from;
  const userInfo = `ID: ${user.id} | Name: ${user.first_name} ${user.last_name}| Username: @${user.username} | LC: ${user.language_code}`;
  const string = `${timestamp.toString()} ${userInfo}\n`;

  fs.appendFileSync(usersLogPath, string);
};

const addEntryToErrorLog = (error) => {
  const timestamp = moment().format('HH:mm:ss DD.MM.YYYY');
  const string = `${timestamp.toString()} ${error}\n`;

  fs.appendFileSync(errorLogPath, string);
};

module.exports = {
  addEntryToUserLog,
  addEntryToErrorLog,
};
