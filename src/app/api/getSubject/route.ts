import axios from "axios";

export async function POST(req: Request) {
  try {
    
    const campus = await req.json();
    console.log("receive",campus)
    
    const url = "https://uitmtimetable.com/api.php?getsubject"
    const payload = new URLSearchParams({
      subject: "",
      faculty: "",
      campus: `${campus}`
    });
    
    const res = await axios.post(url, payload.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/x-www-form-urlencoded",
        //"Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
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
