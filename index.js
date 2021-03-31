const express = require('express');

const app = express();

// Telegraf's imports
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');

//  Tools
const api = require('./config/requests');
const logger = require('./config/logger');
const messages = require('./config/messages');
const strings = require('./config/strings');

const { name, version } = require('./package.json');

require('dotenv').config();

// Init app
app.set('port', (process.env.PORT || 5000));

// Init bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  logger.addEntryToUserLog(ctx.update);

  api.getGeneralStatus()
    .then((res) => {
      const { data } = res;
      const message = messages.getGeneralStatusMessage(data);

      return ctx.replyWithHTML(message, Extra.HTML().markup((m) => m.inlineKeyboard(
        [
          [m.callbackButton('📊 Check servers status', '/status')],
          [m.callbackButton('⏰ Game Time', '/time')],
        ],
      )));
    })
    .catch((error) => {
      logger.addEntryToErrorLog(error);
    });
});

bot.command('status', (ctx) => {
  api.getServersStatus()
    .then((response) => {
      const data = response.data.response;
      const buttons = messages.getStatusButtons(data);

      return ctx.reply('<b>Choose server for detailed information:</b>',
        Extra.HTML().markup((m) => m.inlineKeyboard(
          buttons.map(
            (i) => [m.callbackButton(`${i.online} ${i.game} ${i.name}`, i.id)],
          ),
        )));
    })
    .catch((error) => {
      logger.addEntryToErrorLog(error);
    });
});

bot.command('time', (ctx) => {
  api.getGameTime()
    .then((response) => response.json())
    .then((res) => {
      const time = res.response.calculated_game_time;
      const message = messages.getTimeMessage(time);

      return ctx.replyWithHTML(message,
        Extra.HTML().markup((m) => m.inlineKeyboard(
          [m.callbackButton('\uD83D\uDD19 Back', '/backLink')],
        )));
    })
    .catch((err) => {
      logger.addEntryToErrorLog(err);
    });
});

bot.on('callback_query', (ctx) => {
  if (ctx.callbackQuery.data === '/backLink') {
    api.getGeneralStatus()
      .then((res) => {
        const { data } = res;
        const message = messages.getBackLinkMessage(data);

        return ctx.replyWithHTML(message,
          Extra.HTML().markup((m) => m.inlineKeyboard(
            [
              [m.callbackButton('📊 Check servers status', '/status')],
              [m.callbackButton('⏰ Game Time', '/time')],
            ],
          )));
      })
      .catch((error) => {
        logger.addEntryToErrorLog(error);
      });

    ctx.answerCbQuery();
  }

  if (ctx.callbackQuery.data === '/time') {
    api.getGameTime()
      .then((response) => response.json())
      .then((res) => {
        const time = res.response.calculated_game_time;
        const message = messages.getTimeMessage(time);

        return ctx.replyWithHTML(message,
          Extra.HTML().markup((m) => m.inlineKeyboard(
            [m.callbackButton('\uD83D\uDD19 Back', '/backLink')],
          )));
      })
      .catch((err) => {
        logger.addEntryToErrorLog(err);
      });

    ctx.answerCbQuery();
  }

  if (ctx.callbackQuery.data === '/status') {
    api.getServersStatus()
      .then((response) => {
        const data = response.data.response;
        const buttons = messages.getStatusButtons(data);

        return ctx.reply('<b>Choose server for detailed information:</b>',
          Extra.HTML().markup((m) => m.inlineKeyboard(
            buttons.map(
              (i) => [
                m.callbackButton(`${i.online} ${i.game} ${i.name}`,
                  i.id)],
            ),
          )));
      })
      .catch((error) => {
        logger.addEntryToErrorLog(error);
      });

    ctx.answerCbQuery();
  }

  api.getServersStatus()
    .then((response) => {
      const data = response.data.response;

      const serverInfo = data.filter((i) => Number(ctx.callbackQuery.data)
          === i.id);
      const isValid = !!serverInfo[0];

      if (!isValid) {
        return false;
      }

      const message = messages.getServerStatusMessage(serverInfo);

      return ctx.replyWithHTML(message,
        Extra.HTML().markup((m) => m.inlineKeyboard(
          [m.callbackButton('\uD83D\uDD19 Back to servers list', '/status')],
        )));
    })
    .catch((error) => {
      logger.addEntryToErrorLog(error);
    });

  ctx.answerCbQuery();
});

bot.command('about', (ctx) => ctx.replyWithHTML(strings.aboutString, Extra.webPreview(false)));

bot.command('help', (ctx) => ctx.replyWithHTML(strings.helpString));

// Launch bot
bot.launch();

app.get('/mp', (request, response) => {
  const result = `<pre>🚀 ${name} is running.\n\nversion ${version}</pre>`;
  response.send(result);
}).listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 ${name} running, server is listening on port`, app.get('port'));
});
