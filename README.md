# Книга рецептов

Учебный проект по практике: веб-приложение с использованием Firebase Firestore и Authentication.

## Стек

- Vanilla JavaScript (ES6 modules)
- HTML5, CSS3
- Firebase Firestore
- Firebase Authentication

## Функционал

- Регистрация, вход, выход, роли `user` / `admin`
- Каталог рецептов с поиском, фильтром по категории, сортировкой и пагинацией
- Страница детального просмотра рецепта
- Отзывы к рецептам (добавление, редактирование и удаление своих, real-time обновление)
- Избранное (добавление/удаление рецептов, отдельная страница)
- Личный кабинет: редактирование профиля, история своих отзывов
- Админ-панель: CRUD рецептов, управление ролями пользователей, модерация отзывов
- Восстановление пароля
- Firebase Security Rules для всех коллекций

## Структура базы данных

### `recipes/{autoId}`
| Поле | Тип | Описание |
|---|---|---|
| title | string | Название рецепта |
| category | string | "Завтраки" \| "Обеды" \| "Ужины" \| "Десерты" |
| image | string | URL изображения |
| ingredients | array\<string\> | Список ингредиентов |
| instructions | string | Инструкция приготовления |

### `users/{uid}`
| Поле | Тип | Описание |
|---|---|---|
| username | string | Имя пользователя |
| email | string | Email |
| role | string | "user" \| "admin" |

### `comments/{autoId}`
| Поле | Тип | Описание |
|---|---|---|
| recipeId | string | Ссылка на `recipes/{id}` |
| userId | string | Ссылка на `users/{uid}` |
| username | string | Дублируется из `users` для быстрого вывода |
| text | string | Текст отзыва |
| createdAt | timestamp | Дата создания |

### `favorites/{autoId}`
| Поле | Тип | Описание |
|---|---|---|
| recipeId | string | Ссылка на `recipes/{id}` |
| userId | string | Ссылка на `users/{uid}` |
| createdAt | timestamp | Дата добавления |

**Связи:** `comments.recipeId` / `favorites.recipeId` → `recipes`; `comments.userId` / `favorites.userId` → `users`. Все связи — по id документа, без вложенных подколлекций.

## Security Rules

Доступ разграничен по ролям:
- `recipes` — чтение всем, запись только `admin`
- `users` — пользователь читает/редактирует только свой документ, `admin` — любой
- `comments` — чтение всем, создание авторизованным пользователям от своего имени, редактирование/удаление — автору или `admin`
- `favorites` — чтение/создание/удаление только своих записей
