export type CategoryClassMap = {
  [category: string]: string;
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
export function getCategoryClass(category: string): string {
  const containerName = "card__category";
  return containerName + (CATEGORY_CLASS_MAP[category.toLowerCase()] || "_other");
}