import {Component} from "./base/Component";
import {ensureElement, formatPrice } from "../utils/utils";
import { getCategoryClass, CATEGORY_CLASS_MAP } from "../utils/categorymap";
import {IProduct, ProductCategory} from "../types";

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProduct> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _description: HTMLElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;


    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._button = container.querySelector<HTMLButtonElement>(`.${blockName}__button`);
        this._description = container.querySelector<HTMLElement>(`.${blockName}__text`);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        this._category = container.querySelector<HTMLElement>(`.${blockName}__category`);
        
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

    set description(value: string) {
        this.setText(this._description, value);
    }

    set category(value: ProductCategory) {
        if (!this._category) return;
        
        this.setText(this._category, value);
        
        const baseClass = `${this.blockName}__category`;
        // Удаляем все возможные классы категорий
        Object.values(CATEGORY_CLASS_MAP).forEach(cls => {
            this.toggleClass(this._category, baseClass+cls, false)
        });
        // Добавляем правильный класс для категории
        this.toggleClass(this._category, getCategoryClass(value, baseClass), true);
    }

    set price(value: number | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно');
            this.setButtonState(false);
        } else {
            this.setText(this._price, formatPrice(value));
            this.setButtonState(true);
        }
    }

    setButtonText(value: string) {
      if (this._button) {
          this.setText(this._button, value);
      }
    }

    setButtonState(enabled: boolean) {
        if (this._button) {
            this.setDisabled(this._button, !enabled);
        }
    }
}