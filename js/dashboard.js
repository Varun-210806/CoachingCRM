import "./guard.js";
import "./supabase.js";


(async () => {

  /* =========================
     DASHBOARD STATS
  ========================= */
  /* =========================
   DASHBOARD STATS
========================= */

const studentsCountEl = document.getElementById("studentsCount");
const attendanceRateEl = document.getElementById("attendanceRate");
const feesEl = document.getElementById("pendingFees");
const totalTestsEl = document.getElementById("totalTests");

// STUDENTS
const { data: students = [] } = await supabase
  .from("students")
  .select("id");

if (studentsCountEl)
  studentsCountEl.innerText = students.length;

// ATTENDANCE
const { data: attendance = [] } = await supabase
  .from("attendance")
  .select("status");

const present = attendance.filter(a => a.status === "present").length;
const rate = attendance.length
  ? Math.round((present / attendance.length) * 100)
  : 0;

if (attendanceRateEl)
  attendanceRateEl.innerText = `${rate}%`;

// FEES
const { data: fees = [] } = await supabase
  .from("fees")
  .select("amount");

const totalPaid = fees.reduce((sum, f) => sum + (f.amount || 0), 0);

if (feesEl)
  feesEl.innerText = `₹${totalPaid}`;

// TESTS
const { data: tests = [] } = await supabase
  .from("tests")
  .select("id");

if (totalTestsEl)
  totalTestsEl.innerText = tests.length;
 
/* =========================
   MODAL CONTROLS
========================= */

const studentModal = document.getElementById("studentModal");
const courseModal = document.getElementById("courseModal");
const batchModal = document.getElementById("batchModal");
const paymentModal = document.getElementById("paymentModal");
const attendanceModal = document.getElementById("attendanceModal");

const show = (el) => {
  if (el) el.style.display = "flex";
};

const hide = (el) => {
  if (el) el.style.display = "none";
};

/* OPEN MODALS */

document.getElementById("addStudentBtn")?.addEventListener("click", async () => {
  show(studentModal);
  await loadCoursesAndBatches();
});

document.getElementById("addCourseBtn")?.addEventListener("click", () => {
  show(courseModal);
});

document.getElementById("addBatchBtn")?.addEventListener("click", async () => {
  show(batchModal);
  await loadCoursesAndBatches();
});

document.getElementById("recordPaymentBtn")?.addEventListener("click", async () => {
  show(paymentModal);
  await loadStudentsForPayment();
});

document.getElementById("markAttendanceBtn")?.addEventListener("click", async () => {
  show(attendanceModal);
  await loadStudentsForAttendance();
});

/* CLOSE MODALS */

const closeStudent = document.getElementById("closeStudentModal");
if (closeStudent) closeStudent.onclick = () => hide(studentModal);

const closeCourse = document.getElementById("closeCourseModal");
if (closeCourse) closeCourse.onclick = () => hide(courseModal);

const closeBatch = document.getElementById("closeBatchModal");
if (closeBatch) closeBatch.onclick = () => hide(batchModal);

const closePayment = document.getElementById("closePaymentModal");
if (closePayment) closePayment.onclick = () => hide(paymentModal);

const closeAttendance = document.getElementById("closeAttendanceModal");
if (closeAttendance) closeAttendance.onclick = () => hide(attendanceModal);

  /* =========================
     FORM ELEMENTS
  ========================= */

  // ENQUIRY
  const enqName = document.getElementById("enqName");
  const enqParent = document.getElementById("enqParent");
  const enqPhone = document.getElementById("enqPhone");
  const enqCourse = document.getElementById("enqCourse");
  const enqStatus = document.getElementById("enqStatus");
  const enqNotes = document.getElementById("enqNotes");
  const enquiryMsg = document.getElementById("enquiryMsg");

  // STUDENT
  const stuName = document.getElementById("stuName");
  const stuPhone = document.getElementById("stuPhone");
  const stuCourse = document.getElementById("stuCourse");
  const stuBatch = document.getElementById("stuBatch");
  const studentMsg = document.getElementById("studentMsg");

  // PAYMENT
const studentSearch = document.getElementById("studentSearch");
const studentDropdown = document.getElementById("studentDropdown");
const payAmount = document.getElementById("payAmount");
const payDate = document.getElementById("payDate");
const paymentMsg = document.getElementById("paymentMsg");
const paymentStatus = document.getElementById("paymentStatus");


// ✅ ADD THIS HERE
paymentStatus?.addEventListener("change", () => {
  if (paymentStatus.value === "pending") {
    payDate.value = "";
    payDate.disabled = true;
  } else {
    payDate.disabled = false;
  }
});

// ✅ INITIAL STATE CHECK
if (paymentStatus && paymentStatus.value === "pending") {
  payDate.disabled = true;
}



  let studentsCache = [];
  let selectedStudentId = null;

  // ATTENDANCE
  const attendanceList = document.getElementById("attendanceList");
  const attendanceMsg = document.getElementById("attendanceMsg");

  /* =========================
     LOAD STUDENTS (PAYMENT)
  ========================= */

  async function loadStudentsForPayment() {
    const { data } = await supabase
      .from("students")
      .select("id, name, phone")
      .order("name");

    studentsCache = data || [];
    if (studentSearch) studentSearch.value = "";
    if (studentDropdown) {
      studentDropdown.innerHTML = "";
      studentDropdown.style.display = "none";
    }
    selectedStudentId = null;
  }

  /* =========================
     SEARCHABLE DROPDOWN
  ========================= */

  studentSearch?.addEventListener("input", () => {
    const value = studentSearch.value.toLowerCase();
    studentDropdown.innerHTML = "";

    if (!value) {
      studentDropdown.style.display = "none";
      return;
    }

    studentsCache
      .filter(s =>
        s.name.toLowerCase().startsWith(value) ||
        s.phone.startsWith(value)
      )
      .forEach(s => {
        const div = document.createElement("div");
        div.textContent = `${s.name} – ${s.phone}`;
        div.onclick = () => {
          studentSearch.value = `${s.name} – ${s.phone}`;
          selectedStudentId = s.id;
          studentDropdown.style.display = "none";
        };
        studentDropdown.appendChild(div);
      });

    studentDropdown.style.display = "block";
  });

  /* =========================
     SAVE ENQUIRY
  ========================= */

  document.getElementById("saveEnquiry")?.addEventListener("click", async () => {
    enquiryMsg.textContent = "";

    if (!enqName.value.trim()) {
      enquiryMsg.textContent = "Student name is required";
      enquiryMsg.className = "form-msg error";
      return;
    }
const enqFollowUp = document.getElementById("enqFollowUp");
const enqPriority = document.getElementById("enqPriority");
const enqAssigned = document.getElementById("enqAssigned");

const payload = {
  student_name: enqName.value.trim(),
  parent_name: enqParent.value || null,
  phone: enqPhone.value || null,
  course_id: enqCourse?.value || null,
  status: enqStatus.value,
  notes: enqNotes.value || null,
  follow_up_date: enqFollowUp?.value || null,
  priority: enqPriority?.value || "normal",
  assigned_to: enqAssigned?.value || null
};


    const { error } = await supabase.from("enquiries").insert([payload]);

    enquiryMsg.textContent = error
      ? error.message
      : "Enquiry added successfully ✔";

    enquiryMsg.className = `form-msg ${error ? "error" : "success"}`;
  });

  /* =========================
     SAVE STUDENT
  ========================= */

  document.getElementById("saveStudent")?.addEventListener("click", async () => {
    studentMsg.textContent = "";

    if (!stuName.value.trim() || !stuPhone.value.trim()) {
      studentMsg.textContent = "Name and phone are required";
      studentMsg.className = "form-msg error";
      return;
    }

    const payload = {
  name: stuName.value.trim(),
  phone: stuPhone.value.trim(),
  course_id: stuCourse && stuCourse.value !== "" ? stuCourse.value : null,
  batch_id: stuBatch && stuBatch.value !== "" ? stuBatch.value : null
};


    const { error } = await supabase.from("students").insert([payload]);

    studentMsg.textContent = error
      ? error.message
      : "Student added successfully ✔";

    studentMsg.className = `form-msg ${error ? "error" : "success"}`;

    if (!error) {
      stuName.value = "";
      stuPhone.value = "";
      if (stuCourse) stuCourse.value = "";
      if (stuBatch) stuBatch.value = "";
    }
  });

  /* =========================
     SAVE PAYMENT
  ========================= */

  document.getElementById("savePayment")?.addEventListener("click", async () => {
    paymentMsg.textContent = "";

    if (!selectedStudentId || !payAmount.value) {
      paymentMsg.textContent = "Select student and amount";
      paymentMsg.className = "form-msg error";
      return;
    }

    const payload = {
  student_id: selectedStudentId,
  amount: Number(payAmount.value),
  paid_on: paymentStatus.value === "paid"
    ? (payDate.value || new Date().toISOString().split("T")[0])
    : null
};


    const { error } = await supabase.from("fees").insert([payload]);

    paymentMsg.textContent = error
      ? error.message
      : "Payment recorded successfully ✔";

    paymentMsg.className = `form-msg ${error ? "error" : "success"}`;
  });

  /* =========================
     ATTENDANCE
  ========================= */

  async function loadStudentsForAttendance() {
    attendanceList.innerHTML = "";

    const { data } = await supabase
      .from("students")
      .select("id, name")
      .order("name");

    data.forEach(s => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.innerHTML = `
        <span>${s.name}</span>
        <select data-id="${s.id}">
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
      `;
      attendanceList.appendChild(row);
    });
  }

  document.getElementById("saveAttendance")?.addEventListener("click", async () => {
    attendanceMsg.textContent = "";

    const today = new Date().toISOString().split("T")[0];
    const rows = attendanceList.querySelectorAll("select");

    const payload = Array.from(rows).map(r => ({
      student_id: r.dataset.id,
      status: r.value,
      date: today
    }));

    const { error } = await supabase.from("attendance").insert(payload);

    attendanceMsg.textContent = error
      ? error.message
      : "Attendance recorded successfully ✔";

    attendanceMsg.className = `form-msg ${error ? "error" : "success"}`;
  });
document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("convertBtn")) {

    const enquiryId = e.target.dataset.id;

    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single();

    if (error || !enquiry) {
      alert("Failed to fetch enquiry");
      return;
    }

    // Insert into students table
    const { error: insertError } = await supabase
      .from("students")
      .insert([{
        name: enquiry.student_name,
        phone: enquiry.phone,
        course_id: enquiry.course_id || null
      }]);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    // Mark as converted
    await supabase
      .from("enquiries")
      .update({ converted: true })
      .eq("id", enquiryId);

    alert("Enquiry converted to student ✔");

    location.reload(); // refresh to update UI
  }

});
document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("markPaidBtn")) {

    const button = e.target;   // store reference
    const feeId = button.dataset.id;
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("fees")
      .update({ paid_on: today })
      .eq("id", feeId);

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Instantly update UI without reload
    button.outerHTML = new Date(today).toLocaleDateString();

  }

});


  /* =========================
     LOGOUT
  ========================= */

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });

})();

