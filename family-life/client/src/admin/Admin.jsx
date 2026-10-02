import {useState,useEffect,useCallback,createContext,useContext} from 'react';
import './admin.css';

/* ---------- API helper (token in localStorage, sent as Bearer) ---------- */
const TK='fl_admin_token';let onAuthFail=()=>{};
async function call(method,path,body){
  const t=localStorage.getItem(TK);
  const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  let d=null;try{d=await r.json()}catch{}
  if(r.status===401&&path!=='/auth/login'){localStorage.removeItem(TK);onAuthFail()}
  if(!r.ok)throw new Error(d?.error||`Request failed (${r.status})`);
  return d;
}
const A=(m,p,b)=>call(m,'/admin'+p,b);
const Ctx=createContext();const useC=()=>useContext(Ctx);
const idOf=r=>r._id||r.id;
const when=d=>d?new Date(d).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'';

/* ---------- Generic form field ---------- */
function Field({f,v,set}){
  const val=v??(f.t==='bool'?false:'');
  if(f.t==='bool')return <label className="chk"><input type="checkbox" checked={!!val} onChange={e=>set(e.target.checked)}/>{f.l}</label>;
  return <label className="f">{f.l}{f.req&&' *'}
    {f.t==='textarea'?<textarea rows={f.rows||4} value={val} onChange={e=>set(e.target.value)}/>
    :f.t==='select'?<select value={val} onChange={e=>set(e.target.value)}>{f.opts.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}</select>
    :<input type={f.t||'text'} value={val} onChange={e=>set(e.target.value)} autoComplete={f.t==='password'?'new-password':undefined}/>}
    {f.help&&<small>{f.help}</small>}
    {f.img&&val&&<img className="thumb" src={val} alt="" onError={e=>e.target.style.opacity=.2}/>}
  </label>;
}

/* ---------- Generic CRUD screen: table + add/edit dialog + delete ---------- */
function Crud({title,hint,res,cols,fields,canAdd=true,blank={},initial,onInitialUsed,extra,path}){
  const {toast}=useC();const base=path||('/'+res);
  const [rows,setRows]=useState(null);const [edit,setEdit]=useState(null);const [q,setQ]=useState('');const [busy,setBusy]=useState(false);
  const load=useCallback(()=>A('GET',base).then(setRows).catch(e=>{toast(e.message,1);setRows([])}),[base]);
  useEffect(()=>{setRows(null);load()},[load]);
  useEffect(()=>{if(initial){setEdit({...blank,...initial});onInitialUsed?.()}},[initial]);
  const patch=async(row,ch)=>{try{await A('PUT',`${base}/${idOf(row)}`,ch);load()}catch(e){toast(e.message,1)}};
  const del=async row=>{if(!confirm('Delete this permanently?'))return;try{await A('DELETE',`${base}/${idOf(row)}`);toast('Deleted');load()}catch(e){toast(e.message,1)}};
  const save=async()=>{
    for(const f of fields)if(f.req&&f.t!=='bool'&&!String(edit[f.k]??'').trim())return toast(`${f.l} is required`,1);
    const body={};for(const f of fields){let v=edit[f.k];if(f.t==='password'&&!v)continue;if(f.t==='number')v=v===''||v==null?0:Number(v);body[f.k]=v}
    setBusy(true);try{idOf(edit)?await A('PUT',`${base}/${idOf(edit)}`,body):await A('POST',base,body);toast('Saved');setEdit(null);load()}catch(e){toast(e.message,1)}setBusy(false)};
  const list=(rows||[]).filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return <>
    <h2>{title}</h2>{hint&&<p className="hint">{hint}</p>}
    <div className="bar"><input type="search" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/>{extra?.(rows||[])}{canAdd&&<button className="btn gold" onClick={()=>setEdit({...blank})}>+ Add new</button>}</div>
    <div className="tw"><table className="rt"><thead><tr>{cols.map(c=><th key={c.l}>{c.l}</th>)}<th/></tr></thead><tbody>
      {rows===null?<tr><td colSpan={cols.length+1} className="empty">Loading…</td></tr>:!list.length?<tr><td colSpan={cols.length+1} className="empty">Nothing here yet.</td></tr>
      :list.map(r=><tr key={idOf(r)}>{cols.map(c=><td key={c.l} data-l={c.l}>{c.r?c.r(r,patch):c.d?when(r[c.k]):c.clip?<div className="clip">{r[c.k]}</div>:String(r[c.k]??'')}</td>)}
        <td className="act"><button className="btn sm ghost" onClick={()=>setEdit({...r})}>Edit</button> <button className="btn sm del" onClick={()=>del(r)}>Delete</button></td></tr>)}
    </tbody></table></div>
    {edit&&<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&setEdit(null)}><div className="dlg"><h3>{idOf(edit)?'Edit':'Add'} · {title}</h3>
      {fields.map(f=><Field key={f.k} f={f} v={edit[f.k]} set={v=>setEdit(x=>({...x,[f.k]:v}))}/>)}
      <div className="bar" style={{justifyContent:'flex-end',margin:0}}><button className="btn ghost" onClick={()=>setEdit(null)}>Cancel</button><button className="btn" disabled={busy} onClick={save}>{busy?'Saving…':'Save'}</button></div></div></div>}
  </>;
}
const Status=(opts)=>(r,patch)=><select value={r.status} onChange={e=>patch(r,{status:e.target.value})}>{opts.map(o=><option key={o}>{o}</option>)}</select>;

