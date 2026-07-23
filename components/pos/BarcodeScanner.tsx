"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";


type Props = {
  onScan: (code:string)=>void;
};


export default function BarcodeScanner({
  onScan
}:Props){


const scannerRef = useRef<any>(null);


useEffect(()=>{


scannerRef.current =
new Html5QrcodeScanner(

"barcode-reader",

{
 fps:10,

 qrbox:{
  width:250,
  height:150
 }

},

false

);



scannerRef.current.render(

(decodedText:string)=>{

onScan(decodedText)

},

()=>{}

);



return ()=>{

scannerRef.current?.clear()

}


},[])



return (

<div
className="
rounded-xl
overflow-hidden
border
border-slate-700
"
>

<div id="barcode-reader"/>

</div>

)


}