export type ProductCategory = 'софт-скил' | 'хард-скил' | 'дополнительное' | 'кнопка' | 'другое';

export interface IProduct {
	id: string;
  description: string;
  image: string;
  title: string;
  category: ProductCategory;
  price: number | null;
}

export interface IBasketItem {
  id: string;
  title: string;
  price: number;
  index: number;
}

export interface IOrderFormFirst {
  payment: string | null;
  address: string;
}

export interface IOrderFormSecond {
  email: string;
  phone: string;
}

export interface IOrder extends IOrderFormFirst, IOrderFormSecond {
  total: number;
  items: string[];
}

export type TFormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
  id: string;
}

export interface IAppState {
  catalog: IProduct[];
  basket: string[];
  preview: string | null;
  order: IOrder | null;
  formErrors: TFormErrors;
}