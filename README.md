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

export type ProductCategory = 'софт-скил' | 'хард-скил' | 'дополнительное' | 'кнопка' | 'другое';

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: ProductCategory;
  price: number | null;
}

```

Элемент корзины

```

export interface IBasketItem {
  id: string;
  title: string;
  price: number;
  index: number;
}

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
  formErrors: TFormErrors;
}

```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. 
Поля класса:
- `readonly baseUrl` - базовый URL API (только для чтения)
- `protected options: RequestInit` - защищённые настройки HTTP-запросов

- `constructor(baseUrl: string, options: RequestInit = {})` - В конструктор передается `baseUrl` - базовый адрес сервера для API-запросов и опциональный объект `options` типа RequestInit - настройки HTTP-запросов.

Методы: 

- `get(uri: string): Promise<object>` - выполняет GET запрос и возвращает Promise с объектом, которым ответил сервер, `uri` - endpoint для запроса;

- `post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` - выполняет POST/PUT/DELETE запрос и возвращает Promise с объектом ответа. Параметры: `uri` - endpoint для запроса, `data` - данные для отправки, `method` (тип-объединение: 'POST' | 'PUT' | 'DELETE') - HTTP-метод (по умолчанию 'POST').

-`protected handleResponse(response: Response): Promise<object>` - обрабатывает ответ сервера и возвращает Promise с данными или ошибкой.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  

Поле: 
- `_events: Map<EventName, Set<Subscriber>>` - карта для хранения подписчиков на события, где ключ: EventName (строка или RegExp), значение: Set функций-подписчиков.

Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on<T extends object>(eventName: EventName, callback: (event: T) => void)` - подписывает callback на событие eventName. `eventName`: строка или RegExp - имя события или паттерн; `callback` - обработчик события.

- `emit<T extends object>(eventName: string, data?: T)` - генерирует событие с данными. `eventName` - имя события; `data` (опционально) - данные события.

- `trigger<T extends object>(eventName: string, context?: Partial<T>): (data: T) => void` - возвращает функцию, которая при вызове генерирует событие.
`eventName` - имя события, `context` (опционально) - контекстные данные.

Дополнительные методы:
- `off(eventName: EventName, callback: Subscriber)` - отписывает callback от события. `eventName`: строка или RegExp - имя события, `callback` - обработчик для удаления.

- `onAll(callback: (event: EmitterEvent) => void)` - подписывает на все события. `callback` - обработчик всех событий.

- `offAll()` - cбрасывает все подписки.

#### Класс Model
Базовый класс для всех моделей данных. Унифицирует создание моделей и обеспечивает механизм оповещения об изменениях. Включает гарду типа `isModel` для проверки экземпляров моделей.
- `constructor(data: Partial<T>, protected events: IEvents)` - `data` - частичный объект данных модели, `events` - экземпляр системы событий для уведомлений об изменениях.

Метод:
- `emitChanges(event: string, payload?: object)` - генерирует событие через систему IEvents, уведомляя подписчиков об изменениях модели. `event` - название события, `payload`(опционально) - данные для передачи подписчикам.

Гарда типа:
- `isModel(obj: unknown): obj is Model<any>` - проверяет, является ли объект экземпляром Model, возвращает true/false.

### Слой данных

#### Класс AppState 

Класс является центральной моделью данных приложения. Он отвечает за хранение состояния приложения, бизнес-логику работы с данными, валидацию данных, уведомление об изменениях через события.

Поля класса содержат данные:
- catalog:	ProductItem[]	- массив объектов карточек
- order:	IOrder - данные текущего заказа
- preview:	string | null	 - ID товара, открытого в превью
- formErrors:	TFormErrors	- ошибки валидации формы заказа
- currentStep:	'first' | 'second' -	текущий шаг оформления заказа

Наследует конструктор от `Model<IAppState>`:
- `constructor(data: Partial<IAppState>, events: IEvents)` - `data` - частичные данные состояния приложения, `events` - система событий для уведомлений.

Основные методы класса:

