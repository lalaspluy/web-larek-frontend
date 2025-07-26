# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Данные и типы данных, используемые в приложении

Продукт

```

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number;
}

```

Элемент корзины

```

export type TBasketItem = Pick<IProduct, 'id' | 'title' | 'price'>;

```

Элемент каталога

```

export type TCatalogItem = Pick<IProduct, 'id' | 'title' | 'price' | 'image' | 'category'>;

```

Первый шаг оформления заказа

```

export interface IOrderFormFirst {
  payment: string;
  address: string;
}

```

Второй шаг оформления заказа

```

export interface IOrderFormSecond {
  email: string;
  phone: string;
}

```

Заказ

```

export interface IOrder extends IOrderFormFirst, IOrderFormSecond {
  total: number;
  items: string[];
}

```

Ошибка

```

export type TFormErrors = Partial<Record<keyof IOrder, string>;

```

Результат заказа

```

export interface IOrderResult {
  id: string;
}

```

Состояние приложения / Интерфейс актуального состояния приложения

```

export interface IAppState {
  catalog: IProduct[];
  basket: string[];
  preview: string | null;
  order: IOrder | null;
}

```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие   