import {Setting,Service,Faq,Stage,Pillar,QA,ChatLog} from './models.js';
const STOP=new Set('کیا ہے ہیں اور کی کے کو سے میں آپ ہم the and for are you your with what how can have has does this that from about tell any our who why when where which into also please kya hai hain aur ka ki ke ko se mai mein main hum aap kar kr ho hy hoga'.split(' '));
const tok=s=>String(s||'').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w));
const overlap=(qt,text)=>{const t=new Set(tok(text));return qt.filter(w=>t.has(w)).length};

export async function loadKnowledge(){
  const [s,services,faqs,stages,pillars,qa]=await Promise.all([Setting.findOne({key:'main'}).lean(),Service.find({active:true}).sort('order').lean(),Faq.find({active:true}).sort('order').lean(),Stage.find().sort('order').lean(),Pillar.find().sort('order').lean(),QA.find({active:true}).lean()]);
  return {s:s||{},services,faqs,stages,pillars,qa};
}
// Deterministic answers from database content. Returns {reply,source} or null.
export function pickQA(q,{qa}){
  const low=q.toLowerCase();let best=null,bs=0;
  for(const e of qa){let sc=0;for(const k of String(e.keywords||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean))if(low.includes(k))sc+=2;
    sc+=overlap(tok(q),e.question);if(sc>bs){bs=sc;best=e}}
  return bs>=2?{reply:best.answer,source:'qa'}:null;
}
// Greeting, paid/free question and admin-written Q&A always win: predictable answers, no AI needed.
export function priority(q,kb){
  const {s}=kb,low=q.toLowerCase();
  if(/^\s*(hi|hello|hey|salam|assalam|aoa|asalam|سلام|السلام|اسلام)/.test(low))return {reply:`Assalam o Alaikum! Ask about our services, the 11 pillars or charges, or say "book" to arrange a consultation.`,source:'rule'};
  if(/\b(paid|free|fees?|charges?|charged|cost|costs|price|prices|pricing|payment|rates?|paisay|paise|paisa|kitne|qeemat|qimat)\b/.test(low)||/فیس|قیمت|مفت|پیسے|پیسہ|چارج|اخراجات|کتنی|کتنے|رقم|معاوضہ/.test(low))return {reply:s.chargesAnswer||s.charges||'Fee details are shared on WhatsApp.',source:'charges'};
  return pickQA(q,kb);
}
export function answer(q,kb){
  const {s,services,faqs,stages,pillars}=kb,low=q.toLowerCase(),qt=tok(q);
  const p=priority(q,kb);if(p)return p;
  if(/\b(phone|call|number|contact|whatsapp|email|mail|reach|address)\b/.test(low)||/فون|نمبر|رابطہ|واٹس|ای میل|پتہ/.test(low))return {reply:`Call ${s.phone||''} or message us on WhatsApp${s.email?', or email '+s.email:''}.`,source:'rule'};
  let best=null,bs=0;
  const cand=[...faqs.map(f=>({t:f.question,b:f.answer,r:f.answer})),...services.map(x=>({t:x.title,b:x.description,r:`${x.title}: ${x.description}`})),...pillars.map(x=>({t:x.title,b:x.description,r:`${x.title}: ${x.description}`})),...stages.map(x=>({t:x.title,b:x.subtitle,r:`${x.title}: ${x.subtitle||''}. Pillars: ${pillars.filter(p=>p.stage===x.title).map(p=>p.title).join(', ')}.`}))];
  for(const c of cand){const sc=overlap(qt,c.t)*2+overlap(qt,c.b);if(sc>bs){bs=sc;best=c}}
  if(bs>=2)return {reply:best.r,source:'content'};
  if(/\b(service|services|offer|offers|help)\b/.test(low)||/خدمات|سروس|مدد/.test(low))return {reply:'We offer: '+services.map(x=>x.title).join(', ')+'.',source:'rule'};
  if(/\b(pillar|pillars|framework|stage|stages)\b/.test(low)||/ستون|پلر|مراحل|مرحلہ/.test(low))return {reply:`Our framework has ${pillars.length} pillars in ${stages.length} stages: ${stages.map(x=>x.title).join(', ')}.`,source:'rule'};
  if(/\b(who|about|family life)\b/.test(low))return {reply:`Family Life: ${s.tag||''}. ${s.slogan||''}. ${(s.values||[]).join(', ')}.`,source:'rule'};
  return null;
}
const system=({s,services,faqs,stages,pillars,qa})=>`You are the website assistant for "${s.name||'Family Life'}", a family guidance service in Pakistan (tagline: ${s.tag}; slogan: ${s.slogan}).
LANGUAGE (very important): always reply in the SAME language and script the visitor last wrote in. Examples: English -> English; Urdu script -> Urdu script; Roman Urdu -> Roman Urdu; Punjabi, Pashto, Sindhi, Arabic, Hindi or any other language -> that language. If they switch language, you switch too. The facts below are written in English, so translate them naturally; keep names, phone numbers and service titles recognisable.
Answer briefly and warmly. Answer ONLY using the facts below. If something is not covered, say you are not sure and ask them to message the team on WhatsApp. Never invent prices, timings, or medical/legal advice. Politely steer unrelated questions back to Family Life.
IMPORTANT: Our services ARE paid. If asked whether services are paid or free, answer exactly in the spirit of: "${s.chargesAnswer||s.charges}".
For booking: ask name, topic and preferred time, then tell them to confirm on WhatsApp.
CONTACT: phone ${s.phone}; WhatsApp ${s.wa}; email ${s.email||'not available'}.
VALUES: ${(s.values||[]).join('; ')}.
SERVICES:\n${services.map(x=>`- ${x.title}: ${x.description}`).join('\n')}
FRAMEWORK:\n${stages.map(st=>`* ${st.title} (${st.subtitle||''}): ${pillars.filter(p=>p.stage===st.title).map(p=>`${p.title} - ${p.description}`).join(' | ')}`).join('\n')}
FAQ:\n${faqs.map(f=>`Q: ${f.question}\nA: ${f.answer}`).join('\n')}
EXTRA Q&A:\n${qa.map(e=>`Q: ${e.question}\nA: ${e.answer}`).join('\n')}`;

async function askClaude(messages,kb){
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model:process.env.ANTHROPIC_MODEL||'claude-sonnet-5-5',max_tokens:700,system:system(kb),messages})});
  const d=await r.json();if(!r.ok)throw new Error(d.error?.message||'AI error');
  return d.content?.map(c=>c.text||'').join('').trim();
}
export async function chat(rawMessages){
  const messages=(rawMessages||[]).slice(-12).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1000)})).filter(m=>m.content);
  while(messages.length&&messages[0].role!=='user')messages.shift();
  const last=[...messages].reverse().find(m=>m.role==='user');if(!last)return {reply:null};
  const kb=await loadKnowledge();
  let out=null;
  // 1) Claude with full database context (if API key exists): replies in ANY language, using admin Q&A + fees answer from the database
  if(process.env.ANTHROPIC_API_KEY){try{const t=await askClaude(messages,kb);if(t)out={reply:t,source:'ai'}}catch(e){console.error('AI error:',e.message)}}
  // 2) no key / AI failed: admin-written Q&A, fees and greeting rules, then keyword matching on database content
  if(!out)out=priority(last.content,kb);
  // 3) database keyword matching
  if(!out)out=answer(last.content,kb);
  ChatLog.create({question:last.content.slice(0,1000),answered:!!out,source:out?.source||'none'}).catch(()=>{});
  return out||{reply:null,source:'none'};
}
