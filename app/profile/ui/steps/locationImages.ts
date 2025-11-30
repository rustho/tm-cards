// Image URLs for locations - can be replaced with actual image paths
export const LOCATION_IMAGES: Record<string, string> = {
  "Бали": "/images/bali.jpg",
  "Таиланд": "/images/thailand.jpg",
  "Вьетнам": "/images/vietnam.jpg",
  "Шри-Ланка": "/images/sri-lanka.jpg",
  "Да Нанг": "/images/da-nang.jpg",
  "Ня Чанг": "/images/nha-trang.jpg",
  "Чангу": "/images/canggu.jpg",
  "Убуд": "/images/ubud.jpg",
  "Букит": "/images/bukit.jpg",
  "Бангкок": "/images/bangkok.jpg",
  "Пхукет": "/images/phuket.jpg",
  "Паттайя": "/images/pattaya.jpg",
  "Чангмай": "/images/chiang-mai.jpg",
  "Коломбо": "/images/colombo.jpg",
  "Канди": "/images/kandy.jpg",
};

// Default placeholder image
export const DEFAULT_LOCATION_IMAGE = "/images/default-location.jpg";

export function getLocationImage(location: string): string {
  return LOCATION_IMAGES[location] || DEFAULT_LOCATION_IMAGE;
}

