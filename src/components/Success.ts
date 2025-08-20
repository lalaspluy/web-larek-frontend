import {Component} from "./base/Component";
import {ensureElement, formatPrice} from "../utils/utils";

interface ISuccess {
    total: number;
}

interface ISuccessActions {
    onClick: () => void; // Действие при клике на кнопку
}

export class Success extends Component<ISuccess> {
    protected _close: HTMLButtonElement;
    protected _total: HTMLElement; // Элемент для отображения суммы

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._close = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        this._total = ensureElement<HTMLElement>('.order-success__description', this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    // Обновляем сумму при рендере
    render(data: ISuccess): HTMLElement {
        super.render(data);
        
        // Форматируем текст с правильным склонением
        const synapseText = formatPrice(data.total);
        this.setText(this._total, `Списано ${synapseText}`);
        
        return this.container;
    }
}