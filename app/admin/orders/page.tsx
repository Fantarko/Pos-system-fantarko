"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/hooks/components/Loading";

type Order = {
  id: number;
  total: number;
  status: string;
  created_at: string;
  payment_methods: { name: string } | null;
  staff: { name: string } | null;
  customers: { name: string } | null;
};

/** แสดง ค้นหา กรอง และปรับสถานะคำสั่งซื้อ */
export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");

  /** โหลดคำสั่งซื้อพร้อมข้อมูลลูกค้า พนักงาน และช่องทางชำระเงิน */
  async function fetchData() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, payment_methods(name), staff(name), customers(name)")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    // การเปลี่ยนสถานะเกิดหลังการรอผลจากฐานข้อมูลภายใน fetchData
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // โหลดข้อมูลครั้งเดียวเมื่อ mount เพื่อหลีกเลี่ยงการดึงข้อมูลซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** อัปเดตสถานะคำสั่งซื้อที่ระบุ แล้วโหลดข้อมูลล่าสุด */
  const handleUpdateStatus = async (id: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchData();
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toString().includes(search) ||
      o.customers?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.staff?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ทั้งหมด" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /** คืนค่า CSS class สีของสถานะคำสั่งซื้อ */
  const statusColor = (status: string) => {
    if (status === "completed") return "bg-green-500/20 text-green-400";
    if (status === "cancelled") return "bg-red-500/20 text-red-400";
    return "bg-yellow-500/20 text-yellow-400";
  };

  /** แปลงรหัสสถานะคำสั่งซื้อเป็นข้อความสำหรับผู้ใช้ */
  const statusLabel = (status: string) => {
    if (status === "completed") return "✅ สำเร็จ";
    if (status === "cancelled") return "❌ ยกเลิก";
    return "⏳ รอดำเนินการ";
  };

  const totalRevenue = filtered.reduce(
    (sum, o) => (o.status === "completed" ? sum + o.total : sum),
    0,
  );

  if (loading) {
    return <Loading />;
  }
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-slate-400 transition hover:text-blue-400"
            >
              ← Admin
            </Link>

            <h1 className="mt-3 text-3xl font-bold">📋 ประวัติการขาย</h1>

            <p className="mt-2 text-sm text-slate-400">
              ทั้งหมด {orders.length} ออเดอร์
            </p>
          </div>

          {/* Revenue Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4">
            <p className="text-sm text-slate-400">รายได้รวม</p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {totalRevenue.toFixed(2)} ฿
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ค้นหาออเดอร์ ลูกค้า พนักงาน..."
            className="
            flex-1 rounded-xl
            border border-slate-700
            bg-slate-900
            px-4 py-3
            text-white
            outline-none
            placeholder:text-slate-500
            focus:border-blue-500
          "
          />

          <div className="flex gap-2 overflow-x-auto">
            {["ทั้งหมด", "completed", "pending", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`
                whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition

                ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }
              `}
              >
                {status === "ทั้งหมด"
                  ? "ทั้งหมด"
                  : status === "completed"
                    ? "✅ สำเร็จ"
                    : status === "pending"
                      ? "⏳ รอดำเนินการ"
                      : "❌ ยกเลิก"}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-sm text-slate-400">
                  <th className="px-5 py-4 text-left">#</th>
                  <th className="px-5 py-4 text-left">ลูกค้า</th>
                  <th className="px-5 py-4 text-left">พนักงาน</th>
                  <th className="px-5 py-4 text-left">ชำระด้วย</th>
                  <th className="px-5 py-4 text-left">ยอดรวม</th>
                  <th className="px-5 py-4 text-left">สถานะ</th>
                  <th className="px-5 py-4 text-left">เวลา</th>
                  <th className="px-5 py-4 text-left">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="
                    border-b border-slate-800
                    transition
                    hover:bg-slate-800/50
                  "
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/pos/receipt/${order.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        #{order.id}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {order.customers?.name ?? "ลูกค้าทั่วไป"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {order.staff?.name ?? "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {order.payment_methods?.name ?? "-"}
                    </td>

                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {order.total.toFixed(2)} ฿
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`
                        rounded-full px-3 py-1 text-xs font-bold
                        ${statusColor(order.status)}
                      `}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(order.created_at).toLocaleString("th-TH")}
                    </td>

                    <td className="px-5 py-4">
                      {order.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "completed")
                            }
                            className="
                            rounded-lg
                            bg-emerald-500/10
                            px-3 py-1
                            text-xs
                            text-emerald-400
                            hover:bg-emerald-500
                            hover:text-white
                          "
                          >
                            ✅ สำเร็จ
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "cancelled")
                            }
                            className="
                            rounded-lg
                            bg-red-500/10
                            px-3 py-1
                            text-xs
                            text-red-400
                            hover:bg-red-500
                            hover:text-white
                          "
                          >
                            ❌ ยกเลิก
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
