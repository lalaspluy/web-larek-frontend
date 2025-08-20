import { Form } from "./common/Form";
import { IOrderFormSecond } from "../types";
import { IEvents } from "./base/Events";
import { ensureElement } from "../utils/utils";

export class OrderSecond extends Form<IOrderFormSecond> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
    }

    // Установка email
    set email(value: string) {
        this._emailInput.value = value;
    }

    // Установка телефона
    set phone(value: string) {
        this._phoneInput.value = value;
    }
}