Для работы с корзиной:
- `addToBasket(item: ProductItem)`	- добавляет товар в корзину
- `removeFromBasket(id: string)` - удаляет товар из корзины по ID
- `clearBasket()`	- полностью очищает корзину
- `getTotal(): number` - рассчитывает общую сумму заказа
- `getBasketItemsForView(): IBasketItem[]`	- возвращает массив товаров в корзине для отображения. Каждый элемент содержит: id, title, price, index.
- `getButtonText(item: ProductItem): string` - возвращает текст для кнопки товара ("Недоступно", "Убрать" или "Купить"). `item` - товар для проверки.

Работа с каталогом: 
- `setCatalog(items: IProduct[])`	- загружает каталог товаров, `items` - массив товаров
- `setPreview(item: ProductItem)` - устанавливает товар для предпросмотра, `item` - товар для предпросмотра

Оформление заказа:
- `setOrderFirstStepField(field: keyof IOrderFormFirst, value: string)` - устанавливает данные первого шага оформления (адрес/оплата), `field` - название поля, `value` - значение поля

- `setOrderSecondStepField(field: keyof IOrderFormSecond, value: string)` - устанавливает данные второго шага (контакты), `field` - название поля, `value` - значение поля

- `validateOrderFirstStep(): boolean` - валидирует данные первого шага; возвращает true, если валидация прошла успешно
- `validateOrderSecondStep(): boolean`	- валидирует данные второго шага; возвращает true, если валидация прошла успешно
- `completeOrder()` - завершает оформление заказа и сбрасывает данные заказа

Также модель генерирует события через `emitChanges()`:
- `basket:changed` - при изменении состава корзины
- `items:changed` - при изменении каталога товаров
- `preview:changed` - при открытии карточки товара
- `formErrorsFirst:change` - при ошибках первого шага
- `formErrorsSecond:change` - при ошибках второго шага
- `order:success` - при успешном оформлении заказа

### Классы представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Класс Component
Класс является дженериком и родителем всех компонентов слоя представления. В дженерик принимает тип объекта, в котором данные будут передаваться в метод render для отображения данных в компоненте.Предоставляет базовые методы для работы с содержимым контейнера. Контейнер принимается через конструктор и сохраняется в защищённом поле container. Все методы работают с его дочерними элементами.
- `protected constructor(protected readonly container: HTMLElement)` - `container` - корневой DOM-элемент компонента (только для чтения)

Основные методы  (вспомогательные для работы с DOM):
- `toggleClass(element: HTMLElement, className: string, force?: boolean)` - переключает CSS-класс у элемента. `element` - целевой элемент, `className` - название CSS-класса, `force` (опционально) - принудительно установить/убрать класс.

- `protected setText(element: HTMLElement, value: unknown)` - устанавливает текстовое содержимое элемента. `element` - целевой элемент, `value` - значение для установки (преобразуется в строку).

- `setDisabled(element: HTMLElement, state: boolean)` - управляет состоянием блокировки. `element` - целевой элемент, `state` - состояние блокировки (true - заблокирован).

- `protected setHidden(element: HTMLElement)` - cкрывает элемент (устанавливает display: none).
- `protected setVisible(element: HTMLElement)` - показывает элемент (убирает display: none)

`protected setImage(element: HTMLImageElement, src: string, alt?: string)` - устанавливает изображение и альтернативный текст. `element` - элемент изображения, `src` - URL изображения, `alt` (опционально) - альтернативный текст.

Базовый метод:
- `render(data?: Partial<T>): HTMLElement` - обновляет состояние компонента, возвращает корневой DOM-элемент компонента. `data` (опциональный) - частичные данные для обновления компонента.

#### Класс Modal
Реализует модальное окно. Наследуется от базового класса Component. Основные функции: открытие/закрытие модального окна, автоматическая подписка на события закрытия, вставка динамического контента, генерация событий при открытии/закрытии. Закрытие срабатывает при клике на крестик или вне модального окна, или нажатии на Esc.
- constructor(container: HTMLElement, protected events: IEvents) - принимает родительский контейнер модального окна и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля класса:
- _closeButton: HTMLButtonElement - кнопка закрытия модального окна
- _content: HTMLElement - контейнер для контента

