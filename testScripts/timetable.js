import axios from "axios";

async function scrape() {
  const url = "https://cdn.uitm.edu.my/jadual/baru/2024441874.json";

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://mystudent.uitm.edu.my/",
    },
  });

  const rawData = res.data;
  //console.log(rawData)
  
 const seen = new Set();
  // Reformat only the dates that have jadual data
  const reformattedData = Object.values(rawData)
      .filter((day) => day && day.jadual && day.jadual.length > 0)
      .flatMap((day) =>
        day.jadual.map((cls) => {
          const item = {
            day_time: `${day.hari.toUpperCase()}( ${cls.masa} )`,
            class_code: cls.courseid,
             venue: cls.bilik,
        lecturer: cls.lecturer,
          };
          const key = `${item.day_time}-${item.class_code}`;
          if (seen.has(key)) return null; // skip duplicates
          seen.add(key);
          return item;
        })
      )
      .filter(Boolean); // remove nulls

      //console.log(JSON.stringify(res.data, null, 2));
  console.log(JSON.stringify(reformattedData, null, 2));
}

scrape().catch(console.error);
