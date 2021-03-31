const moment = require('moment');

const getGeneralStatusMessage = (data) => {
  const title = 'Welcome to our service!\n\n';
  const truckersmp = `<b>TruckersMP Version:</b> ${data.name}\n`;
  const ets2 = `<b>ETS2 Supported version:</b> ${data.supported_game_version}\n`;
  const ats = `<b>ATS Supported version:</b> ${data.supported_ats_game_version}\n`;
  const text = '\nType /status for check information about TruckersMP servers or /help to see list of commands.';
  const message = `${title}${truckersmp}${ets2}${ats}${text}`;

  return message;
};

const getStatusButtons = (data) => {
  const buttons = data.map((i) => (
    {
      id: i.id,
      game: `${i.game}:`,
      name: i.name,
      online: i.online ? '🟢' : '🔴',
    }
  ));
  const backLink = {
    id: '/backLink', game: '🔙', name: 'Back to main screen', online: '',
  };
  buttons.push(backLink);

  return buttons;
};

const getServerStatusMessage = (serverInfo) => {
  const onlineIcon = serverInfo[0].online ? '🟢' : '🔴';
  const messageTitle = `<b>${onlineIcon} ${serverInfo[0].game}: ${serverInfo[0].name}</b>\n\n`;
  const playersCount = `Players Online: ${serverInfo[0].players} / ${serverInfo[0].maxplayers}`;
  const queue = serverInfo[0].queue > 0 ? `\n\nQueue: ${serverInfo[0].queue}` : '';
  const speedlimiter = serverInfo[0].speedlimiter === 1
    ? `\n\nSpeedLimit: ${serverInfo[0].game === 'ETS2' ? '110 km/h ⚠️' : '80 mph ⚠️'}`
    : '\n\nSpeedLimit: disabled';
  const collisions = serverInfo[0].collisions ? '\n\nCollisions enabled' : '';
  const carsEnabled = serverInfo[0].carsforplayers ? '\n\nCars for players: enabled' : '';
  const ipAddress = `\n\n<code>${serverInfo[0].ip}:${serverInfo[0].port}</code>`;

  const message = `${messageTitle}${playersCount}${queue}${speedlimiter}${collisions}${ipAddress}`;

  return message;
};

const getTimeMessage = (date) => {
  const time = moment(date).format('HH:mm, dddd');
  const info = '\n\nℹ️ Game time is expressed in minutes, where 10 real seconds is 1 minute of in-game time. It is number of minutes since 2015-25-10 15:48:32 CET.';
  const message = `⏱️ Time on servers: ${time}${info}`;

  return message;
};

const getBackLinkMessage = (data) => {
  const title = 'Welcome to our service!\n\n';
  const truckersmp = `<b>TruckersMP Version:</b> ${data.name}\n`;
  const ets2 = `<b>ETS2 Supported version:</b> ${data.supported_game_version}\n`;
  const ats = `<b>ATS Supported version:</b> ${data.supported_ats_game_version}\n`;
  const text = '\nType /status for check information about TruckersMP servers or /help to see list of commands.';
  const message = `${title}${truckersmp}${ets2}${ats}${text}`;

  return message;
};

module.exports = {
  getGeneralStatusMessage,
  getStatusButtons,
  getTimeMessage,
  getBackLinkMessage,
  getServerStatusMessage,
};
