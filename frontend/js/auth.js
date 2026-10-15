// Step 2: client-side validation only. Real authentication arrives in Steps 3, 5 and 6.
const f=document.getElementById("authForm"),err=document.getElementById("err"),reg=f.dataset.mode==="register";
f.onsubmit=e=>{e.preventDefault();const v=n=>f.elements[n]?.value.trim();
 const bad=m=>err.textContent=m;
 if(reg&&!v("name"))return bad("Enter your full name.");
 if(!/^\S+@\S+\.\S+$/.test(v("email")))return bad("Enter a valid email address.");
 if(v("password").length<8)return bad("Password must be at least 8 characters.");
 if(reg&&v("password")!==v("confirm"))return bad("Passwords do not match.");
 if(reg&&!v("role"))return bad("Select a role.");
 location.href=reg?"login.html":"dashboard.html";};
