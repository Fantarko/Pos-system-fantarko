type Props={
 categories:string[]
 selected:string
 onChange:(value:string)=>void
}


export default function CategoryFilter({
categories,
selected,
onChange
}:Props){

return (

<div className="flex gap-3 overflow-x-auto">

{
categories.map(cat=>(

<button
key={cat}
onClick={()=>onChange(cat)}
className={`
px-5
py-2
rounded-xl
${
selected===cat
?
"bg-blue-600"
:
"bg-slate-800"
}
`}
>

{cat}

</button>

))
}

</div>

)

}