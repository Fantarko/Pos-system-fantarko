"use client";

import Loading from "@/hooks/components/Loading";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string | null;
  category_id: number;
  categories: { name: string };
};

type Category = {
  id: number;
  name: string;
};

/** จัดการสินค้า สต็อก และความสัมพันธ์กับหมวดหมู่ */
export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    barcode: "",
    category_id: "",
  });

  useEffect(() => {
    fetchData();
    // โหลดข้อมูลครั้งเดียวเมื่อ mount เพื่อหลีกเลี่ยงการดึงข้อมูลซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** โหลดสินค้าและหมวดหมู่ที่ใช้ในตารางและฟอร์ม */
  async function fetchData() {
    setLoading(true);
    const [{ data: prod }, { data: cat }] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("id"),
      supabase.from("categories").select("*"),
    ]);
    if (prod) setProducts(prod);
    if (cat) setCategories(cat);
    setLoading(false);
  }

  /** เปิดฟอร์มสินค้าใหม่พร้อมค่าเริ่มต้น */
  const openAdd = () => {
    setEditProduct(null);
    setForm({
      name: "",
      price: "",
      quantity: "",
      barcode: "",
      category_id: "",
    });
    setShowModal(true);
  };

  /** เติมข้อมูลสินค้าเดิมลงฟอร์มและเปิดหน้าต่างแก้ไข */
  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      barcode: product.barcode ?? "",
      category_id: product.category_id.toString(),
    });
    setShowModal(true);
  };

  /** ตรวจสอบข้อมูลและบันทึกสินค้าใหม่หรือการแก้ไข */
  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) {
      return alert("กรุณากรอกข้อมูลให้ครบ");
    }
    setSaving(true);
    try {
      const data = {
        name: form.name,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity) || 0,
        barcode: form.barcode || null,
        category_id: parseInt(form.category_id),
      };

      if (editProduct) {
        await supabase.from("products").update(data).eq("id", editProduct.id);
      } else {
        await supabase.from("products").insert(data);
      }

      setShowModal(false);
      fetchData();
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  /** ขอคำยืนยัน ลบสินค้า และโหลดข้อมูลใหม่ */
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบสินค้า?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search),
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
            <h1 className="text-3xl font-bold">📦 จัดการสินค้า</h1>

            <p className="mt-2 text-sm text-slate-400">
              ทั้งหมด {products.length} รายการ
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
            + เพิ่มสินค้า
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาสินค้า หรือบาร์โค้ด..."
          className="
          mb-6
          w-full
          rounded-xl
          border border-slate-700
          bg-slate-900
          px-4 py-3
          text-white
          outline-none
          placeholder:text-slate-500
          focus:border-blue-500
        "
        />

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-sm text-slate-400">
                  <th className="px-5 py-4 text-left">#</th>
                  <th className="px-5 py-4 text-left">สินค้า</th>
                  <th className="px-5 py-4 text-left">หมวดหมู่</th>
                  <th className="px-5 py-4 text-left">ราคา</th>
                  <th className="px-5 py-4 text-left">Stock</th>
                  <th className="px-5 py-4 text-left">Barcode</th>
                  <th className="px-5 py-4 text-left">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="
                    border-b border-slate-800
                    transition
                    hover:bg-slate-800/50
                  "
                  >
                    <td className="px-5 py-4 text-slate-400">{product.id}</td>

                    <td className="px-5 py-4 font-semibold">{product.name}</td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {product.categories?.name}
                    </td>

                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {product.price.toFixed(2)} ฿
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`
                        rounded-full
                        px-3 py-1
                        text-xs
                        font-bold

                        ${
                          product.quantity < 10
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }
                      `}
                      >
                        {product.quantity}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {product.barcode ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="
                          rounded-lg
                          bg-blue-500/10
                          px-3 py-1.5
                          text-xs
                          text-blue-400
                          transition
                          hover:bg-blue-600
                          hover:text-white
                        "
                        >
                          แก้ไข
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="
                          rounded-lg
                          bg-red-500/10
                          px-3 py-1.5
                          text-xs
                          text-red-400
                          transition
                          hover:bg-red-600
                          hover:text-white
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
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
        >
          <div
            className="
            w-full max-w-md
            rounded-2xl
            border border-slate-800
            bg-slate-900
            p-6
          "
          >
            <h2 className="mb-6 text-xl font-bold">
              {editProduct ? "✏️ แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  ชื่อสินค้า *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="
                  w-full rounded-xl
                  border border-slate-700
                  bg-slate-800
                  px-4 py-3
                  outline-none
                  focus:border-blue-500
                "
                  placeholder="ชื่อสินค้า"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  placeholder="ราคา"
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
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="จำนวน"
                  className="
                  rounded-xl
                  border border-slate-700
                  bg-slate-800
                  px-4 py-3
                  outline-none
                  focus:border-blue-500
                "
                />
              </div>

              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category_id: e.target.value,
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
              >
                <option value="">เลือกหมวดหมู่</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                value={form.barcode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    barcode: e.target.value,
                  })
                }
                placeholder="Barcode"
                className="
                rounded-xl
                border border-slate-700
                bg-slate-800
                px-4 py-3
                outline-none
                focus:border-blue-500
              "
              />
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
