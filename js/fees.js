import "./guard.js";
import "./supabase.js";


(async () => {
  const collectedEl = document.getElementById("feesCollected");
  const pendingEl = document.getElementById("feesPending");
  const tableBody = document.getElementById("feesTable");

  if (!collectedEl || !pendingEl || !tableBody) return;

  // 1️⃣ Fetch students
  const { data: students, error: sErr } = await supabase
    .from("students")
    .select("id, name, course_id");

  if (sErr) {
    console.error(sErr);
    return;
  }

  // 2️⃣ Fetch courses
  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select("id, fee");

  if (cErr) {
    console.error(cErr);
    return;
  }

  // 3️⃣ Fetch fees (include id now)
  const { data: fees, error: fErr } = await supabase
    .from("fees")
    .select("id, student_id, amount, paid_on");

  if (fErr) {
    console.error(fErr);
    return;
  }

  let totalCollected = 0;
  let totalPending = 0;

  tableBody.innerHTML = "";

  students.forEach(student => {
    const course = courses.find(c => c.id === student.course_id);
    const courseFee = course?.fee || 0;

    const studentFees = fees.filter(f => f.student_id === student.id);
    const paid = studentFees.reduce((sum, f) => sum + (f.amount || 0), 0);

    totalCollected += paid;
    totalPending += Math.max(courseFee - paid, 0);

    if (studentFees.length === 0) {
      tableBody.innerHTML += `
        <tr>
          <td>${student.name}</td>
          <td>₹0</td>
          <td>-</td>
        </tr>
      `;
    } else {
      studentFees.forEach(f => {

        const paidColumn = f.paid_on
          ? new Date(f.paid_on).toLocaleDateString()
          : `<button class="markPaidBtn" data-id="${f.id}" data-amount="${f.amount}">Mark Paid</button>`;

        tableBody.innerHTML += `
          <tr>
            <td>${student.name}</td>
            <td>₹${f.amount}</td>
            <td>${paidColumn}</td>
          </tr>
        `;
      });
    }
  });

  collectedEl.innerText = `₹${totalCollected}`;
  pendingEl.innerText = `₹${totalPending}`;
})();


// =========================
// MARK PAID CLICK HANDLER
// =========================

document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("markPaidBtn")) {

    const button = e.target;
    const feeId = button.dataset.id;
    const amount = Number(button.dataset.amount);
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("fees")
      .update({ paid_on: today })
      .eq("id", feeId);

    if (error) {
      alert(error.message);
      return;
    }

    // Replace button with date
    button.outerHTML = new Date(today).toLocaleDateString();

    // Update totals instantly
    const collectedEl = document.getElementById("feesCollected");
    const pendingEl = document.getElementById("feesPending");

    const currentCollected = Number(collectedEl.innerText.replace("₹", ""));
    const currentPending = Number(pendingEl.innerText.replace("₹", ""));

    collectedEl.innerText = `₹${currentCollected + amount}`;
    pendingEl.innerText = `₹${Math.max(currentPending - amount, 0)}`;
  }

});
