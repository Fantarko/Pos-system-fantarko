"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import Navbar from "@/hooks/components/Navbar";
import { toast } from 'sonner'
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/hooks/components/Loading";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string | null;
  categories: { name: string };
};

type Category = {
  id: number;
  name: string;
};

type PaymentMethod = {
  id: number;
  name: string;
};

/** แสดงหน้าขายสินค้า จัดการตะกร้า และบันทึกคำสั่งซื้อเมื่อชำระเงิน */
export default function POSPage() {
  const { loading: authLoading } = useAuth('staff')
  const supabase = createClient();
  const router = useRouter();
  const { cart, addItem, removeItem, clearCart, total } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  /** โหลดสินค้า หมวดหมู่ และช่องทางชำระเงินที่พร้อมใช้งาน */
  async function fetchData() {
    setLoadingData(true);
    const [{ data: prod }, { data: cat }, { data: pay }] = await Promise.all([
      supabase.from("products").select("*, categories(name)").gt("quantity", 0),
      supabase.from("categories").select("*"),
      supabase.from("payment_methods").select("*"),
    ]);
    if (prod) setProducts(prod);
    if (cat) setCategories(cat);
    if (pay) setPaymentMethods(pay);
    setLoadingData(false);
  }

  useEffect(() => {
    // การเปลี่ยนสถานะเกิดหลังการรอผลจากฐานข้อมูลภายใน fetchData
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // โหลดข้อมูลครั้งเดียวเมื่อ mount เพื่อหลีกเลี่ยงการดึงข้อมูลซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "ทั้งหมด" || p.categories?.name === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);
    return matchCategory && matchSearch;
  });

  /** สร้างคำสั่งซื้อ บันทึกรายการย่อย ตัดสต็อก และเปิดใบเสร็จ */
  const handleCheckout = async () => {
     if (cart.length === 0) {
    toast.error("กรุณาเลือกสินค้า");
    return;
  }

  if (!selectedPayment) {
    toast.error("กรุณาเลือกวิธีชำระเงิน");
    return;
  }
    setLoading(true);
    try {
      // สร้างออเดอร์
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          payment_method_id: selectedPayment,
          total,
          status: "completed",
        })
        .select()
        .single();

      if (error || !order) throw error;

      // เพิ่ม order_items
      await supabase.from("order_items").insert(
        cart.map((c) => ({
          order_id: order.id,
          product_id: c.id,
          quantity: c.quantity,
          price: c.price,
          discount: c.discount,
        })),
      );

      // ลด stock สินค้า
      for (const c of cart) {
        const product = products.find((p) => p.id === c.id);
        if (product) {
          await supabase
            .from("products")
            .update({ quantity: product.quantity - c.quantity })
            .eq("id", c.id);
        }
      }

      clearCart();
      
      router.push(`/pos/receipt/${order.id}`);
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };
      // ฟังชั่นเพิ่มสินค้า
      const handleAddItem = (product: Product) => {
        const cartItem = cart.find(c => c.id === product.id)
        const currentQty = cartItem?.quantity ?? 0

        if (currentQty >= product.quantity) {
          toast.error(`${product.name} หมดแล้ว!`)
          return
        }
        addItem(product)
        toast.success(`เพิ่ม ${product.name} แล้ว`)
      }

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-300">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }
      
  return (
    <main className="min-h-screen bg-slate-950 text-white">
       <Navbar type="pos" />
      <div className="flex h-screen">
        {/* Left - Products */}
        <div className="flex flex-1 flex-col overflow-hidden p-6">
          {/* Search */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              ค้นหาสินค้า
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้า หรือสแกนบาร์โค้ด..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {["ทั้งหมด", ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl border px-5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-500 hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto pr-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddItem(product)}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-800 active:scale-95"
              >
                {/* Product Image */}
                <div className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-slate-800">
                  <span className="text-5xl">📦</span>
                </div>

                {/* Category */}
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {product.categories?.name}
                </p>

                {/* Product Name */}
                <h3 className="mt-2 line-clamp-2 min-h-[48px] font-semibold text-white group-hover:text-blue-400">
                  {product.name}
                </h3>

                {/* Footer */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-emerald-400">
                      ฿{product.price.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      คงเหลือ {product.quantity}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    เพิ่ม
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — ตะกร้า */}
        <div className="w-80 xl:w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">
              🛒 รายการสินค้า
            </h2>

            <p className="text-sm text-slate-400 mt-1">สินค้าในตะกร้า</p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="mt-16 text-center text-slate-500">
                <div className="mb-3 text-4xl">🛒</div>

                <p className="text-sm">ยังไม่มีสินค้า</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4"
                >
                  {/* Product Info */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.price.toFixed(2)} ฿ / ชิ้น
                    </p>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-white transition hover:bg-red-600"
                    >
                      -
                    </button>

                    <span className="w-6 text-center font-bold text-white">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => addItem(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-white transition hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>

                  {/* Total Price */}
                  <p className="min-w-[70px] text-right text-sm font-bold text-emerald-400">
                    {(item.price * item.quantity).toFixed(2)} ฿
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Payment */}

          <div className="border-t border-slate-800 p-5">
            {/* Payment Method */}
            <p className="mb-3 text-sm text-slate-400">วิธีชำระเงิน</p>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className={`rounded-xl py-3 text-sm font-semibold transition ${
                    selectedPayment === pm.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {pm.name}
                </button>
              ))}
            </div>

            {/* Total */}
            <div className="mb-5 flex items-center justify-between">
              <span className="text-slate-400">ยอดรวม</span>

              <span className="text-3xl font-bold text-white">
                {total.toFixed(2)} ฿
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  กำลังบันทึก...
                </span>
              ) : (
                `ชำระเงิน ${total.toFixed(2)} ฿`
              )}
            </button>

            {/* Clear Cart */}
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="mt-3 w-full text-sm text-slate-500 transition hover:text-red-400"
              >
                ล้างรายการทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