Основные методы:
- `open()` - активирует модальное окно, добавляет обработчик клавиши Escape и генерирует событие `modal:open`
- `close()` - cкрывает модальное окно, удаляет обработчик клавиши Escape,очищает контент и генерирует событие `modal:close`
- `render(data: IModalData): HTMLElement` - обновляет и открывает модальное окно, возвращает контейнер модального окна. `data` - данные для отображения.

Сеттер:
- `set content(value: HTMLElement)` - устанавливает содержимое модального окна. `value` - новый контент для отображения.

Вспомогательные методы:
- `toggleModal(state: boolean = true)` - переключает видимость модального окна. `state` - флаг видимости (по умолчанию true).

- `handleEscape(evt: KeyboardEvent)` - обработчик нажатия клавиши Escape для закрытия модального окна. `evt`: KeyboardEvent - событие клавиатуры.

#### Класс Page
Класс Page является основным компонентом для управления структурой страницы приложения. Он отвечает за отображение количества товаров в корзине, управление каталогом товаров, блокировку/разблокировку интерфейса при открытии модальных окон, обработку кликов по иконке корзины.
- constructor(container: HTMLElement, protected events: IEvents) - конструктор принимает корневой HTML-элемент страницы и и экземпляр класса `EventEmitter`. 

Поля класса:
- _counter: HTMLElement - элемент для отображения количества товаров в корзине
- _catalog: HTMLElement - контейнер для отображения каталога товаров
- _wrapper: HTMLElement - основной wrapper страницы для управления блокировкой
- _basket: HTMLElement - 	иконка корзины для открытия модального окна

Сеттеры:
- `set counter(value: number)` - устанавливает значение счетчика товаров в корзине. `value` - новое значение счетчика.
- `set catalog(items: HTMLElement[])` - обновляет содержимое каталога товаров.
`items` - массив DOM-элементов товаров.
- `set locked(value: boolean)` - блокирует или разблокирует страницу.
`value` - флаг блокировки (true - заблокировать).

#### Класс Card
Представляет компонент карточки товара, который отображает информацию о продукте и предоставляет интерактивные элементы (кнопки) для взаимодействия. Карточка поддерживает различные состояния товара (доступен, недоступен) и отображает категорию товара.
- `constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions)` - конструктор принимает CSS-класс блока для поиска элементов внутри контейнера, HTML-элемент контейнера карточки, объект с обработчиками событий (опционально).

Поля класса:
- _title: HTMLElement -	Элемент названия товара
- _image:	HTMLImageElement - Элемент изображения товара
- _description:	HTMLElement	- Элемент описания товара
- _category: HTMLElement - Элемент категории товара
- _price: HTMLElement	- Элемент цены товара
- _button: HTMLButtonElement -	Кнопка действия (добавления в корзину)

Методы: 
- `setButtonText(value: string)` - Устанавливает текст кнопки
- `setButtonState(enabled: boolean)` - Включает или отключает кнопку. `enabled` - состояние кнопки (true - активна).

Геттеры и сеттеры:
- `set id(value: string)` - устанавливает data-id атрибут контейнера карточки
- `get id(): string` - возвращает data-id атрибут контейнера карточки
- `set title(value: string)` - устанавливает название товара
- `get title(): string` - возвращает название товара
- `set image(value: string)` - устанавливает изображение товара и alt-текст
- `set description(value: string)` - устанавливает описание товара
- `set category(value: ProductCategory)` - устанавливает категорию товара и соответствующий CSS-класс
- `set price(value: number | null)` - устанавливает цену товара (при null отображает "Бесценно")

Класс использует утилиту formatPrice для отображения цен; автоматически применяет соответствующие CSS-классы к категориям товаров через getCategoryClass; поддерживает клики по кнопке и по всей карточке.

#### Класс Basket
Отвечает за отображение состояния корзины и взаимодействие с пользователем.
При клике на кнопку оформления заказа генерируется событие `order:open`. При клике на кнопку удаления товара генерируется событие `basket:remove` с ID товара.

- constructor( container: HTMLElement, protected events: EventEmitter,
basketItemTemplate: HTMLTemplateElement) - принимает контейнер корзины, экземпляр класса `EventEmitter` и шаблон для создания элемента корзины.

