import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import axios from "axios";
import "./style.css";

const API="http://localhost:5000/api";
const api=axios.create({baseURL:API});
api.interceptors.request.use(c=>{const t=localStorage.getItem("fittrack_token");if(t)c.headers.Authorization=`Bearer ${t}`;return c});

/* ---------- motivational quotes ---------- */
const QUOTES=[
 "Small steps every day add up to big results.",
 "Your only limit is the one you set for yourself today.",
 "Progress, not perfection.",
 "Discipline is choosing what you want most over what you want right now.",
 "Every workout counts, no matter how small it feels.",
 "Consistency beats intensity, every single time.",
 "A strong body carries a clear mind.",
 "You don't have to be extreme, just consistent.",
 "The hardest lift is the one you talk yourself out of.",
 "Show up for yourself today — future you is watching."
];
function useQuote(intervalMs=6000){
 const [i,setI]=useState(0);
 useEffect(()=>{const id=setInterval(()=>setI(v=>(v+1)%QUOTES.length),intervalMs);return()=>clearInterval(id)},[]);
 return QUOTES[i];
}

/* ---------- decorative background art (self-contained SVG, no external images) ---------- */
function BackdropArt({className=""}){
 return <svg className={className} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
   <linearGradient id="bd1" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor="#0D2B3E"/>
    <stop offset="100%" stopColor="#0A1622"/>
   </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bd1)"/>
  <g opacity="0.16" stroke="#FF6B35" strokeWidth="6" fill="none">
   <path d="M60 420 L200 420 M60 420 L60 380 M60 460 L60 380 M60 460 L200 460 M200 380 L200 460 M170 400 L230 400 M170 440 L230 440"/>
  </g>
  <g opacity="0.14" stroke="#4CD8B0" strokeWidth="5" fill="none">
   <circle cx="640" cy="140" r="70"/>
   <circle cx="640" cy="140" r="40"/>
  </g>
  <polyline points="0,300 90,300 120,220 160,360 200,260 240,300 800,300" fill="none" stroke="#FF6B35" strokeWidth="4" opacity="0.35"/>
  <g opacity="0.10" fill="#4CD8B0">
   <circle cx="120" cy="90" r="3"/><circle cx="180" cy="70" r="3"/><circle cx="240" cy="110" r="3"/>
   <circle cx="700" cy="480" r="3"/><circle cx="740" cy="440" r="3"/><circle cx="660" cy="520" r="3"/>
  </g>
 </svg>
}

/* ---------- option lists (dropdowns instead of free text) ---------- */
/* NOTE: value (first item) must exactly match the lowercase enum values the
   server's Mongoose schemas expect (see server/src/models/Tracker.js).
   label (second item) is what the user sees. */
const WORKOUT_CATEGORIES=["Cardio","Strength","Yoga","HIIT","Cycling","Swimming","Sports","Pilates","Other"];
const QUALITY=[["poor","Poor"],["fair","Fair"],["good","Good"],["excellent","Excellent"]];
const MEALS=[["breakfast","Breakfast"],["lunch","Lunch"],["dinner","Dinner"],["snack","Snack"]];
const MOODS=[["happy","Happy"],["good","Good"],["neutral","Neutral"],["sad","Sad"],["stressed","Stressed"]];
const STRESS_LEVELS=[["low","Low"],["medium","Medium"],["high","High"]];
const YES_NO=[["true","Completed"],["false","Not completed"]];
const EXPERIENCE=["Beginner","Intermediate","Advanced"];
const EQUIPMENT=["Bodyweight only","Dumbbells","Resistance bands","Kettlebells","Full gym","None"];

const ICONS={dashboard:"🏠",workout:"🏋️",hydration:"💧",sleep:"😴",nutrition:"🍽️",activity:"🚶",wellness:"🧘",goals:"🎯",habits:"🔥",ai:"🤖"};

