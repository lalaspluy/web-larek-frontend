import { Form } from "./common/Form";
import { IOrderFormFirst } from "../types";
import { IEvents } from "./base/Events";
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
        
        // Эмитируем событие изменения
        this.events.emit(`${this.container.name}.payment:change`, {
            field: 'payment',
            value: method
        });
    }

    // Установка адреса доставки
    set address(value: string) {
        this._addressInput.value = value;
    }

   // Установка способа оплаты (визуальное выделение)
   set payment(value: string) {

        if (value === 'card') {
            this._cardButton.classList.add('button_alt-active');
            this._cashButton.classList.remove('button_alt-active');
        } else if (value === 'cash') {
            this._cashButton.classList.add('button_alt-active');
            this._cardButton.classList.remove('button_alt-active');
        }
    }

}