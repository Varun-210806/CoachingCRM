import "./supabase.js";

const { data } = await supabase.auth.getUser();
if (!data.user) {
  window.location.href = "login.html";
}
