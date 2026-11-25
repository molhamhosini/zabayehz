// Shapes returned by the backend at /api/v1 (GroFresh Laravel API), trimmed to what the site uses.

export type ApiChoiceOption = {
  name: string;
  title: string;
  options: string[];
  required?: boolean | number | string;
  display_type?: 'text' | 'image' | 'multi_image' | string;
  option_images?: string[];
};

export type ApiVariation = { type: string; price: number; stock: number };

export type ApiCategoryDiscount = {
  discount_type: string;
  discount_amount: number | string;
  maximum_amount: number | string;
} | null;

export type ApiProduct = {
  id: number;
  name: string;
  description?: string | null;
  image?: string[] | null;
  price: number;
  discount: number;
  discount_type: string;
  unit?: string;
  total_stock?: number;
  category_ids?: { id: string | number }[];
  category_discount?: ApiCategoryDiscount;
  rating?: { average: string | number }[];
  maximum_order_quantity?: number | string | null;
  choice_options?: ApiChoiceOption[];
  variations?: ApiVariation[];
  active_reviews?: ApiReview[];
};

export type ApiReview = {
  id: number;
  comment?: string | null;
  rating: number;
  created_at: string;
  customer?: { f_name?: string | null; l_name?: string | null } | null;
};

export type ApiCategory = { id: number; name: string; image?: string | null; parent_id?: number };

export type ApiBanner = {
  id: number;
  title?: string | null;
  image: string;
  product_id?: number | null;
  category_id?: number | null;
};

export type ApiConfig = {
  ecommerce_name: string;
  ecommerce_logo?: string;
  ecommerce_phone?: string;
  ecommerce_email?: string;
  ecommerce_address?: string;
  currency_symbol?: string;
  currency_symbol_position?: 'left' | 'right' | string;
  base_urls: {
    product_image_url: string;
    category_image_url: string;
    banner_image_url: string;
    ecommerce_image_url: string;
  };
  play_store_config?: { status: boolean; link: string };
  app_store_config?: { status: boolean; link: string };
  whatsapp?: { status: string | number; number: string };
};

// Slim shapes sent to the browser. The raw product JSON is large (every weight x cut x packing
// combination is a separate variation), so pages only pass what the UI needs.

export type ProductCard = {
  id: number;
  name: string;
  image: string | null;
  price: number; // before discount
  finalPrice: number; // after discount
  unit: string;
  rating: number | null;
  inStock: boolean;
};

export type ChoiceGroup = {
  title: string;
  kind: 'text' | 'image' | 'multi';
  required: boolean;
  options: { label: string; image: string | null }[];
};

export type ProductDetail = ProductCard & {
  description: string;
  images: string[];
  maxQty: number;
  discount: { type: 'percent' | 'amount'; value: number; max?: number } | null;
  choices: ChoiceGroup[];
  // normalised variation key -> [price, stock]
  variants: Record<string, [number, number]>;
  reviews: { id: number; name: string; rating: number; comment: string; date: string }[];
  categoryId: number | null;
};
