import { ProductCategory } from "../types";

// Тип для маппинга категорий
export type CategoryClassMap = {
  [key in ProductCategory]: string;
};

// Маппинг категорий к CSS-классам
export const CATEGORY_CLASS_MAP: CategoryClassMap = {
  "софт-скил": "_soft",
  "хард-скил": "_hard",
  "другое": "_other",
  "дополнительное": "_additional",
  "кнопка": "_button",
};

// Функция для получения CSS-класса по категории
export function getCategoryClass(category: ProductCategory, baseClass: string): string {
  return baseClass + (CATEGORY_CLASS_MAP[category] || "_other");
}