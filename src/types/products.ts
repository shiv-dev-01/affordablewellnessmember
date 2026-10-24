export interface CartProduct {
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: string;
  product_sku: string;
  product_category_name: string;
  product_img: string;
  time: string;
  order_id: string;
  order_status: string;
  tracking_number: string;
  form_url?: string;
  "form_url "?: string; // API response has this field with a space
  form_url_new?: string | null;

  is_sub: number;
  state_name?: string;
  state_code?: string;
  form_id?: string;
  stage?: string;
  therapy_group?: string;
  test_code?: string;
}

export function isLabTestProduct(product: CartProduct): boolean {
  return (
    product.product_category_name?.trim().toUpperCase() === "TRT" &&
    Number(product.is_sub) === 1
  );
}

const KIT_SHIPPED_STATES = new Set([
  "new jersey",
  "connecticut",
  "rhode island",
]);

export function getLabTestCode(product: CartProduct): "L501" | "501" {
  const stateName = product.state_name?.trim().toLowerCase() ?? "";
  if (KIT_SHIPPED_STATES.has(stateName)) {
    return "501";
  }
  return "L501";
}

export interface CartProductsResponse {
  status: number;
  message: string;
  product: CartProduct[];
}