import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

/** โหลดคำสั่งซื้อตามรหัสและแสดงใบเสร็จสำหรับพิมพ์หรือบันทึก */
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, payment_methods(name)")
    .eq("id", id)
    .single();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(name)")
    .eq("order_id", id);

  const total =
    items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Receipt Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-center">
            <p className="mb-2 text-4xl">🧾</p>

            <h1 className="text-2xl font-bold">ใบเสร็จ</h1>

            <p className="mt-1 text-sm text-blue-100">ออเดอร์ #{order?.id}</p>
          </div>

          {/* Order Info */}
          <div className="border-b border-slate-800 p-6">
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-slate-400">วันที่</span>

              <span className="text-right">
                {new Date(order?.created_at).toLocaleString("th-TH")}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">ชำระด้วย</span>

              <span>{order?.payment_methods?.name}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-b border-slate-800 p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-400">
              รายการสินค้า
            </h2>

            {items?.map((item) => (
              <div
                key={item.id}
                className="mb-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{item.products?.name}</p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>

                <p className="font-bold text-emerald-400">
                  {(item.price * item.quantity).toFixed(2)} ฿
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-b border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-300">
                ยอดรวมทั้งหมด
              </span>

              <span className="text-3xl font-bold text-white">
                {total.toFixed(2)} ฿
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="border-b border-slate-800 p-6 text-center">
            <span className="rounded-full bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400">
              ✓ ชำระเงินสำเร็จ
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 p-6">
            <Link
              href="/pos"
              className="w-full rounded-xl bg-blue-600 py-3 text-center font-bold text-white transition hover:bg-blue-500"
            >
              🛒 ขายต่อ
            </Link>

            <Link
              href="/admin"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-center font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              ⚙️ ไปหน้า Admin
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-slate-600">
          POS System v1.0 © 2026
        </p>
      </div>
    </main>
  );
}