/* ---------- Pages ---------- */
function Dashboard(){
  const {go}=useC();const [s,setS]=useState(null);useEffect(()=>{A('GET','/stats').then(setS).catch(()=>setS(false))},[]);
  if(s===null)return <p>Loading…</p>;if(!s)return <p className="err">Could not load stats. Is the database connected?</p>;
  const C=(n,l,page,hot)=><button className={`card ${hot&&n?'hot':''}`} onClick={()=>go(page)}><b>{n}</b><span>{l}</span></button>;
  return <><h2>Dashboard</h2><p className="hint">Everything that comes in from the website is saved in MongoDB and appears here.</p>
    <div className="cards">{C(s.bookNew,'New bookings','bookings',1)}{C(s.enqNew,'New enquiries','enquiries',1)}{C(s.testPending,'Testimonials awaiting approval','testimonials',1)}{C(s.unanswered,'Chatbot questions without an answer','chatbot',1)}
      {C(s.bookAll,'Total bookings','bookings')}{C(s.enqAll,'Total enquiries','enquiries')}{C(s.subs,'Newsletter subscribers','subscribers')}{C(s.services,'Services','services')}{C(s.pillars,'Pillars','pillars')}{C(s.faqs,'FAQs','faqs')}</div>
    <h3 style={{marginBottom:'.6rem'}}>Latest bookings</h3>
    <div className="tw"><table><tbody>{s.recent.length?s.recent.map(b=><tr key={b._id}><td>{b.name}</td><td>{b.phone}</td><td>{b.topic}</td><td><span className="tag">{b.status}</span></td><td>{when(b.createdAt)}</td></tr>):<tr><td className="empty">No bookings yet.</td></tr>}</tbody></table></div></>;
}

