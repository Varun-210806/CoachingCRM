import "./supabase.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) alert(error.message);
    else window.location.href = "dashboard.html";
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (error) alert(error.message);
    else window.location.href = "login.html";
  });
}
