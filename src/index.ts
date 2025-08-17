import './scss/styles.scss';

import {AppApi} from "./components/AppApi";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/Events";
import {AppState, CatalogChangeEvent, ProductItem} from "./components/AppData";
import {Page} from "./components/Page";
import {Card} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {IOrderFormFirst, IOrderFormSecond} from "./types";
import {OrderFirst} from "./components/OrderFirst";
import {OrderSecond} from "./components/OrderSecond";
import {Success} from "./components/common/Success";

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

let currentPreviewItem: ProductItem | null = null;
let currentPreviewCard: Card | null = null;

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events, basketItemTemplate);
const orderFirst = new OrderFirst(cloneTemplate(orderTemplate), events);
const orderSecond = new OrderSecond(cloneTemplate(contactsTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    // Проверка на существование каталога
    if (!appData.catalog) return;

    
    page.catalog = appData.catalog.map(item => {
        // Определяем состояние кнопки
        const isUnavailable = item.price === null;
        const buttonText = isUnavailable 
            ? 'Недоступно' 
            : item.inBasket ? 'Убрать' : 'Купить';

        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('product:select', item)
        }, buttonText, isUnavailable);
        
        // Устанавливаем свойства карточки
        return card.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category,
        });
    });
});

// Открыть форму заказа
events.on('order:open', () => {
    // Сбрасываем предыдущий выбор оплаты
    orderFirst.resetPayment();
    // Принудительно запускаем валидацию при открытии
    appData.validateOrderFirstStep(); 

    modal.render({
        content: orderFirst.render({
            address: appData.order.address,
            payment: appData.order.payment,
            valid: appData.validateOrderFirstStep(),
            errors: []
        })
    });
});

// Переход ко второму шагу оформления
events.on('order:submit', () => {
    modal.render({
        content: orderSecond.render({
            email: appData.order.email,
            phone: appData.order.phone,
            valid: appData.validateOrderSecondStep(),
            errors: []
        })
    });
});

// Завершение заказа
events.on('contacts:submit', () => {
    // Создаем объект заказа с total
    const total = appData.getTotal();
    const orderWithTotal = { ...appData.order, total };

    api.orderProducts(orderWithTotal)
        .then(() => {
            const successTotal = total; 
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    appData.clearBasket();
                }
            });

            modal.render({
                content: success.render({
                    total: successTotal
                })
            });
            appData.completeOrder(); // Сбрасываем заказ
        })
        .catch(err => {
            console.error(err);
        });
});

// Валидация формы первого шага
events.on('formErrorsFirst:change', (errors: Partial<IOrderFormFirst>) => {
    const { address, payment } = errors;
    orderFirst.valid = !address && !payment;
    orderFirst.errors = Object.values({address, payment}).filter(i => !!i).join('; ');
});

// Валидация формы второго шага
events.on('formErrorsSecond:change', (errors: Partial<IOrderFormSecond>) => {
    const { email, phone } = errors;
    orderSecond.valid = !email && !phone;
    orderSecond.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Изменение данных первого шага
events.on(/^order\..*:change/, (data: { field: keyof IOrderFormFirst, value: string }) => {
    appData.setOrderFirstStepField(data.field, data.value);
});

// Изменение данных второго шага
events.on(/^contacts\..*:change/, (data: { field: keyof IOrderFormSecond, value: string }) => {
    appData.setOrderSecondStepField(data.field, data.value);
});

// Открыть карточку продукта
events.on('product:select', (item: ProductItem) => {
    appData.setPreview(item);
});

// Обновление модалки товара
events.on('preview:changed', (item: ProductItem) => {
    if (!item) return;

    currentPreviewItem = item; // Сохраняем текущий товар

    // Определяем состояние кнопки
    const isUnavailable = item.price === null;
    const buttonText = isUnavailable 
        ? 'Недоступно' 
        : item.inBasket ? 'Убрать' : 'Купить';
    
    currentPreviewCard = new Card('card', cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (item.price !== null) {
                if (item.inBasket) {
                    appData.removeFromBasket(item.id);
                } else {
                    appData.addToBasket(item);
                }
            }
            //убрать emit из корзин
            //events.emit('basket:changed');
        }
    }, buttonText, isUnavailable);

    modal.render({
        content: currentPreviewCard.render({
            title: item.title,
            image: item.image,
            description: item.description,
            price: item.price,
            category: item.category,
        })
    });
});

// Обновление корзины
events.on('basket:changed', () => {
    page.counter = appData.order.items.length;

    // Обновляем данные корзины
    const basketItems = appData.order.items.map(id => {
        const product = appData.catalog.find(item => item.id === id);
        return {
            id: id,
            title: product.title,
            price: product.price,
            index: appData.order.items.indexOf(id) + 1
        };
    });
    
    // Обновляем состояние корзины
    basket.render({
        items: basketItems,
        total: appData.getTotal()
    });

    // Обновление открытого превью
    if (currentPreviewItem && currentPreviewCard) {
        const isInBasket = appData.isProductInBasket(currentPreviewItem.id);
        
        // Обновляем текст кнопки
        if (currentPreviewItem.price !== null) {
            currentPreviewCard.setButtonText(isInBasket ? 'Убрать' : 'Купить');
        }
    }

    // Обновляем каталог
    events.emit('items:changed');
});

// Открытие корзины
events.on('basket:open', () => {
    modal.render({
        content: basket.render({
            items: appData.order.items.map(id => {
                const product = appData.catalog.find(item => item.id === id);
                return {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    index: appData.order.items.indexOf(id) + 1
                };
            }),
            total: appData.getTotal()
        })
    });
});

//удаление элемента из корзины
events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// разблокируем прокрутку страницы если открыта модалка
events.on('modal:close', () => {
    currentPreviewItem = null;
    currentPreviewCard = null;
    page.locked = false;
});

/* Получаем список товаров
api.getProductsList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });*/
    // Загрузка товаров
api.getProductsList()
    .then(data => appData.setCatalog(data))
    .catch(console.error);