
## Endpoints for user:
```bash
api/v1/user/sign-in    POST
api/v1/user/sign-up    POST
api/v1/admin/users     GET
api/v1/auth/user-info  GET
api/v1/auth/logout     DELETE
```

# Bala Project

Birlik Bala - веб-платформа для курсов и чек-листов по развитию детей.

## Архитектура

- **Backend**: Go (Gin) + PostgreSQL
- **Frontend**: Next.js + React
- **Деплой**: Docker + Docker Compose

## Быстрый старт

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd bala
```

2. **Настройте переменные окружения:**
```bash
# Скопируйте и настройте основные переменные
cp .env.example .env

# Настройте переменные для фронтенда
cp birlik-bala-website/.env.example birlik-bala-website/.env
```

3. **Запустите проект:**
```bash
# Используйте Makefile (рекомендуется)
make build && make up

# Или напрямую через docker-compose
docker-compose up --build
```

4. **Проверьте доступность:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health check: http://localhost:3000/api/health

## Команды Makefile

```bash
make build      # Собрать все Docker образы
make up         # Запустить сервисы
make down       # Остановить сервисы
make restart    # Перезапустить сервисы
make logs       # Показать логи всех сервисов
make clean      # Очистить Docker систему
make rebuild    # Полная пересборка
```

## Разработка

### Локальная разработка фронтенда
```bash
cd birlik-bala-website
pnpm install
pnpm dev
```

### Логи отдельных сервисов
```bash
make frontend-logs  # Логи фронтенда
make backend-logs   # Логи бэкенда
make db-logs        # Логи базы данных
```

## API Документация

### Пользователи
- `POST /api/v1/user/sign-in` - Вход пользователя
- `POST /api/v1/user/sign-up` - Регистрация пользователя
- `GET /api/v1/admin/users` - Получить всех пользователей (админ)
- `GET /api/v1/auth/user-info` - Получить информацию о текущем пользователе
- `DELETE /api/v1/auth/logout` - Выход

### Чек-листы
- `POST /api/v1/admin/checklist/create` - Создать чек-лист (админ)
- `PUT /api/v1/admin/checklist/update` - Обновить чек-лист (админ)
- `GET /api/v1/checklist/get` - Получить все чек-листы
- `GET /api/v1/checklist/get/:id` - Получить чек-лист по ID
- `DELETE /api/v1/admin/checklist/:id` - Удалить чек-лист (админ)

### Статьи
- `POST /api/v1/admin/article/create` - Создать статью (админ)
- `PUT /api/v1/admin/article/update` - Обновить статью (админ)
- `GET /api/v1/article/get` - Получить все статьи
- `GET /api/v1/article/get/:id` - Получить статью по ID
- `DELETE /api/v1/admin/article/:id` - Удалить статью (админ)

### Курсы
- `POST /api/v1/admin/course/create` - Создать курс (админ)
- `PUT /api/v1/admin/course/update` - Обновить курс (админ)
- `GET /api/v1/course/get` - Получить все курсы
- `GET /api/v1/course/get/:id` - Получить курс по ID
- `DELETE /api/v1/admin/course/:id` - Удалить курс (админ)
- `POST /api/v1/admin/course/addvideo` - Добавить видео к курсу (админ)
- `POST /api/v1/admin/course/give-access` - Дать доступ к курсу (админ)
- `POST /api/v1/admin/course/take-access` - Забрать доступ к курсу (админ)

## Структура проекта

```
/
├── backend/              # Go backend
│   ├── cmd/main.go      # Точка входа
│   ├── internal/        # Внутренняя логика
│   └── pkg/             # Переиспользуемые пакеты
├── birlik-bala-website/ # Next.js frontend
│   ├── app/             # App Router
│   ├── components/      # React компоненты
│   └── lib/             # Утилиты
├── docker-compose.yml   # Docker Compose конфигурация
└── Makefile            # Команды для разработки
```

## Endpoints for checklists:
```bash
api/v1/admin/checklist/create  CREATE
api/v1/admin/checklist/update  UPDATE
api/v1/checklist/get           GET ALL
api/v1/checklist/get/:id       GET BY ID
api/v1/admin/checklist/:id     DELETE BY ID
```

## Requests for checklists:
```bash
POST: CREATE

{
    "title": "",
    "description": "",
    "forAge": ,
    "slug": ""
}

PUT: UPDATE

{
    "title": "",
    "description": "",
    "forAge": ,
    "slug": ""
}
```

## Endpoints for articles:
```bash
api/v1/admin/article/create    CREATE
api/v1/admin/article/update    UPDATE
api/v1/article/get             GET ALL
api/v1/article/get/:id         GET BY ID
api/v1/admin/article/:id       DELETE BY ID
```

## Requests for articles:
```bash

POST: CREATE

{
    "title": "",
    "content": "",
    "category": "АФК", "Сенсорные игры", "Коммуникативные игры", "Нейроигры",
    "author": "",
    "readTime": ,
    "slug": ""
}

PUT: UPDATE

{
    "title": "",
    "content": "",
    "category": "АФК", "Сенсорные игры", "Коммуникативные игры", "Нейроигры",
    "author": "",
    "readTime": ,
    "slug": ""
}
```

## Endpoints for courses:
```bash

api/v1/admin/course/create            CREATE
api/v1/admin/course/update            UPDATE
api/v1/admin/course/:id               DELETE BY ID
api/v1/auth/course/get/:id            GET BY ID
api/v1/auth/course/get                GET ALL
api/v1/auth/course/get-with-access    GET 
api/v1/admin/course/add-video         POST
api/v1/admin/course/give-access       POST
api/v1/admin/course/take-away-access  POST
``` 

## Requests for courses:
```bash
POST:

FORM-DATA: CREATE
    "title": "",
    "description": "",
    "cost": ,
    "diploma": file,
    "diploma_x": ,
    "diploma_y": ,
    "img": file

PUT:

FORM-DATA: UPDATE
    "title": "",
    "description": "",
    "cost": ,
    "img": file

POST: ADD-VIDEO
    "course_id": ,
    "videos": file,
    "file": file,
    "title": "",

POST: TAKE-AWAY-ACCESS
    "course_id": ,

POST: GIVE-ACCESS
    "course_id": ,
    "user_id": ,
```

Backend start:
```bash

    cd/backend
    docker compose -up --build

```