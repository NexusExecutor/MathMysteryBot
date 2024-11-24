const TelegramBot = require('node-telegram-bot-api');

// Токен бота
const API_KEY = '7589673626:AAHW3iTblRyKxCLO795Lsllo62oCwVvC2CU';

// Загадки
const allPuzzles = {
  легкий: [
    {
      question: "Сколько будет 3 + 5?",
      answer: "8",
      hint: "Вспомни, что 3 + 5 = 5 + 3.",
      image: "Easy.jpg",
    },
    {
      question: "Сколько ног у паука?",
      answer: "8",
      hint: "Посмотри на картинку паука.",
      image: "red-black-tarantula.jpg",
    },
    // Добавьте больше загадок для лёгкого уровня
    { question: "Сколько будет 2 + 2?", answer: "4", hint: "Подумай о яблоках!", image: "Easy.jpg" },
    { question: "Какая фигура круглая?", answer: "круг", hint: "Она без углов.", image: "Easy.jpg" },
  ],
  средний: [
    {
      question: "Число увеличили в 2 раза, а потом уменьшили на 8. Получилось 20. Что за число?",
      answer: "14",
      hint: "Вспомни уравнение: 2x - 8 = 20.",
      image: "Medium.jpg",
    },
    {
      question: "Какая фигура имеет три стороны?",
      answer: "треугольник",
      hint: "Подумай о школьной геометрии.",
      image: "Medium.jpg",
    },
    // Добавьте больше загадок для среднего уровня
    { question: "Чему равно 12 * 12?", answer: "144", hint: "Таблица умножения!", image: "Medium.jpg" },
    { question: "Сколько месяцев в году имеют 28 дней?", answer: "12", hint: "Все месяцы имеют 28 дней.", image: "Medium.jpg" },
  ],
  сложный: [
    {
      question: "Сколько шагов нужно для решения Ханойской башни с 10 дисками?",
      answer: "1023",
      hint: "Вспомни формулу: 2^n - 1.",
      image: "Hard.jpg",
    },
    {
      question: "Какая формула площади круга?",
      answer: "пи r квадрат",
      hint: "Используй πr².",
      image: "Hard.jpg",
    },
    // Добавьте больше загадок для сложного уровня
    { question: "Чему равно 2 в степени 10?", answer: "1024", hint: "Подумай о двоичной системе.", image: "Hard.jpg" },
    { question: "Что такое синус 90 градусов?", answer: "1", hint: "Посмотри на тригонометрическую таблицу.", image: "Hard.jpg" },
  ],
};

// Генерация уникальных загадок
const generateUniquePuzzles = () => {
  return Object.fromEntries(
    Object.entries(allPuzzles).map(([level, puzzles]) => [
      level,
      [...puzzles].sort(() => Math.random() - 0.5), // Перемешиваем массив
    ])
  );
};

let currentPuzzles = generateUniquePuzzles(); // Уникальные загадки

// Создание бота
const bot = new TelegramBot(API_KEY, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const replyKeyboard = {
    keyboard: [
      ['🟢 Легкий', '🟡 Средний', '🔴 Сложный'],
    ],
    one_time_keyboard: true,
    resize_keyboard: true,
  };

  bot.sendMessage(
    chatId,
    "👋 Привет! Я бот математических загадок. Выбери уровень сложности:",
    { reply_markup: replyKeyboard }
  );
});

// Выбор сложности
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const difficultyMap = { '🟢 Легкий': 'легкий', '🟡 Средний': 'средний', '🔴 Сложный': 'сложный' };
  const difficulty = difficultyMap[msg.text];

  if (difficulty) {
    bot.sendMessage(chatId, `Ты выбрал уровень: ${msg.text}.\nНапиши /quiz, чтобы получить загадку!`);
    bot.userState = bot.userState || {};
    bot.userState[chatId] = { difficulty, currentPuzzle: null };
  }
});

// Команда /quiz — отправка загадки
bot.onText(/\/quiz/, (msg) => {
  const chatId = msg.chat.id;
  const userState = bot.userState?.[chatId];

  if (!userState || !userState.difficulty) {
    bot.sendMessage(chatId, "❌ Сначала выбери уровень сложности с помощью команды /start.");
    return;
  }

  const difficulty = userState.difficulty;

  if (!currentPuzzles[difficulty].length) {
    bot.sendMessage(chatId, "❌ Загадки этого уровня закончились! Выбери другой уровень сложности.");
    return;
  }

  const puzzle = currentPuzzles[difficulty].shift(); // Получаем первую загадку
  userState.currentPuzzle = puzzle;

  const replyKeyboard = {
    keyboard: [['💡 Подсказка', '➡️ Следующая загадка']],
    one_time_keyboard: true,
    resize_keyboard: true,
  };

  const options = {
    caption: `*Загадка:*\n\n${puzzle.question}`,
    parse_mode: "Markdown",
    reply_markup: replyKeyboard,
  };

  if (puzzle.image) {
    bot.sendPhoto(chatId, puzzle.image, options).catch(() => {
      bot.sendMessage(chatId, `*Загадка:*\n\n${puzzle.question}`, options);
    });
  } else {
    bot.sendMessage(chatId, `*Загадка:*\n\n${puzzle.question}`, options);
  }
});

// Проверка ответа
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userState = bot.userState?.[chatId];

  if (!userState || !userState.currentPuzzle) return;

  const puzzle = userState.currentPuzzle;
  const userAnswer = msg.text.trim().toLowerCase();

  if (userAnswer === "💡 подсказка") {
    bot.sendMessage(chatId, `💡 Подсказка: ${puzzle.hint}`);
  } else if (userAnswer === "➡️ следующая загадка") {
    bot.emit('text', { text: "/quiz", chat: { id: chatId } });
  } else if (userAnswer === puzzle.answer.toLowerCase()) {
    bot.sendMessage(chatId, "✅ Правильно! Напиши /quiz, чтобы получить следующую загадку.");
    userState.currentPuzzle = null;
  } else {
    bot.sendMessage(chatId, "❌ Неправильно! Попробуй снова.");
  }
});
