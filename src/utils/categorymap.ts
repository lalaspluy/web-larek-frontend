export type CategoryClassMap = {
  [category: string]: string;
};

// Маппинг категорий к CSS-классам
export const CATEGORY_CLASS_MAP: CategoryClassMap = {
  "софт-скил": "card__category_soft",
  "хард-скил": "card__category_hard",
  "другое": "card__category_other",
  "дополнительное": "card__category_additional",
  "кнопка": "card__category_button",
};

// Функция для получения CSS-класса по категории
export function getCategoryClass(category: string): string {
  return CATEGORY_CLASS_MAP[category.toLowerCase()] || "card__category_other";
}