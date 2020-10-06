const express = require('express');
const app = express();
const fetch = require("node-fetch");

const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');

const moment =  require('moment');
const api = require('./requests');

const appInfo = require('./package.json');

require('dotenv').config()

app.set('port', (process.env.PORT || 5000));

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  api.getGeneralStatus()
    .then(res => {
      const { data } = res;
      const title = 'Welcome to our service!\n\n';
      const truckersmp = `<b>TruckersMP Version:</b> ${data.name}\n`;
      const ets2 = `<b>ETS2 Supported version:</b> ${data.supported_game_version}\n`;
      const ats = `<b>ATS Supported version:</b> ${data.supported_ats_game_version}\n`;
      const text = `\nType /status for check information about TruckersMP servers or /help to see list of commands.`
      const message = `${title}${truckersmp}${ets2}${ats}${text}`

      return ctx.replyWithHTML(message, Extra.HTML().markup((m) =>
        m.inlineKeyboard(
            [
              [m.callbackButton('📊 Check servers status', '/status')],
              [m.callbackButton('⏰ Game Time', '/time')]
            ]
        )))
    })
    .catch(function (error) {
      console.log(error);
    })
});

bot.command('status', (ctx) => {
  api.getServersStatus()
    .then(function (response) {
      const data = response.data.response;
      const buttons = data.map(i => (
        {
          id: i.id,
          game: `${i.game}:`,
          name: i.name,
          online: i.online ? '🟢' : '🔴',
        }
      ));
      const backLink = { id: '/backLink', game: '🔙', name: 'Back to main screen' }
      buttons.push(backLink);

      return ctx.reply('<b>Choose server for detailed information:</b>', Extra.HTML().markup((m) =>
        m.inlineKeyboard(
          buttons.map(i => {
            return [m.callbackButton(`${i.online} ${i.game} ${i.name}`, i.id)]
          })
        )))
        ctx.answerCbQuery();
    })
    .catch(function (error) {
      console.log(error);
    })
})

bot.command('time', ctx => {
  api.getGameTime()
    .then(response => response.json())
    .then(res => {
      const time = moment(res.response.calculated_game_time).subtract(3, 'hours').format('HH:mm, dddd');
      const info = '\n\nℹ️ Game time is expressed in minutes, where 10 real seconds is 1 minute of in-game time. It is number of minutes since 2015-25-10 15:48:32 CET.';
      const message = `⏱️ Time on servers: ${time}${info}`;
      return ctx.replyWithHTML(message, Extra.HTML().markup((m) =>
          m.inlineKeyboard(
      [m.callbackButton('🔙' + ' ' +
          'Back', '/backLink')]
          )));
    })
    .catch(err => {
      console.error(err);
    })
})

