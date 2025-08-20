import {Model} from "./base/Model";
import {TFormErrors, IAppState, ProductCategory, IProduct, IOrder, IOrderFormFirst, IOrderFormSecond, IBasketItem} from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProduct> {
    description: string;
    id: string;
    image: string;
    title: string;
    price: number | null;
    category: ProductCategory;
    inBasket: boolean = false;
}

export class AppState extends Model<IAppState> {
    catalog: ProductItem[];
    order: IOrder = {
        email: '',
        phone: '',
        address: '',
        payment: '',
        items: [],
        total: 0 
    };
    preview: string | null;
    formErrors: TFormErrors = {};
    currentStep: 'first' | 'second' = 'first';

    getBasketItemsForView(): IBasketItem[] {
        return this.order.items.map((id, index) => {
            const product = this.catalog.find(item => item.id === id);
            return {
                id: id,
                title: product.title,
                price: product.price,
                index: index + 1
            };
        });
    }

    addToBasket(item: ProductItem) {
        if (!this.order.items.includes(item.id)) {
            this.order.items.push(item.id);
            item.inBasket = true; 
            this.emitChanges('basket:changed');
        }
    }

    removeFromBasket(id: string) {
        this.order.items = this.order.items.filter(item => item !== id);
        const product = this.catalog.find(item => item.id === id);
        if (product) product.inBasket = false; 
        this.emitChanges('basket:changed');
    }

    clearBasket() {
        this.order.items.forEach(id => {
            const product = this.catalog.find(item => item.id === id);
            if (product) product.inBasket = false;
        });
        this.order.items = [];
        this.emitChanges('basket:changed');
    }

    getButtonText(item: ProductItem): string {
        if (item.price === null) return 'Недоступно';
        return item.inBasket ? 'Убрать' : 'Купить';
    }

    getTotal() {
        return this.order.items.reduce(
            (total, id) => total + (this.catalog.find(item => item.id === id)?.price || 0),
            0
        );
    }

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderFirstStepField(field: keyof IOrderFormFirst, value: string) {
        this.order[field] = value;
        this.validateOrderFirstStep();
    }

    setOrderSecondStepField(field: keyof IOrderFormSecond, value: string) {
        this.order[field] = value;
        this.validateOrderSecondStep();
    }

    validateOrderFirstStep() {
        const errors: TFormErrors = {};
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.payment) {
            errors.payment = 'Необходимо указать способ оплаты';
        }
        this.formErrors = errors;
        this.events.emit('formErrorsFirst:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateOrderSecondStep() {
        const errors: TFormErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrorsSecond:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    completeOrder() {
        this.clearBasket();
        this.order = {
            email: '',
            phone: '',
            address: '',
            payment: '',
            items: [],
            total: 0
        };
        this.events.emit('order:success');
    }
}