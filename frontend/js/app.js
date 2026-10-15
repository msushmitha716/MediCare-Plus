// MediCare+ frontend (Step 2). Data is kept in the browser (localStorage) ONLY until Step 5 connects the REST API.
const NAV=[["dashboard","Dashboard","⌂"],["patients","Patients","☺"],["doctors","Doctors","✚"],["appointments","Appointments","◷"],["prescriptions","Prescriptions","℞"],["reports","Reports","▤"]];
const $=(s,r=document)=>r.querySelector(s);
const store={get:k=>JSON.parse(localStorage.getItem("mc_"+k)||"[]"),set:(k,v)=>localStorage.setItem("mc_"+k,JSON.stringify(v))};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SPECS=["General Medicine","Cardiology","Pediatrics","Orthopedics","Neurology","Dermatology","Gynecology"];
const MODULES={
 patients:{title:"Patients",one:"patient",filter:"gender",
  fields:[{k:"name",l:"Full name",req:1},{k:"age",l:"Age",t:"number",req:1},{k:"gender",l:"Gender",o:["Female","Male","Other"],req:1},{k:"phone",l:"Phone",t:"tel",req:1},{k:"blood",l:"Blood group",o:["A+","A-","B+","B-","O+","O-","AB+","AB-"]},{k:"condition",l:"Condition / notes",t:"textarea"}],
  cols:["name","age","gender","phone","blood"]},
 doctors:{title:"Doctors",one:"doctor",filter:"status",
  fields:[{k:"name",l:"Full name",req:1},{k:"spec",l:"Specialization",o:SPECS,req:1},{k:"phone",l:"Phone",t:"tel",req:1},{k:"email",l:"Email",t:"email",req:1},{k:"status",l:"Status",o:["Available","On Leave"],req:1}],
  cols:["name","spec","phone","email","status"]},
 appointments:{title:"Appointments",one:"appointment",filter:"status",
  fields:[{k:"patient",l:"Patient",ref:"patients",req:1},{k:"doctor",l:"Doctor",ref:"doctors",req:1},{k:"date",l:"Date",t:"date",req:1},{k:"time",l:"Time",t:"time",req:1},{k:"status",l:"Status",o:["Scheduled","Completed","Cancelled"],req:1},{k:"reason",l:"Reason for visit",t:"textarea"}],
  cols:["patient","doctor","date","time","status"]},
 prescriptions:{title:"Prescriptions",one:"prescription",filter:"doctor",
  fields:[{k:"patient",l:"Patient",ref:"patients",req:1},{k:"doctor",l:"Doctor",ref:"doctors",req:1},{k:"medicine",l:"Medicine",req:1},{k:"dosage",l:"Dosage (e.g. 1 tablet twice daily)",req:1},{k:"duration",l:"Duration (e.g. 5 days)",req:1},{k:"notes",l:"Instructions",t:"textarea"}],
  cols:["patient","doctor","medicine","dosage","duration"]}
};
const label=(m,k)=>m.fields.find(f=>f.k===k).l.split(" (")[0];
const opts=(m,f)=>f.ref?store.get(f.ref).map(x=>x.name):f.o;

function toast(msg,bad){const t=document.createElement("div");t.className="toast"+(bad?" bad":"");t.textContent=msg;$("#toasts").append(t);setTimeout(()=>t.remove(),3000)}

function shell(page){
 const title=(NAV.find(n=>n[0]===page)||[0,page])[1];
 document.body.innerHTML=`<div class="app"><aside class="side" id="side"><a class="brand" href="index.html"><i>✚</i>MediCare+</a><nav aria-label="Main">${NAV.map(n=>`<a href="${n[0]}.html" class="${n[0]===page?"active":""}"><span>${n[2]}</span>${n[1]}</a>`).join("")}</nav></aside>
 <div><header class="top"><button class="menu" id="menu" aria-label="Toggle menu">☰</button><h1>${title}</h1><span class="user">Staff user</span><a class="btn ghost sm" href="login.html">Log out</a></header><section id="content"></section></div></div><div id="toasts" aria-live="polite"></div>`;
 document.title=title+" · MediCare+";
 $("#menu").onclick=()=>$("#side").classList.toggle("open");
}

function cell(k,v){return k==="status"?`<span class="badge ${esc(v)}">${esc(v)}</span>`:esc(v)}