bot.on('callback_query', (ctx) => {
  if (ctx.callbackQuery.data === '/backLink') {
    api.getGeneralStatus()
    .then(res => {
      const { data } = res;
      const title = 'Welcome to our service!\n\n';
      const truckersmp = `<b>TruckersMP Version:</b> ${data.name}\n`;
      const ets2 = `<b>ETS2 Supported version:</b> ${data.supported_game_version}\n`;
      const ats = `<b>ATS Supported version:</b> ${data.supported_ats_game_version}\n`;
      const text = `\nType /status for check information about TruckersMP servers or /help to see list of commands.`
      const message = `${title}${truckersmp}${ets2}${ats}${text}`

      return ctx.replyWithHTML(message, Extra.HTML().markup((m) =>
        m.inlineKeyboard(
          [
            [m.callbackButton('📊 Check servers status', '/status')],
            [m.callbackButton('⏰ Game Time', '/time')]
          ]
        )))
    })
    .catch(function (error) {
      console.log(error);
    })

    ctx.answerCbQuery();
  }

  if (ctx.callbackQuery.data === '/time') {
    api.getGameTime()
      .then(response => response.json())
      .then(res => {
      const time = moment(res.response.calculated_game_time).subtract(3, 'hours').format('HH:mm, dddd');
      const info = '\n\nℹ️ Game time is expressed in minutes, where 10 real seconds is 1 minute of in-game time. It is number of minutes since 2015-25-10 15:48:32 CET.';
        const message = `⏱️ Time on servers: ${time}${info}`;
        return ctx.replyWithHTML(message, Extra.HTML().markup((m) =>
          m.inlineKeyboard(
            [m.callbackButton('🔙' + ' ' +
                'Back', '/backLink')]
          )));
      })
      .catch(err => {
        console.error(err);
      })

    ctx.answerCbQuery();
  }

  if (ctx.callbackQuery.data === '/status') {
    api.getServersStatus()
    .then(function (response) {
      const data = response.data.response;
      const buttons = data.map(i => (
        {
          id: i.id,
          game: `${i.game}:`,
          name: i.name,
          online: i.online ? '🟢' : '🔴',
        }
      ));
      const backLink = { online: '', id: '/backLink', game: '🔙', name: 'Back to main screen' };
      buttons.push(backLink);

      return ctx.reply('<b>Choose server for detailed information:</b>', Extra.HTML().markup((m) =>
        m.inlineKeyboard(
          buttons.map(i => {
            return [m.callbackButton(`${i.online} ${i.game} ${i.name}`, i.id)]
          })
        )))
        ctx.answerCbQuery();
    })
    .catch(function (error) {
      console.log(error);
    })

    ctx.answerCbQuery();
  }

  api.getServersStatus()
    .then(function (response) {
      const data = response.data.response;

      const serverInfo = data.filter(i => i.id === Number(ctx.callbackQuery.data));
      const isValid = !!serverInfo[0];

      if (!isValid) {
        return false;
      }

      const onlineIcon = serverInfo[0].online ? '🟢' : '🔴';
      const messageTitle = `<b>${onlineIcon} ${serverInfo[0].game}: ${serverInfo[0].name}</b>\n\n`
      const playersCount = `Players Online: ${serverInfo[0].players} / ${serverInfo[0].maxplayers}`;
      const queue = serverInfo[0].queue > 0 ? `\n\nQueue: ${serverInfo[0].queue}` : '';
      const speedlimiter = serverInfo[0].speedlimiter === 1
          ? `\n\nSpeedLimit: ${serverInfo[0].game === 'ETS2' ? '110 km/h ⚠️': '80 mph ⚠️'}`
          : `\n\nSpeedLimit: disabled`;
      const collisions = serverInfo[0].collisions ? "\n\nCollisions enabled" : '';
      const carsEnabled = serverInfo[0].carsforplayers ? '\n\nCars for players: enabled' : '';
      const ipAddress = `\n\n<code>${serverInfo[0].ip}:${serverInfo[0].port}</code>`;

      const message = `${messageTitle}${playersCount}${queue}${speedlimiter}${collisions}${ipAddress}`;

      return ctx.replyWithHTML(message, Extra.HTML().markup((m) =>
        m.inlineKeyboard(
          [m.callbackButton('🔙' + ' ' +
              'Back to servers list', '/status')]
        )));
    })
    .catch(function (error) {
      console.log(error);
    })

    ctx.answerCbQuery();
})

bot.command('about', (ctx) => {
  return ctx.replyWithHTML(`Telegram bot for check actual info about TruckersMP services.\n\nAuthor: Pavel Kuzyakin\n\nRepo: https://github.com/iposho/truckersmp-status-bot`, Extra.webPreview(false));
})

bot.command('help', (ctx) => {
  return ctx.replyWithHTML(`<b>List of commands:</b>\n\n/start - Start bot\n\n/status - Check Servers Status\n\n\/time - Check game time on servers\n\n/help - List of commands\n\n/about - About this bot`);
})


bot.launch();


app.get('/mp', function(request, response) {
  const result = `<pre>🚀 ${appInfo.name} is running.\n\nversion ${appInfo.version}</pre>`
  response.send(result);
}).listen(app.get('port'), function() {
  console.log(`🚀 ${appInfo.name} running, server is listening on port`, app.get('port'));
});
