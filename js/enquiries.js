import "./guard.js";
import "./supabase.js";

const table = document.getElementById("enquiriesTable");

const modal = document.getElementById("enquiryModal");
const openBtn = document.getElementById("openEnquiryModal");
const closeBtn = document.getElementById("closeEnquiryModal");

const enqName = document.getElementById("enqName");
const enqParent = document.getElementById("enqParent");
const enqPhone = document.getElementById("enqPhone");
const enqCourse = document.getElementById("enqCourse");
const enqBatch = document.getElementById("enqBatch");
const enqStatus = document.getElementById("enqStatus");
const enqNotes = document.getElementById("enqNotes");

openBtn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";


/* LOAD COURSES */

async function loadCourses(){

const { data } = await supabase
.from("courses")
.select("id,name");

enqCourse.innerHTML = `<option value="">Select Course</option>`;

data.forEach(c => {

enqCourse.innerHTML +=
`<option value="${c.id}">${c.name}</option>`;

});

}


/* LOAD BATCHES */

async function loadBatches(){

const { data } = await supabase
.from("batches")
.select("id,name");

enqBatch.innerHTML = `<option value="">Select Batch</option>`;

data.forEach(b => {

enqBatch.innerHTML +=
`<option value="${b.id}">${b.name}</option>`;

});

}


/* LOAD ENQUIRIES */

async function loadEnquiries(){

const { data } = await supabase
.from("enquiries")
.select(`
*,
courses(name),
batches(name)
`)
.order("created_at",{ascending:false});

table.innerHTML = "";

data.forEach(e=>{

table.innerHTML += `

<tr>

<td>${e.student_name}</td>

<td>${e.parent_name || "-"}</td>

<td>${e.phone}</td>

<td>${e.courses?.name || "-"}</td>

<td>${e.batches?.name || "-"}</td>

<td>
  <span class="status-badge ${
    e.converted
      ? "status-converted"
      : e.status === "follow-up"
      ? "status-followup"
      : "status-new"
  }">
    ${e.converted ? "Converted" : e.status}
  </span>
</td>

<td>${e.notes || "-"}</td>

<td>${new Date(e.created_at).toLocaleDateString()}</td>

<td>

${
!e.converted
? `<button class="convertBtn" data-id="${e.id}">Convert</button>`
: "-"
}

</td>

</tr>

`;

});

}

loadEnquiries();


/* SAVE ENQUIRY */

document
.getElementById("saveEnquiry")
.addEventListener("click",async()=>{

if(!enqName.value || !enqPhone.value){

alert("Student name and phone required");
return;

}

await supabase
.from("enquiries")
.insert([{

student_name:enqName.value,
parent_name:enqParent.value,
phone:enqPhone.value,
course_id:enqCourse.value || null,
batch_id:enqBatch.value || null,
status:enqStatus.value,
notes:enqNotes.value

}]);

modal.style.display="none";

loadEnquiries();

});


/* CONVERT TO STUDENT */

document.addEventListener("click",async(e)=>{

if(!e.target.classList.contains("convertBtn")) return;

const id=e.target.dataset.id;

const { data } = await supabase
.from("enquiries")
.select("*")
.eq("id",id)
.single();

await supabase.from("students").insert([{

name:data.student_name,
phone:data.phone,
course_id:data.course_id,
batch_id:data.batch_id

}]);

await supabase
.from("enquiries")
.update({converted:true})
.eq("id",id);

loadEnquiries();

});


loadCourses();
loadBatches();