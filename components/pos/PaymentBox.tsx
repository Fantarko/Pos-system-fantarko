type Payment={
 id:number
 name:string
}


type Props={
 payments:Payment[]
 selected:number|null
 setSelected:(id:number)=>void
 total:number
 checkout:()=>void
 loading:boolean
}


export default function PaymentBox({
payments,
selected,
setSelected,
total,
checkout,
loading
}:Props){

return (

<div className="p-5 border-t border-slate-800">


<div className="grid grid-cols-3 gap-2">

{
payments.map(pm=>(

<button
key={pm.id}
onClick={()=>setSelected(pm.id)}
className={`
rounded-xl
py-3

${
selected===pm.id
?
"bg-blue-600"
:
"bg-slate-800"
}

`}
>

{pm.name}

</button>

))
}

</div>


<div className="my-5 text-3xl font-bold">
{total.toFixed(2)} ฿
</div>


<button
onClick={checkout}
disabled={loading}
className="
w-full
rounded-xl
bg-blue-600
py-4
"
>

{
loading
?
"กำลังบันทึก..."
:
"ชำระเงิน"
}

</button>


</div>

)

}