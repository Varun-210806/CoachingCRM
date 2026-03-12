import "./guard.js";
import "./supabase.js";

(async () => {

  const attendanceTable = document.getElementById("attendanceTable");
  const totalStudentsEl = document.getElementById("totalStudents");
  const presentEl = document.getElementById("presentCount");
  const absentEl = document.getElementById("absentCount");
  const attendanceDate = document.getElementById("attendanceDate");
  const loadBtn = document.getElementById("loadAttendanceBtn");

  if (!attendanceTable) {
    console.error("attendanceTable not found");
    return;
  }

  // Fetch students
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, name")
    .order("name");

  if (studentError) {
    console.error(studentError);
    return;
  }

  totalStudentsEl.textContent = students.length;

  // Set today's date by default
  const today = new Date().toISOString().split("T")[0];
  attendanceDate.value = today;

  // Load attendance for selected date
  async function loadAttendance(date) {

    const { data: attendance, error } = await supabase
      .from("attendance")
      .select("student_id, status")
      .eq("date", date);

    if (error) {
      console.error(error);
      return;
    }

    let present = 0;
    let absent = 0;

    attendanceTable.innerHTML = "";

    students.forEach(student => {

      const record = attendance.find(a => a.student_id === student.id);
      const status = record ? record.status : "absent";

      if (status === "present") present++;
      else absent++;

      const statusBadge =
        status === "present"
          ? `<span class="status-present">Present</span>`
          : `<span class="status-absent">Absent</span>`;

      attendanceTable.innerHTML += `
        <tr>
          <td>${student.name}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });

    presentEl.textContent = present;
    absentEl.textContent = absent;
  }

  // Load today's attendance on page load
  loadAttendance(today);

  // Button click to search attendance by date
  loadBtn.addEventListener("click", () => {

    const selectedDate = attendanceDate.value;

    if (!selectedDate) {
      alert("Select a date");
      return;
    }

    loadAttendance(selectedDate);

  });

})();