function mountModule(m,key){
 const c=$("#content"),ff=m.fields.find(f=>f.k===m.filter);
 c.innerHTML=`<div class="toolbar"><input id="q" type="search" placeholder="Search ${m.title.toLowerCase()}" aria-label="Search"><select id="f" aria-label="Filter"><option value="">All (${label(m,m.filter).toLowerCase()})</option>${(ff.o||[]).map(o=>`<option>${o}</option>`).join("")}</select><button class="btn" id="add">Add ${m.one}</button></div><div class="card tablewrap" id="tbl"><div class="state">Loading ${m.title.toLowerCase()}…</div></div><dialog id="dlg"><form id="frm" novalidate></form></dialog>`;
 const dlg=$("#dlg"),frm=$("#frm");
 function draw(){
  const q=$("#q").value.toLowerCase(),f=$("#f").value;
  const rows=store.get(key).filter(r=>(!f||r[m.filter]===f)&&(!q||Object.values(r).join(" ").toLowerCase().includes(q)));
  $("#tbl").innerHTML=rows.length?`<table><thead><tr>${m.cols.map(k=>`<th>${label(m,k)}</th>`).join("")}<th>Actions</th></tr></thead><tbody>${rows.map(r=>`<tr>${m.cols.map(k=>`<td>${cell(k,r[k])}</td>`).join("")}<td><button class="btn sm ghost" data-e="${r.id}">Edit</button> <button class="btn sm danger" data-d="${r.id}">Delete</button></td></tr>`).join("")}</tbody></table>`:`<div class="state">No ${m.title.toLowerCase()} found. Use “Add ${m.one}” to create one.</div>`;
 }
 function openForm(rec){
  for(const f of m.fields.filter(f=>f.ref))if(!store.get(f.ref).length)return toast(`Add a ${f.ref.slice(0,-1)} first, then return here.`,1);
  rec=rec||{};
  frm.innerHTML=`<h2>${rec.id?"Edit":"Add"} ${m.one}</h2>${m.fields.map(f=>{const o=opts(m,f);const ctl=f.t==="textarea"?`<textarea id="f_${f.k}" rows="3">${esc(rec[f.k])}</textarea>`:o?`<select id="f_${f.k}"><option value="">Select…</option>${o.map(x=>`<option ${rec[f.k]===x?"selected":""}>${esc(x)}</option>`).join("")}</select>`:`<input id="f_${f.k}" type="${f.t||"text"}" value="${esc(rec[f.k])}">`;return `<div class="field"><label for="f_${f.k}">${f.l}${f.req?" *":""}</label>${ctl}</div>`}).join("")}<div class="err" id="err" role="alert"></div><div class="row"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn">Save ${m.one}</button></div>`;
  $("#cancel").onclick=()=>dlg.close();
  frm.onsubmit=e=>{e.preventDefault();const d={};
   for(const f of m.fields){d[f.k]=$("#f_"+f.k).value.trim();if(f.req&&!d[f.k])return $("#err").textContent=`${label(m,f.k)} is required.`}
   if(d.age&&(d.age<0||d.age>120))return $("#err").textContent="Age must be between 0 and 120.";
   if(d.email&&!/^\S+@\S+\.\S+$/.test(d.email))return $("#err").textContent="Enter a valid email address.";
   if(d.phone&&!/^[0-9+\-\s]{7,15}$/.test(d.phone))return $("#err").textContent="Enter a valid phone number.";
   const all=store.get(key);
   if(rec.id)Object.assign(all.find(r=>r.id===rec.id),d);else all.push({id:Date.now(),...d});
   store.set(key,all);dlg.close();draw();toast(`${m.one[0].toUpperCase()+m.one.slice(1)} ${rec.id?"updated":"added"}.`)};
  dlg.showModal();
 }
 $("#add").onclick=()=>openForm();
 $("#q").oninput=draw;$("#f").onchange=draw;
 $("#tbl").onclick=e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.e)openForm(store.get(key).find(r=>r.id==b.dataset.e));
  if(b.dataset.d&&confirm("Delete this record? This cannot be undone.")){store.set(key,store.get(key).filter(r=>r.id!=b.dataset.d));draw();toast("Record deleted.")}};
 setTimeout(draw,300);
}

const count=(rows,k)=>rows.reduce((a,r)=>(a[r[k]]=(a[r[k]]||0)+1,a),{});
const bars=o=>{const v=Object.values(o),mx=Math.max(1,...v);return v.length?Object.entries(o).map(([k,n])=>`<div class="bar"><span>${esc(k)}</span><div style="width:${n/mx*60}%"></div><b>${n}</b></div>`).join(""):`<div class="state">No data yet.</div>`};

function dashboard(){
 const p=store.get("patients"),d=store.get("doctors"),a=store.get("appointments"),rx=store.get("prescriptions"),today=new Date().toISOString().slice(0,10);
 const stat=(n,l)=>`<div class="card stat"><b>${n}</b><small>${l}</small></div>`;
 const up=a.filter(x=>x.status==="Scheduled").sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time)).slice(0,5);
 $("#content").innerHTML=`<div class="grid">${stat(p.length,"Patients")}${stat(d.length,"Doctors")}${stat(a.filter(x=>x.date===today).length,"Appointments today")}${stat(rx.length,"Prescriptions")}</div>
 <div class="card"><h2 style="margin-top:0">Upcoming appointments</h2>${up.length?`<table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th></tr></thead><tbody>${up.map(x=>`<tr><td>${esc(x.patient)}</td><td>${esc(x.doctor)}</td><td>${esc(x.date)}</td><td>${esc(x.time)}</td></tr>`).join("")}</tbody></table>`:`<div class="state">No scheduled appointments. <a href="appointments.html">Schedule one</a>.</div>`}</div>`;
}
function reports(){
 $("#content").innerHTML=`<div class="cols"><div class="card"><h2 style="margin-top:0">Appointments by status</h2>${bars(count(store.get("appointments"),"status"))}</div><div class="card"><h2 style="margin-top:0">Patients by gender</h2>${bars(count(store.get("patients"),"gender"))}</div><div class="card"><h2 style="margin-top:0">Doctors by specialization</h2>${bars(count(store.get("doctors"),"spec"))}</div><div class="card"><h2 style="margin-top:0">Prescriptions per doctor</h2>${bars(count(store.get("prescriptions"),"doctor"))}</div></div>`;
}

const page=document.body.dataset.page;
if(page){shell(page);MODULES[page]?mountModule(MODULES[page],page):page==="dashboard"?dashboard():reports()}
