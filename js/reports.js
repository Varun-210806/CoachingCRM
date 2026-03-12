import "./guard.js";
import "./supabase.js";

(async () => {

  // TOTAL STUDENTS
  const { data: students = [] } = await supabase
    .from("students")
    .select("id, course_id, batch_id");

  document.getElementById("totalStudents").innerText = students.length;

  // TOTAL FEES
  const { data: fees = [] } = await supabase
    .from("fees")
    .select("amount");

  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  document.getElementById("totalFees").innerText = `₹${totalFees}`;

  // ATTENDANCE %
  const { data: attendance = [] } = await supabase
    .from("attendance")
    .select("status");

  const present = attendance.filter(a => a.status === "present").length;
  const rate = attendance.length
    ? Math.round((present / attendance.length) * 100)
    : 0;

  document.getElementById("attendancePercent").innerText = `${rate}%`;

  // COURSE REPORT
  const { data: courses = [] } = await supabase
    .from("courses")
    .select("id, name");

  const courseReport = document.getElementById("courseReport");
  courseReport.innerHTML = "";

  courses.forEach(course => {
    const count = students.filter(s => s.course_id === course.id).length;
    courseReport.innerHTML += `
      <p>${course.name} — ${count} students</p>
    `;
  });

  // BATCH REPORT
  const { data: batches = [] } = await supabase
    .from("batches")
    .select("id, name");

  const batchReport = document.getElementById("batchReport");
  batchReport.innerHTML = "";

  batches.forEach(batch => {
    const count = students.filter(s => s.batch_id === batch.id).length;
    batchReport.innerHTML += `
      <p>${batch.name} — ${count} students</p>
    `;
  });

  // ENQUIRY CONVERSION
  const { data: enquiries = [] } = await supabase
    .from("enquiries")
    .select("id");

  const conversionRate = enquiries.length
    ? Math.round((students.length / enquiries.length) * 100)
    : 0;

  document.getElementById("conversionRate").innerText = `${conversionRate}%`;

})();
