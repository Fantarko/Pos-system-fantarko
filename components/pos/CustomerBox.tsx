"use client";


import type { Customer } from "@/types";


type Props = {
  customer: Customer | null;

  phone: string;

  setPhone: (value:string)=>void;

  onSearch?: ()=>void;

  onClear?: ()=>void;
};


export default function CustomerBox({

  customer,
  phone,
  setPhone,
  onSearch,
  onClear

}:Props){


return (

<div
className="
p-5
border-b
border-slate-800
"
>

<p className="
text-sm
text-slate-400
mb-3
">
👤 สมาชิก
</p>


<div className="flex gap-2">


<input

type="tel"

value={phone}

onChange={
e=>setPhone(e.target.value)
}

placeholder="เบอร์โทร"

maxLength={10}

className="
flex-1
rounded-xl
bg-slate-800
px-3
py-2
outline-none
"

/>


<button

onClick={onSearch}

className="
bg-blue-600
px-4
rounded-xl
"

>

ค้นหา

</button>


</div>



{
customer && (

<div
className="
mt-3
rounded-xl
bg-green-900/30
p-3
"
>

<p className="
font-semibold
text-green-400
">

{customer.name}

</p>


<p className="text-sm">

แต้ม {customer.points}

</p>


<button

onClick={onClear}

className="
text-xs
text-red-400
mt-2
"

>

ยกเลิกสมาชิก

</button>


</div>

)

}


</div>

)

}