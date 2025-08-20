import {Component} from "./base/Component";
import {cloneTemplate, ensureElement, formatPrice, createElement} from "../utils/utils";
import {EventEmitter} from "./base/Events";
import {IBasketItem} from "../types";

interface IBasketView {
  items: HTMLElement[];  
  total: number;          
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _basketItemTemplate: HTMLTemplateElement;

    constructor(
        container: HTMLElement, 
        protected events: EventEmitter,
        basketItemTemplate: HTMLTemplateElement
    ) {
        super(container);

        this._basketItemTemplate = basketItemTemplate;
        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = ensureElement<HTMLElement>('.basket__price', this.container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });

        this.items = [];
    }

    protected createBasketItem(item: IBasketItem): HTMLElement {
        const element = cloneTemplate(this._basketItemTemplate);
        
        const indexEl = ensureElement('.basket__item-index', element);
        const titleEl = ensureElement('.card__title', element);
        const priceEl = ensureElement('.card__price', element);
        const deleteButton = ensureElement('.basket__item-delete', element);
        
        indexEl.textContent = String(item.index);
        titleEl.textContent = item.title;
        priceEl.textContent = formatPrice(item.price);
        
        deleteButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.events.emit('basket:remove', { id: item.id });
        });
        
        return element;
    }

    set items(items: HTMLElement[]) {
      if (items.length) {
          this._list.replaceChildren(...items);
          this.setDisabled(this._button, false);
      } else {
          this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
              textContent: 'Корзина пуста'
          }));
          this.setDisabled(this._button, true);
      }
    }
    set total(value: number) {
        this.setText(this._total, formatPrice(value));
    }

    setBasketItems(items: IBasketItem[]) {
        const basketElements = items.map(item => this.createBasketItem(item));
        this.items = basketElements;
    }

    renderModalContent(): HTMLElement {
        return this.container;
    }
}