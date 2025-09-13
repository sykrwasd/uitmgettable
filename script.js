import axios from "axios";

//const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result.cfm";
const url = "https://uitmtimetable.skrin.xyz/api.php?getfaculty"
const payload = new URLSearchParams({
  field1: "value1",
  field2: "value2",
  field3: "value3"
});

const res = await axios.post(url, payload.toString(), {
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/x-www-form-urlencoded"
  }
});

console.log(res.data); // parse it as HTML/JSON depending on response