function ListEd({label,help,items,set,render,blank}){ // repeater for slides / loop steps
  return <div className="rep"><b>{label}</b>{help&&<small>{help}</small>}
    {items.map((it,i)=><div className="rep" key={i} style={{background:'#fff'}}>{render(it,ch=>set(items.map((x,k)=>k===i?{...x,...ch}:x)))}
      <button className="btn sm del" style={{justifySelf:'start'}} onClick={()=>set(items.filter((_,k)=>k!==i))}>Remove</button></div>)}
    <button className="btn sm ghost" style={{justifySelf:'start'}} onClick={()=>set([...items,{...blank}])}>+ Add</button></div>;
}
function Settings(){
  const {toast}=useC();const [s,setS]=useState(null);const [busy,setBusy]=useState(false);
  useEffect(()=>{A('GET','/settings').then(setS).catch(e=>toast(e.message,1))},[]);
  if(!s)return <p>Loading…</p>;const u=k=>v=>setS(x=>({...x,[k]:v}));
  const F=(k,l,extra={})=><Field f={{k,l,...extra}} v={s[k]} set={u(k)}/>;
  const save=async()=>{setBusy(true);try{setS(await A('PUT','/settings',s));toast('Saved. The website shows it on next page load.')}catch(e){toast(e.message,1)}setBusy(false)};
  return <><h2>Content Editor</h2><p className="hint">Change the website text, contact details and hero slides yourself. Services, FAQs and pillars have their own menu items.</p>
    <div className="panel"><h3>Site & contact</h3><div className="row2">{F('name','Site name')}{F('tag','Tagline')}</div>{F('slogan','Slogan')}
      <div className="row2">{F('phone','Phone number')}{F('wa','WhatsApp number',{help:'International format without +, e.g. 923347580699'})}</div>{F('email','Public email',{help:'Leave empty to hide'})}</div>
    <div className="panel"><h3>Fees & chatbot answer</h3>
      {F('charges','Fees text shown on website (Services note + FAQ)',{t:'textarea',rows:2})}
      {F('chargesAnswer','Chatbot answer when someone asks if services are paid / free / fees',{t:'textarea',rows:2,help:'Example: "Jee, our services are paid. Fee details are shared on WhatsApp."'})}</div>
    <div className="panel"><h3>Switches</h3>{F('showTestimonials','Show Testimonials section on the website',{t:'bool'})}{F('autoApproveTestimonials','Publish new testimonials immediately (otherwise they wait for your approval)',{t:'bool'})}{F('servicesConfirmed','Services list is final (hides the "to be confirmed" note)',{t:'bool'})}</div>
    <div className="panel"><h3>Hero slides</h3>
      <ListEd label="Slides" help="The first slide can play the hero video. Other slides use an image URL." items={s.slides||[]} set={u('slides')} blank={{title:'',text:'',img:'',video:false}}
        render={(x,ch)=><><Field f={{l:'Title'}} v={x.title} set={v=>ch({title:v})}/><Field f={{l:'Text'}} v={x.text} set={v=>ch({text:v})}/><Field f={{l:'Image URL',img:1}} v={x.img} set={v=>ch({img:v})}/><Field f={{l:'Use the hero video instead of an image',t:'bool'}} v={x.video} set={v=>ch({video:v})}/></>}/></div>
    <div className="panel"><h3>Values & relationship loop</h3>
      <label className="f">Values (one per line)<textarea rows={4} value={(s.values||[]).join('\n')} onChange={e=>u('values')(e.target.value.split('\n'))}/></label>
      <ListEd label="Loop steps" items={s.loop||[]} set={u('loop')} blank={{title:'',text:''}} render={(x,ch)=><div className="row2"><Field f={{l:'Step'}} v={x.title} set={v=>ch({title:v})}/><Field f={{l:'Description'}} v={x.text} set={v=>ch({text:v})}/></div>}/></div>
    <button className="btn" disabled={busy} onClick={save}>{busy?'Saving…':'Save all changes'}</button></>;
}

const SERVICES=()=><Crud title="Services" res="services" hint="These appear in the Services section, the booking topic list and the chatbot." blank={{order:0,active:true}}
  cols={[{l:'Image',r:r=><img className="thumb" src={r.img||r.fb} alt=""/>},{l:'Title',k:'title'},{l:'Description',k:'description',clip:1},{l:'Order',k:'order'},{l:'Visible',r:r=><span className={`tag ${r.active?'on':'off'}`}>{r.active?'Yes':'Hidden'}</span>}]}
  fields={[{k:'title',l:'Title',req:1},{k:'description',l:'Description',t:'textarea',req:1},{k:'img',l:'Image URL',img:1,help:'Paste a link, or a local path like /images/pillars/p02.jpg'},{k:'fb',l:'Backup image (used if the main image fails)'},{k:'order',l:'Order (small number = first)',t:'number'},{k:'active',l:'Show on website',t:'bool'}]}/>;
const FAQS=()=><Crud title="FAQ" res="faqs" blank={{order:0,active:true}} cols={[{l:'Question',k:'question'},{l:'Answer',k:'answer',clip:1},{l:'Order',k:'order'},{l:'Visible',r:r=><span className={`tag ${r.active?'on':'off'}`}>{r.active?'Yes':'Hidden'}</span>}]}
  fields={[{k:'question',l:'Question',req:1},{k:'answer',l:'Answer',t:'textarea',req:1},{k:'order',l:'Order',t:'number'},{k:'active',l:'Show on website',t:'bool'}]}/>;
