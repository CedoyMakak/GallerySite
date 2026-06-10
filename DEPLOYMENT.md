# Инструкция по деплою CARTINA

## Требования

- Node.js 20+ (или Docker)
- Аккаунт Supabase (бесплатный)
- Сервер с Ubuntu 22.04 / Debian (или любой Linux с nginx+pm2)

---

## Шаг 1 — Настройка Supabase

### 1.1 Создать проект
1. Зайдите на [supabase.com](https://supabase.com) → New Project
2. Запишите: **Project URL** и **anon key** (Settings → API)
3. Также скопируйте **service_role key** (Settings → API → под anon key, нажать "Reveal")

> ⚠️ `service_role` ключ имеет полный доступ — никому не передавать, не коммитить в git.

### 1.2 Настроить базу данных
1. Откройте **SQL Editor** в вашем Supabase-проекте
2. Вставьте содержимое файла `supabase/setup.sql` и нажмите **Run**

### 1.3 Настроить хранилище (Storage)
1. Перейдите в **Storage** → **New bucket**
2. Имя: `paintings`, тип: **Public**
3. В разделе **Policies** создайте политику:
   - **Bucket**: paintings
   - **Operation**: INSERT
   - **Role**: anon
   - **Policy definition**: `true`
   - Назовите её `allow_anon_insert`

### 1.4 Отключить паузу (опционально, для активного сайта)
На бесплатном плане Supabase ставит проект на паузу после 7 дней без запросов.
Добавьте бесплатный cron-пинг через [cron-job.org](https://cron-job.org):
- URL: `https://your-project.supabase.co/rest/v1/paintings?select=id&limit=1`
- Заголовок: `apikey: <your-anon-key>`
- Интервал: каждые 3 дня

---

## Шаг 2 — Настройка переменных окружения

Создайте файл `.env.local` в корне проекта (на сервере):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=придумайте-длинный-сложный-пароль
```

> `.env.local` НЕ должен попасть в git (он уже в `.gitignore`).

---

## Шаг 3 — Деплой на VPS-сервер (PM2 + nginx)

### 3.1 На сервере установить зависимости
```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (менеджер процессов)
sudo npm install -g pm2

# nginx
sudo apt install -y nginx
```

### 3.2 Загрузить код
```bash
# Вариант A — через git
git clone https://github.com/ваш-репозиторий/cartina.git /var/www/cartina
cd /var/www/cartina

# Вариант B — скопировать zip через scp
scp cartina.zip user@server:/var/www/
unzip /var/www/cartina.zip -d /var/www/cartina
cd /var/www/cartina
```

### 3.3 Создать .env.local и собрать проект
```bash
nano .env.local
# Вставьте переменные из Шага 2, сохраните (Ctrl+X, Y)

npm install
npm run build
```

### 3.4 Запустить через PM2
```bash
pm2 start npm --name "cartina" -- start
pm2 save
pm2 startup  # следуйте инструкции для автозапуска
```

Проверить: `pm2 status` — должно показать `cartina | online`

### 3.5 Настроить nginx
```bash
sudo nano /etc/nginx/sites-available/cartina
```

Вставьте:
```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cartina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.6 HTTPS (рекомендуется)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

---

## Шаг 4 — Деплой через Docker (альтернатива PM2)

```dockerfile
# Dockerfile уже готов к использованию с Next.js
# Запуск:
docker build -t cartina .
docker run -d -p 3000:3000 --env-file .env.local --name cartina cartina
```

---

## Обновление сайта

```bash
cd /var/www/cartina
git pull              # или загрузить новый zip
npm install
npm run build
pm2 restart cartina
```

---

## Первый вход в админку

1. Откройте `https://ваш-домен.ru/admin`
2. Введите пароль из `ADMIN_PASSWORD` в `.env.local`
3. Заполните профиль художника (имя, биографию, WhatsApp/Telegram)
4. Добавьте первые картины

---

## Суpabase: бесплатный тариф — лимиты

| Параметр | Лимит бесплатно |
|---|---|
| База данных | 500 МБ |
| Хранилище файлов | 1 ГБ |
| Полоса пропускания | 5 ГБ/месяц |
| Автопауза | через 7 дней без запросов |

Для галереи из нескольких сотен картин этого более чем достаточно.
При росте — платный план от $25/мес снимает ограничения.

---

## Частые проблемы

**Сайт не запускается после `npm run build`**
→ Проверьте `.env.local` — должны быть все 4 переменные.

**Ошибка при загрузке картины в админке**
→ Проверьте политику хранилища в Supabase (Шаг 1.3).

**Отзывы нельзя одобрить**
→ Проверьте `SUPABASE_SERVICE_ROLE_KEY` в `.env.local`.

**Страница /admin не открывается**
→ Убедитесь, что Next.js запущен (`pm2 status`) и nginx настроен правильно.
