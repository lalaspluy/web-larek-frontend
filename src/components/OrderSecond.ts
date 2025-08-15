import { Form } from "./common/Form";
import { IOrderFormSecond } from "../types";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

export class OrderSecond extends Form<IOrderFormSecond> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;
    protected _errorsContainer: HTMLElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
        this._errorsContainer = ensureElement<HTMLElement>('.form__errors', container);

        // Обработчики изменений полей
        this._emailInput.addEventListener('input', () => this.handleFieldChange('email'));
        this._phoneInput.addEventListener('input', () => this.handleFieldChange('phone'));
    
        // Обработчик отправки формы
        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            events.emit('contacts:submit');
        });
    }

    private handleFieldChange(field: keyof IOrderFormSecond) {
        this.events.emit(`contacts.${field}:change`, {
            field: field,
            value: this[`_${field}Input`].value
        });
    }


    // Установка email
    set email(value: string) {
        this._emailInput.value = value;
    }

    // Установка телефона
    set phone(value: string) {
        this._phoneInput.value = value;
    }

    // Установка состояния валидации
    set valid(value: boolean) {
        this._submitButton.disabled = !value;
    }

    // Установка ошибок
    set errors(value: string) {
        this._errorsContainer.textContent = value;
    }
}