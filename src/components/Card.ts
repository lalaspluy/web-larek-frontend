import {Component} from "./base/Component";
import {ensureElement, formatPrice } from "../utils/utils";
import { getCategoryClass, CATEGORY_CLASS_MAP } from "../utils/categorymap";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    title: string;
    description: string | string[];
    image: string;
    category: string;
    price: number;
    button: string; 
}

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _description: HTMLElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _inBasket: boolean;
    protected _priceValue: number | null = null; 


    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._button = container.querySelector(`.${blockName}__button`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._price = container.querySelector(`.${blockName}__price`);
        this._category = container.querySelector(`.${blockName}__category`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string | string[]) {
        if (!this._description) return;
        
        // Очищаем текущее содержимое
        this._description.innerHTML = '';
        
        if (Array.isArray(value)) {
            value.forEach(str => {
                const element = document.createElement('p');
                element.classList.add(`${this.blockName}__text`);
                element.textContent = str;
                this._description.appendChild(element);
            });
        } else {
            this.setText(this._description, value);
        }
    }

    set buttonText(value: string) {
      if (this._button) {
          this._button.textContent = value;
      }
    }

    setButtonDisabled(state: boolean) {
        if (this._button) {
            this._button.disabled = state;
            //this._button.textContent = 'Недоступно';
        }
    }

    set inBasket(value: boolean) {
        
        this._inBasket = value;
        this.updateButton();
    }

    updateButton() {
        if (!this._button) return;
    
        this._button.textContent = this._inBasket ? 'Убрать' : 'Купить';
    }

    set category(value: string) {
        if (!this._category) return;
        
        this.setText(this._category, value);
        
        // Удаляем все возможные классы категорий
        Object.values(CATEGORY_CLASS_MAP).forEach(cls => {
            this._category.classList.remove(cls);
        });
        
        // Добавляем правильный класс для категории
        this._category.classList.add(getCategoryClass(value));
    }

    set price(value: number | null) {
        if (this._price) {
            if (value === null) {
                this._price.textContent = 'Бесценно';
                this.setButtonDisabled(true); 
            } else {
                this._price.textContent = formatPrice(value);
                this.setButtonDisabled(false); 
            }
        }
    }
}