"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";

type Category = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

/** จัดการรายการหมวดหมู่สินค้า รวมถึงการเพิ่ม แก้ไข และลบ */
export default function CategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchData();
    // โหลดข้อมูลครั้งเดียวเมื่อ mount เพื่อหลีกเลี่ยงการดึงข้อมูลซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** โหลดหมวดหมู่ทั้งหมดตามลำดับรหัส */
  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("id");
    if (data) setCategories(data);
    setLoading(false);
  }

  /** เปิดฟอร์มเปล่าสำหรับเพิ่มหมวดหมู่ใหม่ */
  const openAdd = () => {
    setEditCategory(null);
    setForm({ name: "", description: "" });
    setShowModal(true);
  };

  /** เปิดฟอร์มพร้อมข้อมูลของหมวดหมู่ที่เลือกเพื่อแก้ไข */
  const openEdit = (category: Category) => {
    setEditCategory(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
    });
    setShowModal(true);
  };

  /** ตรวจสอบและบันทึกหมวดหมู่ใหม่ หรืออัปเดตรายการเดิม */
  const handleSave = async () => {
    if (!form.name) return alert("กรุณากรอกชื่อหมวดหมู่");
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || null,
      };
      if (editCategory) {
        await supabase
          .from("categories")
          .update(data)
          .eq("id", editCategory.id);
      } else {
        await supabase.from("categories").insert(data);
      }
      setShowModal(false);
      fetchData();
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  /** ขอคำยืนยันก่อนลบหมวดหมู่ แล้วรีเฟรชรายการ */
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบหมวดหมู่?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchData();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-slate-400 transition hover:text-blue-400"
            >
              ← กลับ Admin
            </Link>

            <h1 className="mt-3 text-3xl font-bold">🏷️ จัดการหมวดหมู่</h1>

            <p className="mt-2 text-sm text-slate-400">
              ทั้งหมด {categories.length} หมวดหมู่
            </p>
          </div>

          <button
            onClick={openAdd}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            + เพิ่มหมวดหมู่
          </button>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500"
            >
              {/* Top */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                  🏷️
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-blue-600 hover:text-white"
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-600 hover:text-white"
                  >
                    ลบ
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold">{cat.name}</h3>

              <p className="mt-2 text-sm text-slate-400">
                {cat.description ?? "ไม่มีคำอธิบาย"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 text-xl font-bold">
              {editCategory ? "✏️ แก้ไขหมวดหมู่" : "+ เพิ่มหมวดหมู่ใหม่"}
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  ชื่อหมวดหมู่ *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  placeholder="เช่น เครื่องดื่ม"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  คำอธิบาย
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  placeholder="คำอธิบายหมวดหมู่"
                  rows={3}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl bg-slate-800 py-3 text-slate-300 transition hover:bg-slate-700"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
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