Поля класса:
- _list: HTMLElement - контейнер для отображения списка товаров в корзине
- _total: HTMLElement - элемент для отображения общей суммы заказа
- _button: HTMLButtonElement - кнопка оформления заказа
- _basketItemTemplate: HTMLTemplateElement - шаблон для отображения элемента корзины

Методы класса:
- `protected createBasketItem(item: IBasketItem): HTMLElement` - cоздает DOM-элемент для товара в корзине на основе шаблона и переданных данных и возвращает созданный HTMLElement. `item` - данные товара.

-`toggleButtonDisabled(state: boolean)` - включает/отключает кнопку оформления заказа, `state` - состояние кнопки (true - заблокирована)

- `setBasketItems(items: IBasketItem[])` - принимает массив товаров и создает из них DOM-элементы, которые затем отображаются в корзине.

- `renderModalContent(): HTMLElement` - возвращает контейнер корзины для отображения в модальном окне.

Сеттеры:
- `set items(items: HTMLElement[])` - устанавливает элементы в список корзины. `items` - массив DOM-элементов товаров.

- `set total(value: number)` - устанавливает общую стоимость заказа.

#### Класс Form
Класс Form реализует компонент формы с валидацией и обработкой событий; наследуется от базового класса Component.
Основные функции: управление состоянием валидности формы, отображение ошибок валидации, обработка пользовательского ввода, управление событиями отправки формы, обновление полей формы. 

- constructor(protected container: HTMLFormElement, protected events: IEvents) - принимает DOM-элемент формы и экземпляр класса `EventEmitter`.

Поля класса:
- _submit: HTMLButtonElement - кнопка отправки формы
- _errors: HTMLElement - контейнер для отображения ошибок

Методы:
- `protected onInputChange(field: keyof T, value: string)` - генерирует событие при изменении значения поля. `field` - имя измененного поля, `value` - новое значение поля.

- `render(state: Partial<T> & IFormState): HTMLFormElement` - обновляет состояние формы и её элементов, возвращает контейнер формы. `state` комбинированный объект с данными формы и состоянием валидации.

Сеттеры: 
- `set valid(value: boolean)` - устанавливает состояние валидности формы. `value` - флаг валидности (true - форма валидна).
- `set errors(value: string)` - устанавливает текст ошибок формы. `value` - текст ошибки для отображения.

#### Класс OrderFirst
Класс отвечает за обработку первой части формы оформления заказа - ввод адреса доставки и выбор способа оплаты. Наследует всю базовую функциональность от класса Form.

- constructor(container: HTMLFormElement, events: IEvents) - конструктор принимает HTML-элемент формы первого шага заказа и экземпляр класса `EventEmitter`.

Поля класса:
- _cardButton: HTMLButtonElement - Кнопка выбора оплаты картой
- _cashButton: HTMLButtonElement - Кнопка выбора оплаты наличными
- _addressInput: HTMLInputElement	- Поле ввода адреса доставки

Метод:
- `selectPayment(method: string)` - выделяет выбранную кнопку и генерирует событие изменения. `method` - выбранный способ оплаты.
- `toggleCard(state: boolean = true)` - переключает визуальное состояние кнопки оплаты картой. `state` - состояние активности кнопки.
- `toggleCash(state: boolean = true)` - переключает визуальное состояние кнопки оплаты наличными. `state` - состояние активности кнопки.

Сеттеры: 
- `set address(value: string)` - устанавливает значение адреса доставки.
`value`- новый адрес.
- `set payment(value: string)` - устанавливает выбранный способ оплаты.
`value` - способ оплаты ('card' или 'cash').

Изменения данных в полях формы генерируют события:
`order.address:change` - при изменении адреса доставки
`order.payment:change` - при изменении способа оплаты.

#### Класс OrderSecond
Класс отвечает за обработку второй части формы оформления заказа - ввода контактов. Наследует всю базовую функциональность от класса Form.

- constructor(container: HTMLFormElement, events: IEvents) - конструктор принимает HTML-элемент формы второго шага заказа и экземпляр класса `EventEmitter`.

