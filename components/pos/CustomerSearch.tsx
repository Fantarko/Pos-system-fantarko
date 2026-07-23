type Customer={
 id:number
 name:string
 phone:string
 points:number
}


type Props={
 phone:string
 customer:Customer|null
 setPhone:(v:string)=>void
 onSearch:()=>void
 onClear:()=>void
}


export default function CustomerSearch({
phone,
customer,
setPhone,
onSearch,
onClear
}:Props){

return (

<div className="p-5 border-b border-slate-800">


<div className="flex gap-2">

<input
value={phone}
onChange={e=>setPhone(e.target.value)}
placeholder="เบอร์โทร"
className="
flex-1
rounded-xl
bg-slate-800
px-3
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
customer &&

<div className="mt-3">

<p>
{customer.name}
</p>

<p>
แต้ม {customer.points}
</p>


<button
onClick={onClear}
className="text-red-400"
>
ยกเลิก
</button>


</div>

}


</div>

)

}