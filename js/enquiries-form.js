import "./guard.js";
import "./supabase.js";

const form=document.getElementById("enquiryForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const studentName=document.getElementById("studentName").value;
const parentName=document.getElementById("parentName").value;
const phone=document.getElementById("phone").value;
const notes=document.getElementById("notes").value;

const { error } = await supabase
.from("enquiries")
.insert([{

student_name:studentName,
parent_name:parentName,
phone:phone,
notes:notes,
status:"new"

}]);

if(error){

alert(error.message);
return;

}

alert("Enquiry Added ✔");

window.location.href="enquiries.html";

});