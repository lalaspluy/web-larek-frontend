import { Form } from "./common/Form";
import { IOrderFormFirst } from "../types";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

export class OrderFirst extends Form<IOrderFormFirst> {
    protected _cardButton: HTMLButtonElement;
    protected _cashButton: HTMLButtonElement;
    protected _addressInput: HTMLInputElement;
    protected _nextButton: HTMLButtonElement;

    private _selectedPayment: string = '';


    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        // Находим элементы формы
        this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
        this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
        this._nextButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
        
        // Добавляем обработчики
        this._cardButton.addEventListener('click', () => this.selectPayment('card'));
        this._cashButton.addEventListener('click', () => this.selectPayment('cash'));
        this._addressInput.addEventListener('input', () => this.handleAddressChange());
    
        // Обработчик отправки формы
        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            events.emit('order:submit');
        });
    }

    private selectPayment(method: string) {
        // Снимаем выделение со всех кнопок
        this._cardButton.classList.remove('button_alt-active');
        this._cashButton.classList.remove('button_alt-active');
        
        // Выделяем выбранную кнопку
        if (method === 'card') {
            this._cardButton.classList.add('button_alt-active');
        } else {
            this._cashButton.classList.add('button_alt-active');
        }
        
        // Сохраняем выбранный способ
        this._selectedPayment = method;
        
        // Эмитируем событие изменения
        this.events.emit(`${this.container.name}.payment:change`, {
            field: 'payment',
            value: method
        });
    }

    private handleAddressChange() {
        this.events.emit(`${this.container.name}.address:change`, {
            field: 'address',
            value: this._addressInput.value
        });
    }

    // Установка адреса доставки
    set address(value: string) {
        this._addressInput.value = value;
    }

   // Установка способа оплаты (визуальное выделение)
   set payment(value: string) {
        this._selectedPayment = value;
        if (value === 'card') {
            this._cardButton.classList.add('button_alt-active');
            this._cashButton.classList.remove('button_alt-active');
        } else if (value === 'cash') {
            this._cashButton.classList.add('button_alt-active');
            this._cardButton.classList.remove('button_alt-active');
        }
    }

    // Установка состояния валидации
    set valid(value: boolean) {
        this._nextButton.disabled = !value;
    }

    // Метод для сброса состояния
    resetPayment() {
        this._selectedPayment = '';
        this._cardButton.classList.remove('button_alt-active');
        this._cashButton.classList.remove('button_alt-active');
    }
}