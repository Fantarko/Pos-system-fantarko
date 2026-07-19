"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/hooks/components/Loading";

type Promotion = {
  id: number;
  name: string;
  discount: number;
  start_date: string;
  end_date: string;
  created_at: string;
};

type Product = {
  id: number;
  name: string;
};

/** จัดการโปรโมชัน ช่วงเวลาใช้งาน และสินค้าที่เข้าร่วม */
export default function PromotionsPage() {
  const supabase = createClient();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: "",
    discount: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchData();
    // โหลดข้อมูลครั้งเดียวเมื่อ mount เพื่อหลีกเลี่ยงการดึงข้อมูลซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** โหลดโปรโมชันและรายการสินค้าเพื่อใช้ในหน้าและฟอร์ม */
  async function fetchData() {
    setLoading(true);
    const [{ data: promo }, { data: prod }] = await Promise.all([
      supabase.from("promotions").select("*").order("id"),
      supabase.from("products").select("id, name").order("name"),
    ]);
    if (promo) setPromotions(promo);
    if (prod) setProducts(prod);
    setLoading(false);
  }

  /** เปิดฟอร์มเพิ่มโปรโมชันด้วยค่าเริ่มต้น */
  const openAdd = () => {
    setEditPromotion(null);
    setSelectedProducts([]);
    setForm({
      name: "",
      discount: "",
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
    });
    setShowModal(true);
  };

  /** เปิดฟอร์มแก้ไขพร้อมข้อมูลของโปรโมชันที่เลือก */
  const openEdit = (promo: Promotion) => {
    setEditPromotion(promo);
    setForm({
      name: promo.name,
      discount: promo.discount.toString(),
      start_date: new Date(promo.start_date).toISOString().slice(0, 16),
      end_date: new Date(promo.end_date).toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  /** เพิ่มหรือนำสินค้าออกจากรายการสินค้าที่ร่วมโปรโมชัน */
  const toggleProduct = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  /** บันทึกโปรโมชันและความสัมพันธ์กับสินค้าที่เลือก */
  const handleSave = async () => {
    if (!form.name || !form.discount) return alert("กรุณากรอกข้อมูลให้ครบ");
    setSaving(true);
    try {
      const data = {
        name: form.name,
        discount: parseFloat(form.discount),
        start_date: form.start_date,
        end_date: form.end_date,
      };

      if (editPromotion) {
        await supabase
          .from("promotions")
          .update(data)
          .eq("id", editPromotion.id);
      } else {
        const { data: promo } = await supabase
          .from("promotions")
          .insert(data)
          .select()
          .single();

        // เพิ่มสินค้าในโปรโมชั่น
        if (promo && selectedProducts.length > 0) {
          await supabase.from("promotion_items").insert(
            selectedProducts.map((pid) => ({
              promotion_id: promo.id,
              product_id: pid,
              discount: parseFloat(form.discount),
            })),
          );
        }
      }

      setShowModal(false);
      fetchData();
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  /** ยืนยันและลบโปรโมชันตามรหัส */
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบโปรโมชั่น?")) return;
    await supabase.from("promotion_items").delete().eq("promotion_id", id);
    await supabase.from("promotions").delete().eq("id", id);
    fetchData();
  };

  /** ตรวจสอบว่าโปรโมชันอยู่ในช่วงวันที่ใช้งานหรือไม่ */
  const isActive = (promo: Promotion) => {
    const now = new Date();
    return new Date(promo.start_date) <= now && now <= new Date(promo.end_date);
  };

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

            <h1 className="mt-3 text-3xl font-bold">🎁 จัดการโปรโมชั่น</h1>

            <p className="mt-2 text-sm text-slate-400">
              ทั้งหมด {promotions.length} โปรโมชั่น
            </p>
          </div>

          <button
            onClick={openAdd}
            className="
            rounded-xl
            bg-blue-600
            px-6 py-3
            font-semibold
            transition
            hover:bg-blue-500
          "
          >
            + เพิ่มโปรโมชั่น
          </button>
        </div>

        {/* Promotion Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="
              rounded-2xl
              border border-slate-800
              bg-slate-900
              p-5
              transition
              hover:border-blue-500
            "
            >
              <div className="mb-5 flex items-start justify-between">
                <div
                  className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-xl
                  bg-amber-500/10
                  text-2xl
                "
                >
                  🎁
                </div>

                <span
                  className={`
                  rounded-full
                  px-3 py-1
                  text-xs
                  font-bold

                  ${
                    isActive(promo)
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-700 text-slate-400"
                  }
                `}
                >
                  {isActive(promo) ? "✅ ใช้งานได้" : "⏸️ หมดแล้ว"}
                </span>
              </div>

              <h3 className="text-lg font-bold">{promo.name}</h3>

              <p className="mt-2 text-2xl font-bold text-amber-400">
                ลด {promo.discount}%
              </p>

              <div className="my-4 text-sm text-slate-400">
                <p>
                  เริ่ม:{" "}
                  {new Date(promo.start_date).toLocaleDateString("th-TH")}
                </p>

                <p>
                  สิ้นสุด:{" "}
                  {new Date(promo.end_date).toLocaleDateString("th-TH")}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(promo)}
                  className="
                  flex-1
                  rounded-xl
                  bg-blue-500/10
                  py-2
                  text-sm
                  text-blue-400
                  hover:bg-blue-600
                  hover:text-white
                "
                >
                  แก้ไข
                </button>

                <button
                  onClick={() => handleDelete(promo.id)}
                  className="
                  flex-1
                  rounded-xl
                  bg-red-500/10
                  py-2
                  text-sm
                  text-red-400
                  hover:bg-red-600
                  hover:text-white
                "
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/60
          p-4
          backdrop-blur-sm
        "
        >
          <div
            className="
            max-h-[90vh]
            w-full
            max-w-md
            overflow-y-auto
            rounded-2xl
            border border-slate-800
            bg-slate-900
            p-6
          "
          >
            <h2 className="mb-6 text-xl font-bold">
              {editPromotion ? "✏️ แก้ไขโปรโมชั่น" : "+ เพิ่มโปรโมชั่นใหม่"}
            </h2>

            <div className="flex flex-col gap-5">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="ชื่อโปรโมชั่น"
                className="
                rounded-xl
                border border-slate-700
                bg-slate-800
                px-4 py-3
                outline-none
                focus:border-blue-500
              "
              />

              <input
                type="number"
                value={form.discount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount: e.target.value,
                  })
                }
                placeholder="ส่วนลด %"
                min="0"
                max="100"
                className="
                rounded-xl
                border border-slate-700
                bg-slate-800
                px-4 py-3
                outline-none
                focus:border-blue-500
              "
              />

              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    start_date: e.target.value,
                  })
                }
                className="
                rounded-xl
                border border-slate-700
                bg-slate-800
                px-4 py-3
                outline-none
                focus:border-blue-500
              "
              />

              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    end_date: e.target.value,
                  })
                }
                className="
                rounded-xl
                border border-slate-700
                bg-slate-800
                px-4 py-3
                outline-none
                focus:border-blue-500
              "
              />

              {!editPromotion && (
                <div>
                  <p className="mb-2 text-sm text-slate-400">
                    เลือกสินค้าในโปรโมชั่น
                  </p>

                  <div
                    className="
                    max-h-40
                    overflow-y-auto
                    rounded-xl
                    border border-slate-700
                    bg-slate-800
                    p-3
                  "
                  >
                    {products.map((prod) => (
                      <label
                        key={prod.id}
                        className="
                        flex
                        cursor-pointer
                        items-center
                        gap-3
                        py-2
                        text-sm
                        hover:text-blue-400
                      "
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(prod.id)}
                          onChange={() => toggleProduct(prod.id)}
                          className="accent-blue-500"
                        />

                        {prod.name}
                      </label>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    เลือกแล้ว {selectedProducts.length} รายการ
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="
                flex-1
                rounded-xl
                bg-slate-800
                py-3
                text-slate-300
                hover:bg-slate-700
              "
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="
                flex-1
                rounded-xl
                bg-blue-600
                py-3
                font-bold
                hover:bg-blue-500
                disabled:opacity-50
              "
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