Поля класса:
- _emailInput: HTMLInputElement - Поле ввода email адреса
- _phoneInput: HTMLInputElement - Поле ввода номера телефона

Сеттеры:
- `set email(value: string)` - устанавливает значение email.
`value` - новый email.
- `set phone(value: string)` - устанавливает значение телефона.
`value` - новый телефон.

Изменения данных в полях формы генерируют события:
`contacts.email:change` - при изменении email
`contacts.phone:change` - при изменении телефона.

#### Класс Success
Отображает сообщение об успешном оформлении заказа, наследуется от базового класса Component. Класс показывает итоговую сумму заказа и предоставляет кнопку для закрытия окна с возвратом в главное меню.

- `constructor(container: HTMLElement, actions: ISuccessActions)` - принимает HTML-элемент контейнера сообщения об успешном заказе и объект с callback-функциями для обработки действий пользователя.

Поля класса:
- _close: HTMLButtonElement - Кнопка закрытия окна успешного заказа
- _total: HTMLElement - Элемент для отображения итоговой суммы заказа

Метод:
- `render(data: ISuccess): HTMLElement` - отображает компонент с данными о заказе. Принимает объект `data` с информацией о заказе (итоговая сумма) и возвращает HTML-элемент контейнера компонента.

### Слой коммуникации

#### Класс AppApi
Наследуется от базового класса Api, предоставляет методы реализующие взаимодействие с бэкендом сервиса, автоматически преобразует пути к изображениям, добавляя CDN-префикс.

- constructor(cdn: string, baseUrl: string, options?: RequestInit) - принимает `cdn` - базовый URL для CDN (для формирования полных путей к изображениям), `baseUrl` - базовый URL API, `options` (опционально) - дополнительные настройки HTTP-запросов.

Поле:
- `readonly cdn: string` - базовый URL CDN (только для чтения)

Методы:
- `getProductItem(id: string): Promise<IProduct>` - получает данные конкретного товара по ID и возвращает Promise с данными товара (с преобразованным URL изображения). `id` - идентификатор товара.

- `getProductsList(): Promise<IProduct[]>` - получает список всех товаров
и возвращает Promise с массивом товаров (с преобразованными URL изображений).

- `orderProducts(order: IOrder): Promise<IOrderResult>` - отправляет заказ на сервер и возвращает Promise с результатом оформления заказа. `order` - данные заказа.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

Список событий, которые могут генерироваться в системе:

- `items:changed` - изменение каталога товаров
- `order:open` - открытие формы заказа
- `order:submit` - отправка первой формы заказа
- `contacts:submit` - отправка второй формы заказа
- `order.payment:change` - изменение способа оплаты
- `order.address:change` - изменение адреса доставки
- `contacts.email:change` - изменение email
- `contacts.phone:change` - изменение телефона
- `formErrorsFirst:change` - Обработка ошибок валидации первого шага заказа
- `formErrorsSecond:change` - Обработка ошибок валидации первого шага заказа
- `product:select` - выбор товара
- `preview:changed` - изменение превью товара
- `basket:changed` - изменение корзины
- `basket:open` - открытие корзины
- `basket:remove` - удаление товара из корзины
- `modal:open` - открытие модального окна
- `modal:close` - открытие/закрытие модального окна

### Пример взаимодействия при открытии карточки товара

#### Инициализация приложения
- При загрузке страницы `index.ts` инициализирует все компоненты
- `AppApi` загружает список товаров с сервера
- `AppState` сохраняет полученные данные и генерирует событие `items:changed`

#### Отображение каталога товаров
- Событие `items:changed` обрабатывается в index.ts
- Для каждого товара создается карточка
- Карточки добавляются на страницу через `page.catalog`

#### Открытие карточки товара
- Когда пользователь кликает на карточку товар, генерируется событие `product:select`
- Обработчик в index.ts устанавливает товар как текущий для preview
- AppData генерирует событие `this.events.emit('preview:changed', this._preview)`
- Обработчик preview в index.ts cоздает карточку для превью с обработчиком клика
- И открывает модальное окно с превью
