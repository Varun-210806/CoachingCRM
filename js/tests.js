import "./guard.js";
import "./supabase.js";

const testName = document.getElementById("testName");
const testCourse = document.getElementById("testCourse");
const testBatch = document.getElementById("testBatch");
const testDate = document.getElementById("testDate");
const totalMarks = document.getElementById("totalMarks");
const testMsg = document.getElementById("testMsg");

const testsTable = document.getElementById("testsTable");
const marksSection = document.getElementById("marksSection");
const resultsSection = document.getElementById("resultsSection");
const analyticsSection = document.getElementById("analyticsSection");
const leaderboardSection = document.getElementById("leaderboardSection");
const enterMarksCard = document.getElementById("enterMarksCard");


/* =============================
LOAD COURSES
============================= */

async function loadCourses() {

  const { data } = await supabase
    .from("courses")
    .select("id,name");

  testCourse.innerHTML = `<option value="">Select Course</option>`;

  data?.forEach(c => {
    testCourse.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });

}


/* =============================
LOAD BATCHES
============================= */

async function loadBatches() {

  const { data } = await supabase
    .from("batches")
    .select("id,name");

  testBatch.innerHTML = `<option value="">Select Batch</option>`;

  data?.forEach(b => {
    testBatch.innerHTML += `<option value="${b.id}">${b.name}</option>`;
  });

}


/* =============================
SAVE TEST
============================= */

document.getElementById("saveTest").addEventListener("click", async () => {

  if (!testName.value || !testDate.value || !totalMarks.value) {
    testMsg.textContent = "All fields required";
    return;
  }

  const { error } = await supabase
    .from("tests")
    .insert([{
      name: testName.value,
      course_id: testCourse.value || null,
      batch_id: testBatch.value || null,
      test_date: testDate.value,
      total_marks: Number(totalMarks.value)
    }]);

  testMsg.textContent = error ? error.message : "Test Scheduled ✔";

  loadTests();
});


/* =============================
LOAD TESTS TABLE
============================= */

async function loadTests() {

  const { data } = await supabase
    .from("tests")
    .select("*")
    .order("test_date",{ascending:false});

  testsTable.innerHTML = "";

  data?.forEach(t => {

    testsTable.innerHTML += `
      <tr>
        <td>${t.name}</td>
        <td>${t.test_date}</td>
        <td>${t.total_marks}</td>

        <td>

          <button class="enterMarksBtn" data-id="${t.id}">
            Enter Marks
          </button>

          <button class="deleteTestBtn"
            data-id="${t.id}"
            style="margin-left:8px;background:#d33;color:white;">
            Delete
          </button>

        </td>
      </tr>
    `;

  });

}


/* =============================
ENTER MARKS
============================= */

document.addEventListener("click", async (e) => {

  if (!e.target.classList.contains("enterMarksBtn")) return;

  const testId = e.target.dataset.id;

  enterMarksCard.style.display = "block";

  const { data: test } = await supabase
    .from("tests")
    .select("*")
    .eq("id",testId)
    .single();

  const { data: students } = await supabase
    .from("students")
    .select("id,name")
    .eq("batch_id",test.batch_id)
    .order("name");

  const { data: marks } = await supabase
    .from("test_marks")
    .select("*")
    .eq("test_id",testId);

  marksSection.innerHTML = `
    <h4>${test.name} (${test.test_date})</h4>

    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Marks</th>
          <th>Absent</th>
        </tr>
      </thead>

      <tbody>

      ${students.map(s => {

        const existing = marks?.find(m => m.student_id === s.id);

        const markValue = existing?.marks_obtained ?? "";
        const absentChecked =
          existing && existing.marks_obtained === null ? "checked" : "";

        return `

        <tr>

          <td>${s.name}</td>

          <td>
            <input
              type="number"
              min="0"
              max="${test.total_marks}"
              value="${markValue}"
              data-test="${testId}"
              data-student="${s.id}"
              data-total="${test.total_marks}"
              class="markInput"
            />
          </td>

          <td>
            <input
              type="checkbox"
              ${absentChecked}
              class="absentCheckbox"
            />
          </td>

        </tr>
        `;

      }).join("")}

      </tbody>
    </table>

    <button id="saveMarks">Save Marks</button>
  `;

});


/* =============================
SAVE MARKS
============================= */

