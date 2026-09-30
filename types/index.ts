export type Cuisine = "FAST_FOOD" | "ITALIAN" | "INDIAN" | "VEGAN";

export type OrderStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface RestaurantDetail {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: Cuisine;
  description: string | null;
  deliveryTimeMinutes: number;
}

/** What /api/restaurants returns for list cards. */
export interface Restaurant extends RestaurantDetail {
  menuItemCount: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  image: string;
}

/** What /api/restaurants/[id]/menu returns. */
export interface RestaurantMenuResponse {
  restaurant: RestaurantDetail;
  items: MenuItem[];
}

export interface Address {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

/** Response of POST /api/payment/create-order. */
export interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number; // paise
  currency: string;
  keyId: string;
  totalAmount: number; // rupees
  status: OrderStatus;
}

/** Response of POST /api/payment/verify. */
export interface VerifyPaymentResponse {
  ok: boolean;
  status: OrderStatus;
  orderId: string;
  alreadyProcessed: boolean;
}