/* ---------- tiny markdown renderer for AI responses (no extra dependency) ---------- */
function renderInline(text,keyPrefix){
 const boldParts=text.split(/(\*\*[^*]+\*\*)/g);
 return boldParts.map((part,i)=>{
  if(/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${keyPrefix}-b${i}`}>{part.slice(2,-2)}</strong>;
  const italicParts=part.split(/(\*[^*]+\*)/g);
  return italicParts.map((sp,j)=>/^\*[^*]+\*$/.test(sp)
   ?<em key={`${keyPrefix}-i${i}-${j}`}>{sp.slice(1,-1)}</em>
   :<React.Fragment key={`${keyPrefix}-t${i}-${j}`}>{sp}</React.Fragment>);
 });
}
function renderMarkdown(text){
 const lines=(text||"").split(/\r?\n/);
 const elements=[];let listBuffer=[];let paraBuffer=[];let key=0;
 const flushList=()=>{if(listBuffer.length){elements.push(<ul key={`ul${key++}`}>{listBuffer.map((item,i)=><li key={i}>{renderInline(item,`li${key}-${i}`)}</li>)}</ul>);listBuffer=[]}};
 const flushPara=()=>{if(paraBuffer.length){elements.push(<p key={`p${key++}`}>{renderInline(paraBuffer.join(" "),`p${key}`)}</p>);paraBuffer=[]}};
 lines.forEach(raw=>{
  const line=raw.trim();
  if(line===""){flushList();flushPara();return}
  if(/^-{3,}$/.test(line)){flushList();flushPara();elements.push(<hr key={`hr${key++}`}/>);return}
  const h3=line.match(/^###\s+(.*)/);if(h3){flushList();flushPara();elements.push(<h3 key={`h${key++}`}>{renderInline(h3[1],`h${key}`)}</h3>);return}
  const h2=line.match(/^##\s+(.*)/);if(h2){flushList();flushPara();elements.push(<h3 key={`h${key++}`}>{renderInline(h2[1],`h${key}`)}</h3>);return}
  const h1=line.match(/^#\s+(.*)/);if(h1){flushList();flushPara();elements.push(<h3 key={`h${key++}`}>{renderInline(h1[1],`h${key}`)}</h3>);return}
  const li=line.match(/^[*-]\s+(.*)/);if(li){flushPara();listBuffer.push(li[1]);return}
  paraBuffer.push(line);
 });
 flushList();flushPara();
 return elements;
}

/* ---------- Auth ---------- */
function Auth({onLogin}){
 const [mode,setMode]=useState("login"),[form,setForm]=useState({name:"",email:"",password:""}),[msg,setMsg]=useState("");
 const quote=useQuote(5000);
 const submit=async e=>{e.preventDefault();try{const r=await api.post(`/auth/${mode}`,form);localStorage.setItem("fittrack_token",r.data.token);onLogin()}catch(x){setMsg(x.response?.data?.message||"Request failed")}};
 return <div className="auth">
  <div className="auth-visual">
   <BackdropArt className="auth-bg"/>
   <div className="auth-visual-content">
    <span className="brand-mark">FitTrack</span>
    <h1>Train smarter.<br/>Feel stronger.</h1>
    <p className="auth-tag">AI-powered fitness &amp; wellness tracking that keeps you moving.</p>
    <div className="quote-box">
     <span className="quote-mark">“</span>
     <p key={quote}>{quote}</p>
    </div>
   </div>
  </div>
  <div className="auth-form-side">
   <form className="card auth-card" onSubmit={submit}>
    <h2>{mode==="login"?"Welcome back":"Create your account"}</h2>
    <p className="muted">{mode==="login"?"Log in to pick up where you left off.":"Start tracking workouts, sleep, meals and more."}</p>
    {mode==="register"&&<label>Name<input placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}
    <label>Email<input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
    <label>Password<input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
    <button type="submit">{mode==="login"?"Login":"Create Account"}</button>
    {msg&&<small className="error">{msg}</small>}
    <a onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"Need an account? Create one":"Already have an account? Log in"}</a>
   </form>
  </div>
 </div>
}

/* ---------- App shell ---------- */
function App(){
 const [logged,setLogged]=useState(!!localStorage.getItem("fittrack_token"));
 if(!logged)return <Auth onLogin={()=>setLogged(true)}/>;
 return <Dashboard logout={()=>{localStorage.removeItem("fittrack_token");setLogged(false)}}/>
}

function Sidebar({tab,setTab,logout}){
 const tabs=["dashboard","workout","hydration","sleep","nutrition","activity","wellness","goals","habits","ai"];
 return <aside className="sidebar">
  <div className="brand"><span className="brand-dot"/>FitTrack</div>
  <div className="tagline">Fitness &amp; Wellness</div>
  <nav>{tabs.map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}><span className="nav-icon">{ICONS[x]}</span>{x.charAt(0).toUpperCase()+x.slice(1)}</button>)}</nav>
  <button className="logout-btn" onClick={logout}>⎋ Logout</button>
 </aside>
}

function Dashboard({logout}){
 const [summary,setSummary]=useState({fitnessScore:0,totalWorkouts:0,totalWorkoutMinutes:0,totalCalories:0,steps:0,waterMl:0,averageSleepHours:0});
 const [tab,setTab]=useState("dashboard"),[form,setForm]=useState({}),[message,setMessage]=useState("");
 const quote=useQuote();
 const [aiLoading,setAiLoading]=useState(false);
 const load=()=>api.get("/trackers/dashboard/summary").then(r=>setSummary(r.data)).catch(()=>{});
 useEffect(load,[]);
 const save=async(type)=>{try{await api.post(`/trackers/${type}`,{...form,date:new Date()});setMessage(`${type} saved`);setForm({});load()}catch(e){setMessage(e.response?.data?.message||"Could not save")}};
 const addWorkout=async()=>{try{await api.post("/workouts",{...form,duration:Number(form.duration),caloriesBurned:Number(form.caloriesBurned||0),workoutDate:new Date()});setMessage("Workout saved");setForm({});load()}catch(e){setMessage(e.response?.data?.message||"Could not save")}};
 const ai=async(path,body)=>{
  setAiLoading(true);setMessage("");
  try{const r=await api.post(`/ai/${path}`,body);setMessage(r.data.text)}
  catch(e){setMessage(e.response?.data?.message||"AI request failed. Check the server is running and GEMINI_API_KEY is set in server/.env.")}
  finally{setAiLoading(false)}
 };
 const loadInsights=async()=>{
  setAiLoading(true);setMessage("");
  try{const r=await api.get("/ai/insights");setMessage(r.data.text)}
  catch(e){setMessage(e.response?.data?.message||"AI request failed. Check the server is running and GEMINI_API_KEY is set in server/.env.")}
  finally{setAiLoading(false)}
 };

 return <div className="app-shell">
  <Sidebar tab={tab} setTab={setTab} logout={logout}/>
  <div className="main-col">
   <header className="topbar"><div><b>{tab.charAt(0).toUpperCase()+tab.slice(1)}</b></div></header>
   <main>
    {tab==="dashboard"&&<>
     <div className="hero">
      <BackdropArt className="hero-bg"/>
      <div className="hero-content">
       <div className="score"><strong>{summary.fitnessScore}</strong><span>/100 Fitness Score</span></div>
       <div className="quote-box light"><span className="quote-mark">“</span><p key={quote}>{quote}</p></div>
      </div>
     </div>
     <div className="grid">{[
      ["🏋️ Workouts",summary.totalWorkouts],["⏱️ Minutes",summary.totalWorkoutMinutes],["🔥 Calories",summary.totalCalories],["🚶 Steps",summary.steps],["💧 Water",`${summary.waterMl} ml`],["😴 Sleep",`${summary.averageSleepHours} h`]
     ].map(x=><div className="metric" key={x[0]}><h3>{x[0]}</h3><strong>{x[1]}</strong></div>)}</div>
    </>}
    {tab==="workout"&&<Form title="Workout Tracker" fields={[
     {k:"workoutName",p:"Workout name",type:"text"},
     {k:"category",p:"Category",type:"select",options:WORKOUT_CATEGORIES},
     {k:"duration",p:"Duration (min)",type:"number"},
     {k:"caloriesBurned",p:"Calories burned",type:"number"}
    ]} form={form} setForm={setForm} save={addWorkout}/>}
    {tab==="hydration"&&<Form title="Hydration Tracker" fields={[
     {k:"waterMl",p:"Water intake (ml)",type:"number"},
     {k:"targetMl",p:"Daily target (ml)",type:"number"}
    ]} form={form} setForm={setForm} save={()=>save("hydration")}/>}
    {tab==="sleep"&&<Form title="Sleep Tracker" fields={[
     {k:"sleepTime",p:"Sleep time",type:"time"},
     {k:"wakeTime",p:"Wake time",type:"time"},
     {k:"hours",p:"Hours",type:"number"},
     {k:"quality",p:"Quality",type:"select",optionPairs:QUALITY}
    ]} form={form} setForm={setForm} save={()=>save("sleep")}/>}
    {tab==="nutrition"&&<Form title="Nutrition Tracker" fields={[
     {k:"meal",p:"Meal",type:"select",optionPairs:MEALS},
     {k:"calories",p:"Calories",type:"number"},
     {k:"protein",p:"Protein (g)",type:"number"},
     {k:"carbs",p:"Carbs (g)",type:"number"},
     {k:"fat",p:"Fat (g)",type:"number"},
     {k:"description",p:"Food description",type:"text"}
    ]} form={form} setForm={setForm} save={()=>save("nutrition")}/>}
    {tab==="activity"&&<Form title="Activity Tracker" fields={[
     {k:"steps",p:"Steps",type:"number"},
     {k:"distanceKm",p:"Distance (km)",type:"number"},
     {k:"activeMinutes",p:"Active minutes",type:"number"},
     {k:"caloriesBurned",p:"Calories burned",type:"number"}
    ]} form={form} setForm={setForm} save={()=>save("activity")}/>}
    {tab==="wellness"&&<Form title="Mood & Stress" fields={[
     {k:"mood",p:"Mood",type:"select",optionPairs:MOODS},
     {k:"stress",p:"Stress",type:"select",optionPairs:STRESS_LEVELS},
     {k:"meditationMinutes",p:"Meditation minutes",type:"number"},
     {k:"note",p:"Note",type:"text"}
    ]} form={form} setForm={setForm} save={()=>save("wellness")}/>}
    {tab==="goals"&&<Form title="Daily Goals" fields={[
     {k:"waterTarget",p:"Water target (ml)",type:"number"},
     {k:"stepTarget",p:"Step target",type:"number"},
     {k:"workoutMinutesTarget",p:"Workout minutes target",type:"number"},
     {k:"sleepTarget",p:"Sleep target (hours)",type:"number"},
     {k:"meditationTarget",p:"Meditation target (minutes)",type:"number"}
    ]} form={form} setForm={setForm} save={()=>save("goals")}/>}
    {tab==="habits"&&<Form title="Habit & Streak" fields={[
     {k:"habit",p:"Habit name",type:"text"},
     {k:"completed",p:"Status",type:"select",optionPairs:YES_NO}
    ]} form={form} setForm={setForm} save={()=>save("habits")}/>}
    {tab==="ai"&&<>
     <h2>AI Fitness Assistant</h2>
     <div className="grid">
      <div className="card">
       <h3>Personalized Recommendation</h3>
       <label>Experience<select value={form.experience??""} onChange={e=>setForm({...form,experience:e.target.value})}><option value="" disabled>Select experience</option>{EXPERIENCE.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
       <label>Available minutes<input type="number" placeholder="e.g. 30" value={form.availableMinutes??""} onChange={e=>setForm({...form,availableMinutes:e.target.value})}/></label>
       <label>Equipment<select value={form.equipment??""} onChange={e=>setForm({...form,equipment:e.target.value})}><option value="" disabled>Select equipment</option>{EQUIPMENT.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
       <button disabled={aiLoading} onClick={()=>ai("recommendation",form)}>{aiLoading?"Generating…":"Generate Plan"}</button>
      </div>
      <div className="card">
       <h3>Fitness Insights</h3>
       <p className="muted">Get an AI summary of your recent workouts and trends.</p>
       <button disabled={aiLoading} onClick={loadInsights}>{aiLoading?"Analyzing…":"Analyze My Workouts"}</button>
      </div>
     </div>
    </>}
    {message&&<div className="result"><b>Result</b><div className="result-body">{renderMarkdown(message)}</div></div>}
   </main>
  </div>
 </div>
}

function Form({title,fields,form,setForm,save}){
 return <div className="card form">
  <h2>{title}</h2>
  {fields.map(f=>{
   const opts=f.optionPairs?f.optionPairs.map(([v,label])=>({v,label})):(f.options||[]).map(o=>({v:o,label:o}));
   return <label key={f.k}>{f.p}
    {f.type==="select"
     ?<select value={form[f.k]??""} onChange={e=>setForm({...form,[f.k]:e.target.value})}>
       <option value="" disabled>Select {f.p.toLowerCase()}</option>
       {opts.map(o=><option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
     :<input type={f.type||"text"} value={form[f.k]??""} placeholder={f.p} onChange={e=>setForm({...form,[f.k]:e.target.value})}/>
    }
   </label>
  })}
  <button onClick={save}>Save</button>
 </div>
}

createRoot(document.getElementById("root")).render(<App/>);
