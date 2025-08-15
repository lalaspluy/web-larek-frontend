
import {Model} from "./base/Model";
import {TFormErrors, IAppState, IProduct, IOrder, IOrderFormFirst, IOrderFormSecond} from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProduct> {
    description: string;
    id: string;
    image: string;
    title: string;
    price: number;
    category: string;
    inBasket: boolean = false;
}

export class AppState extends Model<IAppState> {
    catalog: ProductItem[];
    loading: boolean;
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

    // Работа с корзиной
    /*toggleOrderedProduct(id: string, isIncluded: boolean) {
        if (isIncluded) {
            this.order.items = this.order.items.filter(item => item !== id);
        } else {
            this.order.items = [...this.order.items, id];
        }
        this.emitChanges('basket:changed');
    }*/
    addToBasket(item: ProductItem) {
        if (!this.order.items.includes(item.id)) {
            this.order.items.push(item.id);
            item.inBasket = true; // Устанавливаем флаг
            this.emitChanges('basket:changed');
        }
    }

    removeFromBasket(id: string) {
        this.order.items = this.order.items.filter(item => item !== id);
        const product = this.catalog.find(item => item.id === id);
        if (product) product.inBasket = false; // Сбрасываем флаг
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

    isProductInBasket(id: string): boolean {
        return this.order.items.includes(id);
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

    // Для первого шага
    setOrderFirstStepField(field: keyof IOrderFormFirst, value: string) {
        this.order[field] = value;
        this.validateOrderFirstStep();
    }

    // Для второго шага
    setOrderSecondStepField(field: keyof IOrderFormSecond, value: string) {
        this.order[field] = value;
        this.validateOrderSecondStep();
    }

    // Валидация первого шага
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

    // Валидация второго шага
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

    // Завершение заказа
    completeOrder() {
        this.clearBasket();
        this.order = {
            email: '',
            phone: '',
            address: '',
            payment: '',
            items: [],
            total: 0 // Инициализируем total
        };
        this.events.emit('order:success');
    }
}