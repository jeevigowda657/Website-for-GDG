// Leave empty when the backend serves this site. Set to your API URL if hosted separately.
const API_URL='';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
// theme
const root=document.documentElement;
function setTheme(t){root.dataset.theme=t;$('#theme').textContent=t==='dark'?'🌙':'☀️'}
setTheme(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
$('#theme').onclick=()=>setTheme(root.dataset.theme==='dark'?'light':'dark');
// menu
$('#menu').onclick=()=>$('#links').classList.toggle('open');
$$('#links a').forEach(a=>a.onclick=()=>$('#links').classList.remove('open'));
// typing effect
const words=['Think.','Design.','Develop.','Deploy.','Build with Google technologies.'];
let wi=0,ci=0,del=false;
(function type(){const w=words[wi];$('#typed').textContent=w.slice(0,ci);
 if(!del&&ci===w.length){del=true;return setTimeout(type,1200)}
 if(del&&ci===0){del=false;wi=(wi+1)%words.length}
 ci+=del?-1:1;setTimeout(type,del?40:90)})();
// countdown
const start=new Date(2026,10,18,9,0,0),end=new Date(2026,10,18,17,0,0);
function tick(){
 const now=new Date();let target,label;
 if(now<start){target=start;label='⏳ Starts in'}
 else if(now<end){target=end;label='🔴 Live now · ends in'}
 else{target=now;label='✅ Event completed'}
 let diff=Math.max(0,target-now)/1000|0;
 $('#status').textContent=label;
 $('#d').textContent=diff/86400|0;$('#h').textContent=diff%86400/3600|0;
 $('#m').textContent=diff%3600/60|0;$('#s').textContent=diff%60;
}
tick();setInterval(tick,1000);
// filter
$$('#tabs button').forEach(b=>b.onclick=()=>{
 $$('#tabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
 $$('#items .card').forEach(c=>c.style.display=(b.dataset.f==='all'||c.dataset.c===b.dataset.f)?'':'none');
});
// form validation
$('#form').onsubmit=async e=>{
 e.preventDefault();let ok=true;
 const rules=[['#name',v=>v.trim().length>=3,'Enter your full name'],['#email',v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'Enter a valid email'],['#phone',v=>/^[6-9]\d{9}$/.test(v),'Enter a valid 10-digit number']];
 rules.forEach(([s,f,m])=>{const el=$(s),er=el.closest('div').querySelector('.err');
  const good=f(el.value);er.textContent=good?'':m;if(!good)ok=false});
 if(!ok)return;
 const data={name:$('#name').value.trim(),email:$('#email').value.trim(),phone:$('#phone').value.trim(),type:$('#type').value,event:$('#evt').value};
 const msg=$('#ok');
 try{
  const r=await fetch(API_URL+'/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const j=await r.json();
  if(!r.ok)throw new Error(j.error||'Registration failed');
  msg.textContent='✅ '+j.message;msg.style.display='block';e.target.reset();
 }catch(err){msg.textContent='❌ '+err.message;msg.style.display='block'}
};
// scroll reveal + active link
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.1});
$$('.fade').forEach(el=>io.observe(el));
const secs=$$('section,header');
addEventListener('scroll',()=>{let cur='home';secs.forEach(s=>{if(scrollY>=s.offsetTop-120)cur=s.id});
 $$('#links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur))});
// ---- events (cards, filter, register) ----
const EVENTS=[
 {cat:'Hackathon',title:'CODESTORM 2026 Hackathon',date:'28 Nov 2026',place:'CSE Seminar Hall',desc:'Build a website for a real-world need. Organised by GDG on Campus.'},
 {cat:'Workshop',title:'Flutter Study Jam',date:'3 Dec 2026',place:'Lab 3',desc:'Build your first mobile app with Flutter, hands-on.'},
 {cat:'Seminar',title:'Intro to Generative AI',date:'8 Dec 2026',place:'Main Auditorium',desc:'How modern AI tools work and how to use them responsibly.'},
 {cat:'Workshop',title:'Web Dev Bootcamp',date:'12 Dec 2026',place:'Lab 1',desc:'HTML, CSS and JavaScript basics, finishing with a mini project.'},
 {cat:'Cultural',title:'Rhythm 2026 Cultural Fest',date:'19 Dec 2026',place:'College Ground',desc:'Music, dance, drama and food stalls.'},
 {cat:'Seminar',title:'Resume & Interview Prep',date:'22 Dec 2026',place:'Room 204',desc:'Placement cell session on resumes and mock interviews.'}
];
const evSel=$('#evt');
evSel.innerHTML=EVENTS.map(e=>`<option>${e.title}</option>`).join('');
const cats=['All',...new Set(EVENTS.map(e=>e.cat))];
$('#evtabs').innerHTML=cats.map((c,i)=>`<button class="${i?'':'on'}" data-c="${c}">${c}</button>`).join('');
function renderEvents(cat='All'){
 $('#evgrid').innerHTML=EVENTS.filter(e=>cat==='All'||e.cat===cat).map(e=>`
  <article class="ev">
   <span class="tag ${e.cat}">${e.cat}</span>
   <h3>${e.title}</h3>
   <div class="meta">📅 ${e.date} · 📍 ${e.place}</div>
   <p>${e.desc}</p>
   <button data-t="${e.title}">Register</button>
  </article>`).join('');
}
renderEvents();
$('#evtabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 $$('#evtabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');renderEvents(b.dataset.c)};
$('#evgrid').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 evSel.value=b.dataset.t;$('#register').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#name').focus(),600)};