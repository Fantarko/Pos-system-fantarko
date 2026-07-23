"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

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



useEffect(()=>{

async function load(){

const [
 {data:prod},
 {data:cat},
 {data:pay}
]=await Promise.all([

supabase
.from("products")
.select("*,categories(name)")
.gt("quantity",0),


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

setLoadingData(false);

}

load();

},[]);



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

setTimeout(()=>{
searchRef.current?.focus();
},100);


};



const filteredProducts=products.filter(p=>{


const matchCategory =
selectedCategory==="ทั้งหมด" ||
p.categories?.name===selectedCategory;



const matchSearch =
p.name
.toLowerCase()
.includes(search.toLowerCase())
||
p.barcode?.includes(search);



return matchCategory && matchSearch;


});



const handleCheckout=async()=>{


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



await supabase
.from("order_items")
.insert(

cart.map(item=>({

order_id:order.id,
product_id:item.id,
quantity:item.quantity,
price:item.price,
discount:item.discount

}))

);



clearCart();

setCustomer(null);
setPhone("");

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

return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-slate-950
text-white
">

กำลังโหลด...

</div>

)

}



return (

<main className="
min-h-screen
bg-slate-950
text-white
">


<Navbar type="pos"/>



<div className="
flex
flex-col
lg:flex-row
min-h-screen
">



{/* Product Area */}

<div className="
flex-1
p-6
">


<div className="
flex
gap-3
mb-4
">


<input

ref={searchRef}

value={search}

onChange={
e=>setSearch(e.target.value)
}


onKeyDown={
e=>{

if(e.key==="Enter"){

handleBarcode(search);

}

}

}


placeholder="
ค้นหาสินค้า หรือ ยิง Barcode
"


className="
flex-1
bg-slate-900
rounded-xl
p-3
outline-none
"


/>



<button

onClick={()=>setShowScanner(!showScanner)}

className="
bg-blue-600
px-4
rounded-xl
"

>

📷

</button>


</div>



{
showScanner && (

<BarcodeScanner

onScan={handleBarcode}

/>

)

}



<CategoryFilter

categories={[
"ทั้งหมด",
...categories.map(x=>x.name)
]}

selected={selectedCategory}

onChange={setSelectedCategory}

/>



<ProductGrid

products={filteredProducts}

onAdd={handleAddItem}

/>



</div>





{/* POS Side */}

<div className="
w-full
lg:w-96
bg-slate-900
border-l
border-slate-800
flex
flex-col
">


<CustomerBox

customer={customer}

phone={phone}

setPhone={setPhone}

/>



<CartPanel

cart={cart}

removeItem={removeItem}

addItem={addItem}

/>



<PaymentBox

payments={paymentMethods}

selected={selectedPayment}

setSelected={setSelectedPayment}

total={total}

checkout={handleCheckout}

loading={loading}

/>



</div>



</div>


</main>

)

}