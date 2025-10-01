import axios from "axios";

export async function GET() {
  try {
   
    
    const url =  "https://uitmtimetable.com/api.php?getfaculty";
    
    
     const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
      }
    
    });

     return new Response(JSON.stringify(res.data), {
        status: 200,
      });
    
    
  } catch (err) {
    console.error("Error adding item:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subject" }), {
      status: 500,
    });
  }
}
