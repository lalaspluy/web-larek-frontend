/*export type PaimentWay = 'online' | 'uponReceive' | null;
export type ProductCategory= 'button' | 'softSkill' | 'another' | 'additional';*/
/*export enum PaimentWay {
  online = 'Онлайн',
  softSkill = 'софт-скил',
  another = 'другое',
  additional = 'дополнительное'
}; 

export enum ProductCategory {
  button = 'кнопка',
  softSkill = 'софт-скил',
  another = 'другое',
  additional = 'дополнительное'
}; */

export interface IProduct {
	id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number;
}

export type TBasketItem = Pick<IProduct, 'id' | 'title' | 'price'>;

export type TCatalogItem = Pick<IProduct, 'id' | 'title' | 'price' | 'image' | 'category'>;

export interface IOrderFormFirst {
  payment: string;
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
  //loading: boolean;
}