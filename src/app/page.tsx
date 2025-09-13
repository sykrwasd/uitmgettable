"use client"

import Image from "next/image";
import { useEffect, useState } from "react";

type Scrapped = {
  code: string
  fullname:string
}

export default function Home() {


  const [rows,setRows] = useState<Scrapped[]>([])

  useEffect(()=>{
    scrapTable();
  },[])

   async function scrapTable(){
    try{

      const res = await fetch("/api/scrap");
      const data = await res.json();
      console.log(data)
      setRows(data)

    }catch{

    }
  }


  return (
  <div>
  
 {rows.map((i, idx) => (
  <div key={idx}>
    {i.code} {i.fullname}
  </div>
))}

  
  </div>
  );
}
