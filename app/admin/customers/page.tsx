"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/hooks/components/Loading";

type Customer = {
  id: number;
  name: string;
  phone: string;
  points: number;
  created_at: string;
};

/** จัดการข้อมูลลูกค้า คะแนนสะสม และการค้นหาลูกค้า */
export default function CustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", points: "0" });

  useEffect(() => {
    fetchData();
    // โหลดข้อมูลครั้งเดียวเมื่อ mount เพื่อหลีกเลี่ยงการดึงข้อมูลซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** โหลดรายชื่อลูกค้าทั้งหมดตามลำดับรหัส */
  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").order("id");
    if (data) setCustomers(data);
    setLoading(false);
  }

  /** เปิดฟอร์มสำหรับสร้างข้อมูลลูกค้าใหม่ */
  const openAdd = () => {
    setEditCustomer(null);
    setForm({ name: "", phone: "", points: "0" });
    setShowModal(true);
  };

  /** เปิดฟอร์มพร้อมข้อมูลลูกค้าที่เลือก */
  const openEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      points: customer.points.toString(),
    });
    setShowModal(true);
  };

  /** ตรวจสอบและบันทึกข้อมูลลูกค้าใหม่หรือที่แก้ไข */
  // ฟังก์ชันนี้เตรียมไว้สำหรับฟอร์มที่กำลังสร้างในส่วน modal
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSave = async () => {
    if (!form.name || !form.phone) return alert("กรุณากรอกข้อมูลให้ครบ");
    if (form.phone.length !== 10) return alert("เบอร์โทรต้องมี 10 หลัก");
    setSaving(true);
    try {
      const data = {
        name: form.name,
        phone: form.phone,
        points: parseInt(form.points) || 0,
      };
      if (editCustomer) {
        await supabase.from("customers").update(data).eq("id", editCustomer.id);
      } else {
        await supabase.from("customers").insert(data);
      }
      setShowModal(false);
      fetchData();
    } catch {
      alert("เกิดข้อผิดพลาด อาจมีเบอร์นี้แล้ว");
    } finally {
      setSaving(false);
    }
  };

  /** ยืนยันการลบลูกค้า แล้วรีเฟรชรายการ */
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบลูกค้า?")) return;
    await supabase.from("customers").delete().eq("id", id);
    fetchData();
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
          <div>
            <Link
              href="/admin"
              className="text-slate-400 hover:text-white text-sm transition"
            >
              ← กลับหน้า Admin
            </Link>

            <h1 className="text-3xl font-bold mt-3">👥 จัดการลูกค้า</h1>

            <p className="text-slate-400 mt-1">
              ลูกค้าทั้งหมด {customers.length} คน
            </p>
          </div>

          <button
            onClick={openAdd}
            className="
          bg-blue-600
          hover:bg-blue-500
          px-6
          py-3
          rounded-xl
          font-semibold
          shadow-lg
          shadow-blue-900/30
          transition
          "
          >
            + เพิ่มลูกค้า
          </button>
        </div>

        {/* Search */}

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ หรือเบอร์โทร..."
            className="
          w-full
          bg-slate-900
          border
          border-slate-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder-slate-500
          outline-none
          focus:border-blue-500
          transition
          "
          />
        </div>

        {/* Table */}

        <div
          className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        overflow-hidden
        shadow-xl
        "
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="
                bg-slate-950
                border-b
                border-slate-800
                text-slate-400
                text-sm
                "
                >
                  <th className="text-left px-5 py-4">#</th>

                  <th className="text-left px-5 py-4">ลูกค้า</th>

                  <th className="text-left px-5 py-4">เบอร์โทร</th>

                  <th className="text-left px-5 py-4">คะแนน</th>

                  <th className="text-left px-5 py-4">วันที่สมัคร</th>

                  <th className="text-left px-5 py-4">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="
                  border-b
                  border-slate-800
                  hover:bg-slate-800/50
                  transition
                  "
                  >
                    <td className="px-5 py-4 text-slate-400">#{customer.id}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="
                        w-9
                        h-9
                        rounded-full
                        bg-blue-500/20
                        flex
                        items-center
                        justify-center
                        "
                        >
                          👤
                        </div>

                        <span className="font-semibold">{customer.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {customer.phone ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="
                      bg-yellow-500/10
                      text-yellow-400
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      "
                      >
                        ⭐ {customer.points} แต้ม
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400 text-sm">
                      {new Date(customer.created_at).toLocaleDateString(
                        "th-TH",
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(customer)}
                          className="
                        bg-slate-800
                        hover:bg-blue-600
                        px-3
                        py-2
                        rounded-lg
                        text-sm
                        transition
                        "
                        >
                          แก้ไข
                        </button>

                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="
                        bg-red-900/50
                        hover:bg-red-600
                        px-3
                        py-2
                        rounded-lg
                        text-sm
                        transition
                        "
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}

      {showModal && (
        <div
          className="
        fixed
        inset-0
        bg-black/70
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
        z-50
        "
        >
          <div
            className="
          bg-slate-900
          border
          border-slate-700
          rounded-2xl
          p-6
          w-full
          max-w-md
          shadow-2xl
          "
          >
            <h2 className="text-xl font-bold mb-6">
              {editCustomer ? "✏️ แก้ไขลูกค้า" : "+ เพิ่มลูกค้าใหม่"}
            </h2>

            {/* Form เดิมของคุณใส่ตรงนี้ได้ */}
          </div>
        </div>
      )}
    </main>
  );
}
