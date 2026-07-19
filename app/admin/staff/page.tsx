"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/hooks/components/Loading";

type Staff = {
  id: number;
  name: string;
  staff_position: string;
  phone: string | null;
  salary: number;
  created_at: string;
};

/** จัดการรายชื่อพนักงาน ตำแหน่ง และข้อมูลการจ้างงาน */
export default function StaffPage() {
  const supabase = createClient();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState({
    name: "",
    staff_position: "พนักงาน",
    phone: "",
    salary: "",
  });

  useEffect(() => {
    fetchData();
    // โหลดข้อมูลครั้งเดียวเมื่อ mount เพื่อหลีกเลี่ยงการดึงข้อมูลซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** โหลดข้อมูลพนักงานทั้งหมดสำหรับตารางจัดการ */
  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from("staff").select("*").order("id");
    if (data) setStaff(data);
    setLoading(false);
  }

  /** เปิดฟอร์มเพิ่มพนักงานพร้อมค่าเริ่มต้น */
  const openAdd = () => {
    setEditStaff(null);
    setForm({ name: "", staff_position: "พนักงาน", phone: "", salary: "" });
    setShowModal(true);
  };

  /** เปิดฟอร์มแก้ไขโดยเติมข้อมูลของพนักงานที่เลือก */
  const openEdit = (s: Staff) => {
    setEditStaff(s);
    setForm({
      name: s.name,
      staff_position: s.staff_position,
      phone: s.phone ?? "",
      salary: s.salary.toString(),
    });
    setShowModal(true);
  };

  /** บันทึกพนักงานใหม่ หรืออัปเดตข้อมูลพนักงานเดิม */
  // ฟังก์ชันนี้เตรียมไว้สำหรับฟอร์มที่กำลังสร้างในส่วน modal
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSave = async () => {
    if (!form.name) return alert("กรุณากรอกชื่อพนักงาน");
    setSaving(true);
    try {
      const data = {
        name: form.name,
        staff_position: form.staff_position,
        phone: form.phone || null,
        salary: parseFloat(form.salary) || 0,
      };
      if (editStaff) {
        await supabase.from("staff").update(data).eq("id", editStaff.id);
      } else {
        await supabase.from("staff").insert(data);
      }
      setShowModal(false);
      fetchData();
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  /** ยืนยันการลบพนักงาน แล้วโหลดรายการใหม่ */
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบพนักงาน?")) return;
    await supabase.from("staff").delete().eq("id", id);
    fetchData();
  };

  /** คืนค่า CSS class ของป้ายตำแหน่งตามบทบาทพนักงาน */
  const positionColor = (position: string) => {
    if (position === "admin") return "bg-red-500/20 text-red-400";
    if (position === "ผู้จัดการ") return "bg-yellow-500/20 text-yellow-400";
    return "bg-blue-500/20 text-blue-400";
  };

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search),
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

            <h1 className="text-3xl font-bold mt-3">👨‍💼 จัดการพนักงาน</h1>

            <p className="text-slate-400 mt-1">
              พนักงานทั้งหมด {staff.length} คน
            </p>
          </div>

          <button
            onClick={openAdd}
            className="
          bg-blue-600 
          hover:bg-blue-500 
          px-6 py-3 
          rounded-xl 
          font-semibold
          shadow-lg
          shadow-blue-900/30
          transition
          "
          >
            + เพิ่มพนักงาน
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
          px-4 py-3
          text-white
          placeholder-slate-500
          outline-none
          focus:border-blue-500
          transition
          "
          />
        </div>

        {/* Staff Cards */}

        <div
          className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-5
      "
        >
          {filtered.map((s) => (
            <div
              key={s.id}
              className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
            hover:border-blue-500/50
            hover:-translate-y-1
            transition
            shadow-lg
            "
            >
              {/* Top */}

              <div className="flex justify-between items-start mb-5">
                <div
                  className="
                w-12 h-12
                rounded-xl
                bg-blue-500/10
                flex
                items-center
                justify-center
                text-2xl
                "
                >
                  👤
                </div>

                <span
                  className={`
                px-3 py-1
                rounded-full
                text-xs
                font-semibold
                ${positionColor(s.staff_position)}
                `}
                >
                  {s.staff_position}
                </span>
              </div>

              {/* Information */}

              <h3 className="text-lg font-bold">{s.name}</h3>

              <div className="mt-3 space-y-2 text-sm">
                <p className="text-slate-400">📞 {s.phone ?? "-"}</p>

                <p className="text-green-400 font-semibold">
                  💰 {s.salary.toLocaleString()} ฿ / เดือน
                </p>
              </div>

              {/* Action */}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => openEdit(s)}
                  className="
                flex-1
                bg-slate-800
                hover:bg-blue-600
                py-2
                rounded-xl
                text-sm
                transition
                "
                >
                  แก้ไข
                </button>

                <button
                  onClick={() => handleDelete(s.id)}
                  className="
                flex-1
                bg-red-900/50
                hover:bg-red-600
                py-2
                rounded-xl
                text-sm
                transition
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
        fixed inset-0
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
              {editStaff ? "✏️ แก้ไขพนักงาน" : "+ เพิ่มพนักงานใหม่"}
            </h2>

            {/* form เดิมใส่ตรงนี้ได้ */}
          </div>
        </div>
      )}
    </main>
  );
}
