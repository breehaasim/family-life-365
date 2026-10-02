import {useState,useRef,useEffect} from 'react';
import {SITE,STAGES,SERVICES,TOPICS,PILLARS,waLink,api} from './data.js';
const PRICE=/price|fee|charge|cost|free|paid|paisa|paisay|kitn|qeemat|فیس|قیمت|مفت|پیسے|چارج|کتنی|کتنے/;
const BOOKRX=/book|appointment|apointment|consult|session|mulaqat|mulaqaat|waqt lena|بک|اپوائنٹمنٹ|ملاقات|مشاورت|وقت لین/;
function local(q){q=q.toLowerCase();
if(PRICE.test(q))return SITE.charges;
if(BOOKRX.test(q))return 'BOOK';
if(/\b(hi|hello)\b|salam|سلام/.test(q))return 'Assalam o Alaikum! Ask about our services, the 11 pillars or charges, or say "book" to arrange a consultation.';
if(/service|offer|خدمات/.test(q))return 'We offer: '+SERVICES.map(s=>s.t).join(', ')+'.';
if(/phone|call|number|contact|whatsapp|email|فون|نمبر|رابطہ|واٹس/.test(q))return `Call ${SITE.phone} or message us on WhatsApp${SITE.email?', or email '+SITE.email:''}.`;
if(/pillar|framework|stage|ستون|مراحل/.test(q))return `Our framework has ${PILLARS.length} pillars in ${STAGES.length} stages: ${STAGES.map(s=>s.t).join(', ')}.`;
const p=PILLARS.find(x=>x.t.toLowerCase().split(/[ &,]+/).some(w=>w.length>4&&q.includes(w)));
return p?`${p.t}: ${p.d}`:`I am not sure about that. Ask about services, pillars, charges or booking, or message our team on WhatsApp (${SITE.phone}).\nمجھے اس بارے میں یقین نہیں۔ براہِ کرم واٹس ایپ پر ہماری ٹیم سے رابطہ کریں۔ (${SITE.phone})`}
// which language is the visitor writing? ur = Urdu script, ru = Roman Urdu, en = English/other
const lang=t=>/[\u0600-\u06FF]/.test(t)?'ur':/\b(kya|hai|hain|mujhe|mujhay|karna|karni|karein|chahiye|chahta|chahti|chahte|aap|ap|apka|apki|hum|nahi|nahin|kitna|kitni|kaise|kese|kahan|shukriya|salam|assalam|lena|mulaqat|batao|btao|bta|zaroor|jee|ji)\b/i.test(t)?'ru':'en';
const TXT={
en:{name:'Happy to help. What is your name?',phone:'Thank you. What is your phone or WhatsApp number?',bad:'Please enter a valid phone number so we can reach you.',topic:t=>'What would you like help with? ('+t+')',when:'When would you prefer, and online or in person?',ok:'Your request is saved. Send it on WhatsApp to confirm a time.',fail:'I could not save it online right now, but you can still send it on WhatsApp.',wa:'Send on WhatsApp'},
ru:{name:'Jee zaroor. Aap ka naam kya hai?',phone:'Shukriya. Aap ka phone ya WhatsApp number kya hai?',bad:'Barah-e-karam sahi phone number likhein taake hum aap se rabta kar sakein.',topic:t=>'Aap kis mauzu par rehnumai chahte hain? ('+t+')',when:'Aap ko kaun sa waqt munasib hai, aur online ya in person?',ok:'Aap ki request save ho gayi hai. Waqt confirm karne ke liye isay WhatsApp par bhej dein.',fail:'Abhi request save nahi ho saki, lekin aap isay WhatsApp par bhej sakte hain.',wa:'WhatsApp par bhejein'},
ur:{name:'جی ضرور۔ آپ کا نام کیا ہے؟',phone:'شکریہ۔ آپ کا فون یا واٹس ایپ نمبر کیا ہے؟',bad:'براہِ کرم درست فون نمبر لکھیں تاکہ ہم آپ سے رابطہ کر سکیں۔',topic:t=>'آپ کس موضوع پر رہنمائی چاہتے ہیں؟ ('+t+')',when:'آپ کو کون سا وقت مناسب ہے، اور آن لائن یا آمنے سامنے؟',ok:'آپ کی درخواست محفوظ ہو گئی ہے۔ وقت کی تصدیق کے لیے اسے واٹس ایپ پر بھیج دیں۔',fail:'ابھی درخواست محفوظ نہیں ہو سکی، لیکن آپ اسے واٹس ایپ پر بھیج سکتے ہیں۔',wa:'واٹس ایپ پر بھیجیں'}};
export default function Chatbot(){
const [open,setOpen]=useState(false),[typing,setTyping]=useState(false),[step,setStep]=useState(0),[d,setD]=useState({}),[v,setV]=useState('');
const [msgs,setMsgs]=useState([{b:1,t:'Assalam o Alaikum! I am the Family Life assistant. You can write to me in any language, English, Urdu or Roman Urdu.'},{b:1,t:'السلام علیکم! میں Family Life کا اسسٹنٹ ہوں۔ آپ اردو، انگریزی یا رومن اردو میں بات کر سکتے ہیں۔'}]);const end=useRef(),lg=useRef('en');
useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth'})},[msgs,typing]);
const bot=t=>{setTyping(false);setMsgs(m=>[...m,{b:1,t}])};
const send=async txt=>{txt=txt.trim();if(!txt)return;setV('');const hist=[...msgs,{t:txt}];setMsgs(hist);setTyping(true);await new Promise(r=>setTimeout(r,600));
const T=TXT[lg.current];
if(step===1){setD({name:txt});setStep(2);return bot(T.phone)}
if(step===2){if(txt.replace(/\D/g,'').length<7)return bot(T.bad);setD(x=>({...x,phone:txt}));setStep(3);return bot(T.topic(TOPICS.slice(0,4).join(', ')))}
if(step===3){setD(x=>({...x,topic:txt}));setStep(4);return bot(T.when)}
if(step===4){const f={...d,when:txt,mode:/in.?person|physical|office|face|آمنے|دفتر|روبرو|rubaru/i.test(txt)?'In person':'Online'};setStep(0);setD({});const ok=await api('/appointments',{name:f.name,phone:f.phone,topic:f.topic,mode:f.mode,when:f.when,source:'chatbot'});
bot(ok?T.ok:T.fail);
return setMsgs(m=>[...m,{b:1,label:T.wa,link:waLink(`Assalam o Alaikum, I am ${f.name} (${f.phone}). I would like to book a ${f.mode} consultation about: ${f.topic}. Preferred time: ${f.when}.`)}])}
const l=local(txt);if(l==='BOOK'){lg.current=lang(txt);setStep(1);return bot(TXT[lg.current].name)}
const r=await api('/chat',{messages:hist.filter(m=>m.t).map(m=>({role:m.b?'assistant':'user',content:m.t}))});bot(r?.reply||l)};
return <><button className={`chat-fab ${open?'o':''}`} onClick={()=>setOpen(!open)} aria-label="Open chat assistant"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5h16v11H9l-5 4z" strokeLinejoin="round"/></svg><b>×</b></button>
<div className={`chat ${open?'on':''}`} role="dialog" aria-label="Family Life assistant" aria-hidden={!open}><div className="chat-h"><span className="av">FL</span><div><strong>Family Life</strong><small>Assistant · replies instantly</small></div><button onClick={()=>setOpen(false)} aria-label="Close">×</button></div>
<div className="chat-b">{msgs.map((m,i)=>m.link?<a key={i} className="btn sm" href={m.link} target="_blank" rel="noreferrer"><span>{m.label||'Send on WhatsApp'}</span><i>→</i></a>:<p key={i} dir="auto" className={m.b?'bot':'me'}>{m.t}</p>)}{typing&&<p className="bot dots3"><i/><i/><i/></p>}<div ref={end}/></div>
<div className="chips">{['Services','Charges','Book appointment','The 11 pillars'].map(c=><button key={c} onClick={()=>send(c)}>{c}</button>)}</div>
<div className="chat-i"><input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(v)} dir="auto" placeholder="Type your message · پیغام لکھیں" aria-label="Message"/><button onClick={()=>send(v)} aria-label="Send">→</button></div></div></>}
