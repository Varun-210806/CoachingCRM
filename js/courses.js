import "./guard.js";
import "./supabase.js";

const container = document.getElementById("coursesList");

async function loadCourses(){

const { data: courses } = await supabase
.from("courses")
.select("*")
.order("name",{ascending:true});

container.innerHTML = "";

for(let course of courses){

// STUDENTS
const { data: students } = await supabase
.from("students")
.select("id")
.eq("course_id",course.id);

const studentCount = students?.length || 0;


// BATCHES
const { data: batches } = await supabase
.from("batches")
.select("id")
.eq("course_id",course.id);

const batchCount = batches?.length || 0;


// REVENUE
let revenue = 0;

if(students?.length){

const studentIds = students.map(s => s.id);

const { data: payments } = await supabase
.from("fees")
.select("amount")
.in("student_id",studentIds);

revenue = payments?.reduce((sum,p)=> sum + (p.amount || 0),0) || 0;

}


// ATTENDANCE
let attendanceRate = 0;

if(students?.length){

const studentIds = students.map(s => s.id);

const { data: attendance } = await supabase
.from("attendance")
.select("status")
.in("student_id",studentIds);

const present = attendance?.filter(a=>a.status==="present").length || 0;

attendanceRate = attendance?.length
? Math.round((present / attendance.length) * 100)
: 0;

}


// UI
container.innerHTML += `

<div class="course-card">

<div class="course-title">
${course.name}
</div>

<div class="course-meta">
Fee: ₹${course.fee || 0}
</div>

<div class="course-meta">
Students: ${studentCount}
</div>

<div class="course-meta">
Batches: ${batchCount}
</div>

<div class="course-meta">
Revenue: ₹${revenue}
</div>

<div class="course-meta">
Attendance: ${attendanceRate}%
</div>

<div class="course-actions">

<button class="course-btn viewBatchesBtn"
data-id="${course.id}">
View Batches
</button>

<button class="course-btn secondary editCourseBtn"
data-id="${course.id}">
Edit
</button>

</div>

</div>

`;

}

}

loadCourses();


// =====================
// VIEW BATCHES
// =====================

document.addEventListener("click",(e)=>{

if(!e.target.classList.contains("viewBatchesBtn")) return;

const courseId = e.target.dataset.id;

window.location.href = `batches.html?course=${courseId}`;

});


// =====================
// EDIT COURSE
// =====================

document.addEventListener("click", async (e)=>{

if(!e.target.classList.contains("editCourseBtn")) return;

const id = e.target.dataset.id;

const newName = prompt("Enter new course name");
const newFee = prompt("Enter course fee");

if(!newName) return;

await supabase
.from("courses")
.update({
name:newName,
fee:Number(newFee)
})
.eq("id",id);

alert("Course updated ✔");

loadCourses();

});