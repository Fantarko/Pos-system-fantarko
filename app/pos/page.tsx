"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

import ProductGrid from "@/components/pos/ProductGrid";
import CategoryFilter from "@/components/pos/CategoryFilter";
import CustomerBox from "@/components/pos/CustomerBox";
import CartPanel from "@/components/pos/CartPanel";
import PaymentBox from "@/components/pos/PaymentBox";
import BarcodeScanner from "@/components/pos/BarcodeScanner";

import type {
  Product,
  Category,
  PaymentMethod,
  Customer
} from "@/types";
import Loading from "@/components/Loading";


export default function POSPage(){

const supabase=createClient();
const router=useRouter();

const {loading:authLoading}=useAuth("staff");


const {
 cart,
 addItem,
 removeItem,
 clearCart,
 total
}=useCart();


const searchRef = useRef<HTMLInputElement>(null);


const [products,setProducts]=useState<Product[]>([]);
const [categories,setCategories]=useState<Category[]>([]);
const [paymentMethods,setPaymentMethods]=useState<PaymentMethod[]>([]);

const [search,setSearch]=useState("");
const [selectedCategory,setSelectedCategory]=useState("ทั้งหมด");

const [selectedPayment,setSelectedPayment]=useState<number|null>(null);

const [customer,setCustomer]=useState<Customer|null>(null);
const [phone,setPhone]=useState("");

const [loading,setLoading]=useState(false);
const [loadingData,setLoadingData]=useState(true);

const [showScanner,setShowScanner]=useState(false);



useEffect(() => {
  async function load() {
    try {
      const [
        { data: prod },
        { data: cat },
        { data: pay }
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*,categories(name)")
          .gt("quantity", 0),

        supabase
          .from("categories")
          .select("*"),

        supabase
          .from("payment_methods")
          .select("*")
      ]);

      setProducts(prod ?? []);
      setCategories(cat ?? []);
      setPaymentMethods(pay ?? []);
    } catch {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoadingData(false);
    }
  }

  load();
}, []);



const handleAddItem=(product:Product)=>{

const item=cart.find(
x=>x.id===product.id
);


if((item?.quantity ?? 0) >= product.quantity){

toast.error("สินค้าไม่พอ");
return;

}


addItem(product);

toast.success(
`เพิ่ม ${product.name}`
);

};



const handleBarcode=(code:string)=>{


const product=products.find(
p=>p.barcode===code.trim()
);


if(!product){

toast.error("ไม่พบสินค้า");
return;

}


handleAddItem(product);

setSearch("");

requestAnimationFrame(() => {
  searchRef.current?.focus();
});


};


const filteredProducts = useMemo(() => {
  return products.filter((p) => {
    const matchCategory =
      selectedCategory === "ทั้งหมด" ||
      p.categories?.name === selectedCategory;

    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);

    return matchCategory && matchSearch;
  });
}, [products, search, selectedCategory]);



const handleCheckout=async()=>{

if (loading) return;
if(cart.length===0){

toast.error("ไม่มีสินค้า");
return;

}


if(!selectedPayment){

toast.error("เลือกช่องทางชำระเงิน");
return;

}


setLoading(true);


try{


const {data:order,error}=await supabase
.from("orders")
.insert({

payment_method_id:selectedPayment,
total,
status:"completed"

})
.select()
.single();



if(error) throw error;



const { error: itemError } = await supabase
  .from("order_items")
  .insert(
    cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount
    }))
  );

if (itemError) throw itemError;



clearCart();

setCustomer(null);
setPhone("");
toast.success("ชำระเงินสำเร็จ");
router.push(
`/pos/receipt/${order.id}`
);



}catch{

toast.error(
"เกิดข้อผิดพลาด"
);


}finally{

setLoading(false);

}


};

if(authLoading || loadingData){
    return(<Loading/>);
}
return (
  <main className="min-h-dvh bg-slate-950 text-white overflow-hidden">
    <Navbar type="pos" />

    <div className="flex flex-col lg:flex-row h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)]">
      {/* ================= PRODUCT ================= */}
      <section className="flex-1 overflow-hidden p-2 sm:p-4 lg:p-5 flex flex-col min-h-0">
        {/* Search */}
        <div className="flex gap-2 mb-2 sm:mb-3">
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search) handleBarcode(search);
            }}
            placeholder="ค้นหาสินค้า / ยิงบาร์โค้ด"
            className="
              flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl
              bg-slate-900 border border-slate-800
              px-3 sm:px-4 text-xs sm:text-sm
              outline-none focus:border-blue-500
            "
          />

          <button
            onClick={() => setShowScanner(!showScanner)}
            className="
              h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl
              bg-blue-600 flex items-center justify-center
              text-lg sm:text-xl active:scale-95 shrink-0
            "
          >
            📷
          </button>
        </div>

        {/* Scanner */}
        {showScanner && (
          <div className="mb-2 sm:mb-3 rounded-lg sm:rounded-xl overflow-hidden">
            <BarcodeScanner onScan={handleBarcode} />
          </div>
        )}

        {/* Category */}
        <div className="mb-2 sm:mb-3 overflow-x-auto">
          <CategoryFilter
            categories={["ทั้งหมด", ...categories.map((x) => x.name)]}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto pb-3 sm:pb-5 min-h-0">
          <ProductGrid products={filteredProducts} onAdd={handleAddItem} />
        </div>
      </section>

      {/* ================= CART ================= */}
      <aside
        className="
          w-full lg:w-96
          bg-slate-900
          border-t lg:border-t-0 lg:border-l border-slate-800
          flex flex-col
          h-[55dvh] lg:h-auto lg:max-h-none
          shrink-0
        "
      >
        <div className="shrink-0">
          <CustomerBox customer={customer} phone={phone} setPhone={setPhone} />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <CartPanel cart={cart} removeItem={removeItem} addItem={addItem} />
        </div>

        <div className="shrink-0">
          <PaymentBox
            payments={paymentMethods}
            selected={selectedPayment}
            setSelected={setSelectedPayment}
            total={total}
            checkout={handleCheckout}
            loading={loading}
          />
        </div>
      </aside>
    </div>
  </main>
);
}