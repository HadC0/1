const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon');

const bot = new Telegraf('Token');

const users = {};

// Команда /start
bot.start((ctx) => {
  const userId = ctx.message.from.id;

  if (!users[userId]) {
    ctx.reply('Мы вас не знаем, напишите Фамилию Имя.');
  } else {
    ctx.reply('Это бот для учета статуса отсутствия на занятиях. Вот список команд: /start - описание бота и список команд /istatus - указать текущий статус /finfo - список зарегистрированных пользователей');
  }
});

// Команда Istatus
bot.command('istatus', (ctx) => {
  const userId = ctx.message.from.id;

  if (!users[userId]) {
    ctx.reply('Мы вас не знаем, напишите Фамилию Имя.');
  } else {
    ctx.reply('Укажите текущий статус:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Заболел', callback_data: 'Заболел' },
            { text: 'Справка', callback_data: 'Справка' },
            { text: 'Опаздываю', callback_data: 'Опаздывает' }
          ]
        ]
      }
    });
  }
});

bot.action(['Заболел', 'Справка', 'Опаздывает'], (ctx) => {
  const userId = ctx.callbackQuery.from.id;
  const status = ctx.callbackQuery.data;
  const date = DateTime.now().toISODate();

  // Заносим статус в базу данных
  if (!users[userId][date]) {
    users[userId][date] = { status };
  } else {
    users[userId][date].status = status;
  }

  ctx.answerCbQuery('Статус сохранен');
});

// Команда finfo
bot.command('finfo', (ctx) => {
  const date = DateTime.now().toISODate();

  let message = 'Список пользователей со статусами на сегодняшний день:';
  let hasData = false;
  for (const userId in users) {
    if (users[userId][date]) {
      message += `\n${users[userId].name}: ${users[userId][date].status}`;
      hasData = true;
    }
  }

  if (!hasData) {
    message = 'Данных нет';
  }

  ctx.reply(message);
});

bot.on('text', (ctx) => {
  const userId = ctx.message.from.id;
  const text = ctx.message.text;

  if (!users[userId]) {
    users[userId] = { name: text };
    ctx.reply('Спасибо! Теперь вы можете пользоваться ботом. Вот список команд: \n/start - описание бота и список команд\n/istatus - указать текущий статус \n/finfo - список зарегистрированных пользователей со статусами на сегодняшний день');
  }
});

bot.launch();