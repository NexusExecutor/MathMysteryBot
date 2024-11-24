const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

// Токен бота
const API_KEY = '7589673626:AAHW3iTblRyKxCLO795Lsllo62oCwVvC2CU';

// Загадки
const allPuzzles = {
  легкий: [
    { question: "Сколько будет 3 + 5?", answer: "8", hint: "Вспомни, что 3 + 5 = 5 + 3.", image: "Easy.jpg" },
    { question: "Сколько ног у паука?", answer: "8", hint: "Посмотри на картинку паука.", image: "red-black-tarantula.jpg" },
    { question: "Сколько будет 2 + 2?", answer: "4", hint: "Подумай о яблоках!", image: "Easy.jpg" },
    { question: "Какая фигура круглая?", answer: "круг", hint: "Она без углов.", image: "Easy.jpg" },
    { question: "Сколько будет 1 + 1?", answer: "2", hint: "Просто добавь два!", image: "Easy.jpg" },
    { question: "Какой месяц в году самый длинный?", answer: "февраль", hint: "Он может быть не всегда длинным.", image: "Easy.jpg" },
    { question: "Что такое квадратный корень?", answer: "число, которое умножается на себя", hint: "Пример: √9 = 3", image: "Easy.jpg" },
    { question: "Сколько часов в сутки?", answer: "24", hint: "Каждый день одинаковое количество.", image: "Easy.jpg" },
    { question: "Какое число идет после 99?", answer: "100", hint: "Оно следующее после 99.", image: "Easy.jpg" }
  ],
  средний: [
    { question: "Число увеличили в 2 раза, а потом уменьшили на 8. Получилось 20. Что за число?", answer: "14", hint: "Вспомни уравнение: 2x - 8 = 20.", image: "Medium.jpg" },
    { question: "Какая фигура имеет три стороны?", answer: "треугольник", hint: "Подумай о школьной геометрии.", image: "Medium.jpg" },
    { question: "Чему равно 12 * 12?", answer: "144", hint: "Таблица умножения!", image: "Medium.jpg" },
    { question: "Сколько месяцев в году имеют 28 дней?", answer: "12", hint: "Все месяцы имеют 28 дней.", image: "Medium.jpg" },
    { question: "Сколько будет 500 делить на 5?", answer: "100", hint: "Простой пример деления", image: "Medium.jpg" },
    { question: "Какая цифра идет после 4?", answer: "5", hint: "Посмотри на число после 4.", image: "Medium.jpg" },
    { question: "Сколько будет 20 + 15?", answer: "35", hint: "Просто сложи два числа.", image: "Medium.jpg" },
    { question: "Чему равна площадь прямоугольника с длиной 5 и шириной 2?", answer: "10", hint: "Площадь = длина * ширина", image: "Medium.jpg" },
    { question: "Что больше: 300 или 500?", answer: "500", hint: "Сравни два числа.", image: "Medium.jpg" }
  ],
  сложный: [
    { question: "Сколько шагов нужно для решения Ханойской башни с 10 дисками?", answer: "1023", hint: "Вспомни формулу: 2^n - 1.", image: "Hard.jpg" },
    { question: "Какая формула площади круга?", answer: "пи r квадрат", hint: "Используй πr².", image: "Hard.jpg" },
    { question: "Чему равно 2 в степени 10?", answer: "1024", hint: "Подумай о двоичной системе.", image: "Hard.jpg" },
    { question: "Что такое синус 90 градусов?", answer: "1", hint: "Посмотри на тригонометрическую таблицу.", image: "Hard.jpg" },
    { question: "Какой логарифм числа 100 по основанию 10?", answer: "2", hint: "10 в степени 2 = 100", image: "Hard.jpg" },
    { question: "Что будет, если 50 разделить на 10?", answer: "5", hint: "Это простое деление.", image: "Hard.jpg" },
    { question: "Как найти периметр прямоугольника, если длина 4, а ширина 2?", answer: "12", hint: "Периметр = 2 * (длина + ширина)", image: "Hard.jpg" },
    { question: "Чему равен корень из 16?", answer: "4", hint: "Что умножить на себя, чтобы получилось 16?", image: "Hard.jpg" },
    { question: "Что будет, если умножить 25 на 4?", answer: "100", hint: "Это просто умножение.", image: "Hard.jpg" },
    { question: "Сколько квадратных сантиметров в квадрате с длиной стороны 5 см?", answer: "25", hint: "Площадь квадрата = сторона * сторона.", image: "Hard.jpg" }
  ]
};

// Генерация уникальных загадок
const generateUniquePuzzles = () => {
  return Object.fromEntries(
    Object.entries(allPuzzles).map(([level, puzzles]) => [
      level,
      [...puzzles].sort(() => Math.random() - 0.5) // Перемешиваем массив
    ])
  );
};

let currentPuzzles = generateUniquePuzzles(); // Уникальные загадки

// Создание бота
const bot = new TelegramBot(API_KEY, { polling: true });

// Получаем абсолютный путь до папки с картинками
const imagesPath = path.join(__dirname);

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const replyKeyboard = {
    keyboard: [
      ['🟢 Легкий', '🟡 Средний', '🔴 Сложный']
    ],
    one_time_keyboard: true,
    resize_keyboard: true
  };

  // Отправка сообщения с картинкой для уровня "Easy"
  const welcomeImage = path.join(imagesPath, 'Easy.jpg');

  bot.sendPhoto(chatId, welcomeImage, {
    caption: "👋 Привет! Я бот математических загадок. Выбери уровень сложности:",
    reply_markup: replyKeyboard
  });
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
    resize_keyboard: true
  };

  const options = {
    caption: `*Загадка:*\n\n${puzzle.question}`,
    parse_mode: "Markdown",
    reply_markup: replyKeyboard
  };

  const imagePath = path.join(imagesPath, puzzle.image); // Получаем путь до картинки

  // Отправляем картинку и загадку
  bot.sendPhoto(chatId, imagePath, options);
});

// Команда /hint — подсказка
bot.onText(/\/hint/, (msg) => {
  const chatId = msg.chat.id;
  const userState = bot.userState?.[chatId];

  if (userState?.currentPuzzle) {
    bot.sendMessage(chatId, `💡 Подсказка: ${userState.currentPuzzle.hint}`);
  }
});
