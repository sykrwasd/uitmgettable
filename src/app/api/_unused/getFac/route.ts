import axios from "axios";

export async function GET() {
  try {
   
    
    const url =  "https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111II&key=All&page=1&page_limit=30";
    
    
    
    let res;
    let retries = 3;
    while (retries > 0) {
      try {
        res = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
          }
        });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        // Wait 500ms before retrying
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // console.log(res.data)
    // console.log(res.data.results)
    if (!res) throw new Error("Failed to fetch after retries");

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