/* =========================
   LOAD COURSES & BATCHES
========================= */

async function loadCoursesAndBatches() {
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name")
    .order("name");

  const { data: batches } = await supabase
    .from("batches")
    .select("id, name, course_id")
    .order("name");

  const stuCourse = document.getElementById("stuCourse");
  const stuBatch = document.getElementById("stuBatch");
  const enqCourse = document.getElementById("enqCourse");
  const batchCourse = document.getElementById("batchCourse"); // NEW

  // Populate course dropdowns
  [stuCourse, enqCourse, batchCourse].forEach(select => {
    if (select) {
      select.innerHTML = `<option value="">Select Course</option>`;
      courses?.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }
  });

  // Populate batch dropdown (for student form)
  if (stuBatch) {
    stuBatch.innerHTML = `<option value="">Select Batch</option>`;
    batches?.forEach(b => {
      stuBatch.innerHTML += `<option value="${b.id}">${b.name}</option>`;
    });
  }
}
/* =========================
   ADD COURSE
========================= */

document.getElementById("saveCourse")?.addEventListener("click", async () => {
  const courseNameEl = document.getElementById("courseName");
  const courseFeeEl = document.getElementById("courseFee");
  const courseMsg = document.getElementById("courseMsg");

  if (!courseNameEl?.value.trim()) {
    if (courseMsg) {
      courseMsg.textContent = "Course name is required";
      courseMsg.className = "form-msg error";
    }
    return;
  }

  const payload = {
    name: courseNameEl.value.trim(),
    fee: Number(courseFeeEl?.value || 0)
  };

  const { error } = await supabase
    .from("courses")
    .insert([payload]);

  if (courseMsg) {
    courseMsg.textContent = error
      ? error.message
      : "Course added successfully ✔";

    courseMsg.className = `form-msg ${error ? "error" : "success"}`;
  }

  if (!error) {
    courseNameEl.value = "";
    if (courseFeeEl) courseFeeEl.value = "";
    await loadCoursesAndBatches();
  }
});
/* =========================
   ADD BATCH
========================= */

document.getElementById("saveBatch")?.addEventListener("click", async () => {
  const batchNameEl = document.getElementById("batchName");
  const batchCourseEl = document.getElementById("batchCourse");
  const batchMsg = document.getElementById("batchMsg");

  if (!batchNameEl?.value.trim() || !batchCourseEl?.value) {
    if (batchMsg) {
      batchMsg.textContent = "Batch name and course are required";
      batchMsg.className = "form-msg error";
    }
    return;
  }

  const payload = {
    name: batchNameEl.value.trim(),
    course_id: batchCourseEl.value
  };

  const { error } = await supabase
    .from("batches")
    .insert([payload]);

  if (batchMsg) {
    batchMsg.textContent = error
      ? error.message
      : "Batch added successfully ✔";

    batchMsg.className = `form-msg ${error ? "error" : "success"}`;
  }

  if (!error) {
    batchNameEl.value = "";
    batchCourseEl.value = "";
    await loadCoursesAndBatches();
  }
});
