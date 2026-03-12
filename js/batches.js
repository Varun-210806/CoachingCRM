import "./guard.js";
import "./supabase.js";

const container = document.getElementById("batchesList");

(async () => {

  const { data: batches, error } = await supabase
    .from("batches")
    .select(`
      id,
      name,
      courses ( name )
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading batches:", error);
    return;
  }

  if (!batches || batches.length === 0) {
    container.innerHTML = "<p>No batches found</p>";
    return;
  }

  container.innerHTML = "";

  for (let batch of batches) {

    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", batch.id);

    container.innerHTML += `
      <div class="batch-card">

        <h3>${batch.name}</h3>

        <p>
          <strong>Course:</strong> 
          ${batch.courses?.name || "Not assigned"}
        </p>

        <p>
          <strong>Students:</strong> 
          ${count || 0}
        </p>

      </div>
    `;

  }

})();