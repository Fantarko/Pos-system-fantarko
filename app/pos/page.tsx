"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
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

import type {
 Product,
 Category,
 PaymentMethod,
 Customer
} from "@/types";


export default function POSPage(){

const supabase=createClient()
const router=useRouter()

const {loading:authLoading}=useAuth("staff")

const {
 cart,
 addItem,
 removeItem,
 clearCart,
 total
}=useCart()


const [products,setProducts]=useState<Product[]>([])
const [categories,setCategories]=useState<Category[]>([])
const [paymentMethods,setPaymentMethods]=useState<PaymentMethod[]>([])

const [search,setSearch]=useState("")
const [selectedCategory,setSelectedCategory]=useState("ทั้งหมด")

const [selectedPayment,setSelectedPayment]=useState<number|null>(null)

const [customer,setCustomer]=useState<Customer|null>(null)
const [phone,setPhone]=useState("")

const [loading,setLoading]=useState(false)
const [loadingData,setLoadingData]=useState(true)



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

])


setProducts(prod??[])
setCategories(cat??[])
setPaymentMethods(pay??[])

setLoadingData(false)

}

load()

},[])



const filteredProducts=products.filter(p=>{

const category =
selectedCategory==="ทั้งหมด" ||
p.categories?.name===selectedCategory


const keyword =
p.name
.toLowerCase()
.includes(search.toLowerCase())
||
p.barcode?.includes(search)


return category && keyword

})



const handleAddItem=(product:Product)=>{

const item=cart.find(
x=>x.id===product.id
)

if((item?.quantity??0)>=product.quantity){

toast.error("สินค้าไม่พอ")
return

}

addItem(product)

}



const handleCheckout=async()=>{

if(cart.length===0){
toast.error("ไม่มีสินค้า")
return
}


if(!selectedPayment){

toast.error("เลือกช่องทางชำระเงิน")
return

}


setLoading(true)

try{


const {data:order,error}=await supabase
.from("orders")
.insert({

payment_method_id:selectedPayment,
total,
status:"completed"

})
.select()
.single()


if(error) throw error



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

)



clearCart()

setCustomer(null)
setPhone("")


router.push(
`/pos/receipt/${order.id}`
)


}catch{

toast.error("เกิดข้อผิดพลาด")

}finally{

setLoading(false)

}


}



if(authLoading||loadingData){

return <div>Loading...</div>

}



return (

<main className="min-h-screen bg-slate-950 text-white">


<Navbar type="pos"/>


<div className="
flex
flex-col
lg:flex-row
min-h-screen
">


<div className="
flex-1
p-6
">


<input

value={search}

onChange={
e=>setSearch(e.target.value)
}

placeholder="ค้นหาสินค้า"

className="
w-full
bg-slate-900
rounded-xl
p-3
"

/>



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



<CartPanel

cart={cart}

removeItem={removeItem}

addItem={addItem}

/>



<CustomerBox

customer={customer}

phone={phone}

setPhone={setPhone}

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


</main>

)

}