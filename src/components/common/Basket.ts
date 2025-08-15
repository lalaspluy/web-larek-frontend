import {Component} from "../base/Component";
import {cloneTemplate, ensureElement, formatPrice} from "../../utils/utils";
import {EventEmitter} from "../base/events";

interface IBasketItem {
    id: string;
    title: string;
    price: number;
    index: number;
}

interface IBasketView {
    items: IBasketItem[];
    total: number;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _itemTemplate: HTMLTemplateElement;

    constructor(
        container: HTMLElement, 
        protected events: EventEmitter,
        itemTemplate: HTMLTemplateElement
    ) {
        super(container);

        this._itemTemplate = itemTemplate;
        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = ensureElement<HTMLElement>('.basket__price', this.container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });
    }

    render(state: Partial<IBasketView>): HTMLElement {
      if (state.items) {
        const items = state.items.map((item, index) => 
          this.createItem({...item, index: index + 1})
        );
        
        this._list.replaceChildren(...items);
        this.setDisabled(this._button, !state.items.length);
      }
      
      if (state.total !== null && state.total !== undefined) {
        this.total = state.total;
      }
      
      return this.container;
    }
  
    private createItem(item: IBasketItem): HTMLElement {
      const element = cloneTemplate(this._itemTemplate);
      
      // Прямое использование элемента без вложенного поиска
      const indexEl = ensureElement('.basket__item-index', element);
      const titleEl = ensureElement('.card__title', element);
      const priceEl = ensureElement('.card__price', element);
      const deleteButton = ensureElement('.basket__item-delete', element);
      
      indexEl.textContent = String(item.index);
      titleEl.textContent = item.title;
      priceEl.textContent = formatPrice(item.price);
      
      deleteButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.events.emit('basket:remove', { id: item.id }); // Передаем объект с id
      });
      
      return element;
    }
  
    set total(value: number) {
      this.setText(this._total, formatPrice(value));
    }
  }