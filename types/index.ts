export type UserRole = "customer" | "staff" | "admin";


export type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string | null;

  categories: {
    name: string;
  } | null;
};


export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  discount: number;
};


export type Category = {
  id: number;
  name: string;
};


export type PaymentMethod = {
  id: number;
  name: string;
};


export type Customer = {
  id: number;
  name: string;
  phone: string;
  points: number;
};


export type Order = {
  id: number;
  total: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;

  customers: {
    name: string;
  } | null;

  staff: {
    name: string;
  } | null;

  payment_method: {
    name: string;
  } | null;
};