function Framework(){
  const [tab,setTab]=useState('pillars');const [stages,setStages]=useState([]);useEffect(()=>{A('GET','/stages').then(setStages).catch(()=>{})},[tab]);
  return <><div className="tabs">{[['pillars','Pillars'],['stages','Stages']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}</div>
    {tab==='stages'?<Crud title="Stages" res="stages" hint="Groups of pillars. Renaming a stage moves its pillars automatically." blank={{order:0}} cols={[{l:'Order',k:'order'},{l:'Stage',k:'title'},{l:'Subtitle',k:'subtitle'}]} fields={[{k:'title',l:'Stage name',req:1},{k:'subtitle',l:'Subtitle'},{k:'order',l:'Order',t:'number'}]}/>
    :<Crud title="Pillars" res="pillars" hint="The website's honeycomb is designed for 11 pillars (4 + 3 + 4 per row). Adding more works, but only the first 11 fit the honeycomb layout." blank={{order:0,stage:stages[0]?.title||''}}
      cols={[{l:'#',k:'order'},{l:'Image',r:r=>r.img?<img className="thumb" src={r.img} alt=""/>:'—'},{l:'Pillar',k:'title'},{l:'Stage',k:'stage'},{l:'Description',k:'description',clip:1}]}
      fields={[{k:'title',l:'Title',req:1},{k:'stage',l:'Stage',t:'select',opts:stages.map(s=>s.title),req:1},{k:'description',l:'Description',t:'textarea',req:1},{k:'img',l:'Image URL (optional)',img:1,help:'Empty = uses the built-in picture for this pillar'},{k:'order',l:'Order',t:'number'}]}/>}</>;
}
const BOOKINGS=()=><Crud title="Bookings" res="appointments" hint="Requests from the booking form and the chatbot. Change the status as you confirm them." blank={{status:'new',source:'form',mode:'Online'}}
  cols={[{l:'Received',k:'createdAt',d:1},{l:'Name',k:'name'},{l:'Phone',k:'phone'},{l:'Topic',k:'topic'},{l:'Mode',k:'mode'},{l:'Preferred time',k:'when'},{l:'From',k:'source'},{l:'Status',r:Status(['new','confirmed','done','cancelled'])},{l:'Notes',k:'notes',clip:1}]}
  fields={[{k:'name',l:'Name',req:1},{k:'phone',l:'Phone',req:1},{k:'topic',l:'Topic'},{k:'mode',l:'Mode',t:'select',opts:['Online','In person']},{k:'when',l:'Preferred time'},{k:'status',l:'Status',t:'select',opts:['new','confirmed','done','cancelled']},{k:'notes',l:'Private notes',t:'textarea',rows:3}]}/>;
const ENQUIRIES=()=><Crud title="Enquiries" res="contacts" hint="Messages from the website enquiry form." blank={{status:'new'}}
  cols={[{l:'Received',k:'createdAt',d:1},{l:'Name',k:'name'},{l:'Email',k:'email'},{l:'Phone',k:'phone'},{l:'Message',k:'message',clip:1},{l:'Status',r:Status(['new','read','replied'])}]}
  fields={[{k:'name',l:'Name',req:1},{k:'email',l:'Email'},{k:'phone',l:'Phone'},{k:'message',l:'Message',t:'textarea',req:1},{k:'status',l:'Status',t:'select',opts:['new','read','replied']},{k:'notes',l:'Private notes',t:'textarea',rows:3}]}/>;
const TESTIMONIALS=()=><Crud title="Testimonials" res="testimonials" hint="Stories submitted by visitors wait here until you approve them. Only approved ones show on the website." blank={{approved:true}}
  cols={[{l:'Received',k:'createdAt',d:1},{l:'Name',k:'name'},{l:'Role',k:'role'},{l:'Story',k:'quote',clip:1},{l:'Status',r:(r,p)=><button className={`btn sm ${r.approved?'ghost':'gold'}`} onClick={()=>p(r,{approved:!r.approved})}>{r.approved?'Published · Hide':'Pending · Approve'}</button>}]}
  fields={[{k:'name',l:'Name',req:1},{k:'role',l:'Relation (e.g. Parent)'},{k:'quote',l:'Story',t:'textarea',req:1},{k:'approved',l:'Published on website',t:'bool'}]}/>;
const SUBSCRIBERS=()=><Crud title="Newsletter subscribers" res="subscribers" cols={[{l:'Email',k:'email'},{l:'Subscribed',k:'createdAt',d:1}]} fields={[{k:'email',l:'Email',req:1,t:'email'}]}
  extra={rows=><button className="btn ghost" onClick={()=>{const b=new Blob(['email,subscribed\n'+rows.map(r=>`${r.email},${r.createdAt}`).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='subscribers.csv';a.click()}}>Export CSV</button>}/>;

function Chatbot(){
  const {toast}=useC();const [tab,setTab]=useState('qa');const [pre,setPre]=useState(null);const [log,setLog]=useState(null);
  const loadLog=()=>A('GET','/chatlog').then(setLog).catch(e=>toast(e.message,1));useEffect(()=>{tab==='log'&&loadLog()},[tab]);
  return <><h2>Chatbot</h2><p className="hint">The chatbot already answers from your services, pillars, FAQs and fee text. Add your own Q&A here for anything else. Questions it could not answer appear under "Unanswered".</p>
    <div className="tabs">{[['qa','Q&A answers'],['log','Unanswered questions']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}</div>
    {tab==='qa'?<Crud title="Chatbot Q&A" res="qa" blank={{active:true}} initial={pre} onInitialUsed={()=>setPre(null)}
        cols={[{l:'Question',k:'question'},{l:'Trigger words',k:'keywords'},{l:'Answer',k:'answer',clip:1},{l:'Active',r:r=><span className={`tag ${r.active?'on':'off'}`}>{r.active?'Yes':'No'}</span>}]}
        fields={[{k:'question',l:'Question',req:1},{k:'keywords',l:'Trigger words (comma separated)',help:'If a visitor\'s message contains any of these words, this answer is used. e.g. timing, time, hours, waqt'},{k:'answer',l:'Answer',t:'textarea',req:1},{k:'active',l:'Active',t:'bool'}]}/>
    :<div className="tw"><table><thead><tr><th>Asked</th><th>Question</th><th/></tr></thead><tbody>{log===null?<tr><td className="empty" colSpan="3">Loading…</td></tr>:!log.length?<tr><td className="empty" colSpan="3">Every question was answered. 🎉</td></tr>
      :log.map(l=><tr key={l._id}><td>{when(l.createdAt)}</td><td>{l.question}</td><td className="act"><button className="btn sm gold" onClick={async()=>{setPre({question:l.question,keywords:'',answer:''});await A('PATCH','/chatlog/'+l._id,{handled:true}).catch(()=>{});setTab('qa')}}>Write answer</button> <button className="btn sm del" onClick={async()=>{await A('DELETE','/chatlog/'+l._id);loadLog()}}>Dismiss</button></td></tr>)}</tbody></table></div>}</>;
}
const USERS=()=><Crud title="User management" res="users" hint="Only admins can open this page. Admins can do everything; editors can manage content, bookings and enquiries but not users." blank={{role:'editor',active:true}}
  cols={[{l:'Name',k:'name'},{l:'Email',k:'email'},{l:'Role',k:'role'},{l:'Active',r:r=><span className={`tag ${r.active?'on':'off'}`}>{r.active?'Yes':'No'}</span>},{l:'Last login',k:'lastLogin',d:1}]}
  fields={[{k:'name',l:'Name',req:1},{k:'email',l:'Email (login)',t:'email',req:1},{k:'role',l:'Role',t:'select',opts:['admin','editor']},{k:'password',l:'Password',t:'password',help:'Minimum 8 characters. When editing, leave empty to keep the current password.'},{k:'active',l:'Can log in',t:'bool'}]}/>;
function Account(){
  const {toast,user}=useC();const [p,setP]=useState({current:'',next:''});
  return <><h2>My account</h2><p className="hint">{user.name} · {user.email} · {user.role}</p><div className="panel" style={{maxWidth:480}}><h3>Change password</h3>
    <Field f={{l:'Current password',t:'password'}} v={p.current} set={v=>setP({...p,current:v})}/><Field f={{l:'New password',t:'password',help:'Minimum 8 characters'}} v={p.next} set={v=>setP({...p,next:v})}/>
    <button className="btn" style={{justifySelf:'start'}} onClick={async()=>{try{await A('PUT','/me/password',p);toast('Password changed');setP({current:'',next:''})}catch(e){toast(e.message,1)}}}>Update password</button></div></>;
}

/* ---------- Login + shell ---------- */
function Login({done}){
  const [f,setF]=useState({email:'',password:''});const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  const go=async e=>{e.preventDefault();setBusy(true);setErr('');try{const r=await call('POST','/auth/login',f);localStorage.setItem(TK,r.token);done(r.user)}catch(x){setErr(x.message)}setBusy(false)};
  return <div className="adm adm-login"><form onSubmit={go}><h1>Family Life</h1><small>Admin panel · authorised staff only</small>
    <label className="f">Email<input type="email" required value={f.email} onChange={e=>setF({...f,email:e.target.value})} autoFocus/></label>
    <label className="f">Password<input type="password" required value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></label>
    {err&&<div className="err">{err}</div>}<button className="btn gold" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form></div>;
}
const PAGES=[['dashboard','Dashboard',Dashboard],['content','Content Editor',Settings],['services','Services',SERVICES],['pillars','Pillars & Stages',Framework],['faqs','FAQ',FAQS],
  ['bookings','Bookings',BOOKINGS],['enquiries','Enquiries',ENQUIRIES],['testimonials','Testimonials',TESTIMONIALS],['subscribers','Subscribers',SUBSCRIBERS],['chatbot','Chatbot',Chatbot],['users','User Management',USERS,1],['account','My account',Account]];

export default function Admin(){
  const [user,setUser]=useState(undefined);const [page,setPage]=useState(()=>location.hash.slice(1)||'dashboard');const [nav,setNav]=useState(false);const [t,setT]=useState(null);
  const [badge,setBadge]=useState({});
  useEffect(()=>{document.title='Admin · Family Life';const m=document.createElement('meta');m.name='robots';m.content='noindex,nofollow';document.head.appendChild(m);
    onAuthFail=()=>setUser(null);
    if(!localStorage.getItem(TK))setUser(null);else A('GET','/me').then(setUser).catch(()=>setUser(null))},[]);
  const toast=useCallback((m,err)=>{setT({m,err});setTimeout(()=>setT(null),3500)},[]);
  const go=p=>{setPage(p);location.hash=p;setNav(false)};
  useEffect(()=>{if(user)A('GET','/stats').then(s=>setBadge({bookings:s.bookNew,enquiries:s.enqNew,testimonials:s.testPending,chatbot:s.unanswered})).catch(()=>{})},[user,page]);
  if(user===undefined)return <div className="adm" style={{padding:'2rem'}}>Loading…</div>;
  if(!user)return <Login done={setUser}/>;
  const pages=PAGES.filter(p=>!p[3]||user.role==='admin');const Cur=(pages.find(p=>p[0]===page)||pages[0])[2];
  return <Ctx.Provider value={{toast,go,user}}><div className="adm">
    <div className="adm-top"><b>Family Life · Admin</b><button onClick={()=>setNav(!nav)} aria-label="Menu">☰</button></div>
    <div className="adm-shell"><aside className={`adm-side ${nav?'open':''}`}><div className="brand">Family <b>Life</b></div>
      {pages.map(([k,l])=><button key={k} className={page===k?'on':''} onClick={()=>go(k)}>{l}{badge[k]?<span className="badge">{badge[k]}</span>:null}</button>)}
      <div className="sp"/><a href="/" target="_blank" rel="noreferrer" style={{padding:'.5rem .8rem',opacity:.75}}>View website ↗</a>
      <button onClick={()=>{localStorage.removeItem(TK);setUser(null)}}>Sign out</button><div className="who">{user.name} ({user.role})</div></aside>
      <main className="adm-main"><Cur key={page}/></main></div>{nav&&<div className="adm-ov" onClick={()=>setNav(false)}/>}
    {t&&<div className={`toast ${t.err?'err':''}`}>{t.m}</div>}</div></Ctx.Provider>;
}
