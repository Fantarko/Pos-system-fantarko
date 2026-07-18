export type UserRole = "customer" | "staff" | "admin";

export type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string | null;
  categories: { name: string };
};
export type CartItem = {
  product: Product;
  quantity: number;
  discount: number;
};
export type Order = {
  id: number;
  total: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  customers: { name: string } | null;
  staff: { name: string } | null;
  payment_method: { name: string } | null;
};
