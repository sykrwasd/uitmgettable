import axios from "axios";

export async function GET() {
  try {
   
    
    const url =  "https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30";
    
    
    
     const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
      }
    
    });

    // console.log(res.data)
    // console.log(res.data.results)

     return new Response(JSON.stringify(res.data.results), {
        status: 200,
      });
    
    
  } catch (err) {
    console.error("Error adding item:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subject" }), {
      status: 500,
    });
  }
}
