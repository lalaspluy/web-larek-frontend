import { Form } from "./common/Form";
import { IOrderFormFirst } from "../types";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

export class OrderFirst extends Form<IOrderFormFirst> {
    protected _cardButton: HTMLButtonElement;
    protected _cashButton: HTMLButtonElement;
    protected _addressInput: HTMLInputElement;


    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        // Находим элементы формы
        this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
        this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
        
        // Добавляем обработчики
        this._cardButton.addEventListener('click', () => this.selectPayment('card'));
        this._cashButton.addEventListener('click', () => this.selectPayment('cash'));
    }

    // Установка адреса доставки
    set address(value: string) {
        this._addressInput.value = value;
    }

   // Установка способа оплаты (визуальное выделение)
   set payment(value: string) {
        this.toggleCard(value === 'card');
        this.toggleCash(value === 'cash');
    }

    private selectPayment(method: string) {
        // Выделяем выбранную кнопку
        this.payment = method;
        
        // Эмитируем событие изменения
        this.events.emit(`${this.container.name}.payment:change`, {
            field: 'payment',
            value: method
        });
    }
    
    toggleCard(state: boolean = true) {
        this.toggleClass(this._cardButton, 'button_alt-active', state);
    }

    toggleCash(state: boolean = true) {
        this.toggleClass(this._cashButton, 'button_alt-active', state);
    }

}