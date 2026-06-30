const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Разрешаем запросы с любых доменов (для вашей админки)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Настройка хранения файлов (куда и как сохранять загруженный APK)
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, __dirname); // Сохраняем в корень сервера
  },
  filename: (req, file, cb) => { 
    cb(null, 'Kot-vps.apk'); // Всегда переименовываем в Kot-vps.apk
  }
});
const upload = multer({ storage: storage });

// 1. Маршрут для загрузки нового АРК (из админки)
app.post('/upload-apk', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('Файл не загружен');
  
  // Обновляем статистику в файле (сбрасываем счетчик скачиваний)
  const data = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
  data.downloads = 0;
  fs.writeFileSync('stats.json', JSON.stringify(data, null, 2));
  
  res.send('АРК успешно заменен!');
});

// 2. Маршрут для получения статистики (для админки)
app.get('/get-stats', (req, res) => {
  const data = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
  res.json(data);
});

// 3. Маршрут для сброса статистики
app.post('/reset-stats', (req, res) => {
  const data = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
  data.android = 0;
  data.ios = 0;
  data.windows = 0;
  data.mac = 0;
  data.downloads = 0;
  fs.writeFileSync('stats.json', JSON.stringify(data, null, 2));
  res.send('Статистика сброшена!');
});

// 4. РАЗРЕШАЕМ ОТДАВАТЬ APK ФАЙЛ ПО ПРЯМОЙ ССЫЛКЕ (Исправление ошибки)
app.get('/Kot-vps.apk', (req, res) => {
    const filePath = path.join(__dirname, 'Kot-vps.apk');
    
    // Проверяем, существует ли файл перед отправкой
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'Kot-vps.apk', (err) => {
            if (err) {
                console.log('Ошибка при скачивании:', err);
                // Если ошибка, просто игнорируем, так как браузер уже мог начать загрузку
            }
        });
    } else {
        res.status(404).send('Файл не найден. Загрузите APK через админ-панель.');
    }
});

// 5. Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  
  // Создаём файл статистики при первом запуске, если его нет
  if (!fs.existsSync('stats.json')) {
    const initData = { 
        android: 0, 
        ios: 0, 
        windows: 0, 
        mac: 0, 
        downloads: 0 
    };
    fs.writeFileSync('stats.json', JSON.stringify(initData, null, 2));
  }
});