document.addEventListener("click", async (e) => {

  if (e.target.id !== "saveMarks") return;

  const rows = marksSection.querySelectorAll("tbody tr");

  for (let row of rows) {

    const input = row.querySelector(".markInput");
    const checkbox = row.querySelector(".absentCheckbox");

    const testId = input.dataset.test;
    const studentId = input.dataset.student;
    const total = Number(input.dataset.total);

    if (checkbox.checked) {

      await supabase
        .from("test_marks")
        .upsert({
          test_id:testId,
          student_id:studentId,
          marks_obtained:null
        },{onConflict:"test_id,student_id"});

      continue;
    }

    const value = input.value.trim();

    if (!/^\d+$/.test(value)) {
      alert("Marks must be numeric");
      return;
    }

    if (Number(value) > total) {
      alert("Marks cannot exceed total marks");
      return;
    }

    await supabase
      .from("test_marks")
      .upsert({
        test_id:testId,
        student_id:studentId,
        marks_obtained:Number(value)
      },{onConflict:"test_id,student_id"});

  }

  alert("Marks Saved ✔");

  enterMarksCard.style.display = "none";

  loadResults();

});


/* =============================
LOAD RESULTS + ANALYTICS
============================= */

async function loadResults() {

  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .order("test_date",{ascending:false});

  const { data: students } = await supabase
    .from("students")
    .select("id,name");

  let html = "";
  let analyticsHTML = "";
  let leaderboardHTML = "";

  for (let test of tests) {

    const { data: marks } = await supabase
      .from("test_marks")
      .select("*")
      .eq("test_id",test.id);

    let scores = [];

    html += `
      <div style="margin-bottom:28px;">
      <h4>${test.name} (${test.test_date})</h4>

      <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Marks</th>
        </tr>
      </thead>
      <tbody>
    `;

    marks?.forEach(m => {

      const student = students.find(s => s.id === m.student_id);

      if (!student) return;

      if (m.marks_obtained === null) {

        html += `
        <tr>
          <td>${student.name}</td>
          <td style="color:red;font-weight:600;">ABSENT</td>
        </tr>
        `;

      }

      else {

        scores.push(m.marks_obtained);

        html += `
        <tr>
          <td>${student.name}</td>
          <td>${m.marks_obtained} / ${test.total_marks}</td>
        </tr>
        `;

      }

    });

    html += `
      </tbody>
      </table>

      <button class="enterMarksBtn" data-id="${test.id}">
        Update Marks
      </button>

      </div>
    `;


    /* ===== ANALYTICS ===== */

    if (scores.length > 0) {

      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);
      const avg = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);

      const passCount = scores.filter(s => s >= test.total_marks*0.4).length;
      const passPercent = Math.round((passCount/scores.length)*100);

      analyticsHTML += `
      <div class="analytics-box">
        <p><b>${test.name}</b></p>
        <p>Highest: ${highest}</p>
        <p>Lowest: ${lowest}</p>
        <p>Average: ${avg}</p>
        <p>Pass %: ${passPercent}%</p>
      </div>
      `;

      const leaderboard = marks
        .filter(m => m.marks_obtained !== null)
        .sort((a,b)=>b.marks_obtained-a.marks_obtained);

      leaderboardHTML += `
      <h4>${test.name}</h4>
      <table>
      <thead>
      <tr>
      <th>Rank</th>
      <th>Student</th>
      <th>Marks</th>
      </tr>
      </thead>
      <tbody>
      `;

      leaderboard.forEach((m,i)=>{

        const student = students.find(s=>s.id===m.student_id);

        leaderboardHTML += `
        <tr>
          <td>${i+1}</td>
          <td>${student?.name || "-"}</td>
          <td>${m.marks_obtained}</td>
        </tr>
        `;

      });

      leaderboardHTML += `</tbody></table>`;
    }

  }

  resultsSection.innerHTML = html;
  analyticsSection.innerHTML = analyticsHTML;
  leaderboardSection.innerHTML = leaderboardHTML;

}


/* =============================
DELETE TEST
============================= */

document.addEventListener("click", async (e) => {

  if (!e.target.classList.contains("deleteTestBtn")) return;

  const testId = e.target.dataset.id;

  if (!confirm("Delete this test?")) return;

  await supabase.from("test_marks").delete().eq("test_id",testId);
  await supabase.from("tests").delete().eq("id",testId);

  alert("Test deleted ✔");

  loadTests();
  loadResults();

});


/* =============================
INIT
============================= */

loadCourses();
loadBatches();
loadTests();
loadResults();