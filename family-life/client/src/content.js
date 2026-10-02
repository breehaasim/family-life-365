// Loads website content from the database (admin panel) and swaps it into the same arrays/objects data.js exports.
// If the API is down, the website simply keeps the default content from data.js.
import {SITE,SLIDES,STAGES,PILLARS,SERVICES,FAQ,LOOP,VALUES,GALLERY,TOPICS,get} from './data.js';
const swap=(a,items)=>a.splice(0,a.length,...items);
export async function loadContent(){
  const d=await Promise.race([get('/content'),new Promise(r=>setTimeout(()=>r(null),3000))]);
  if(!d||!d.site)return false;
  Object.assign(SITE,d.site);
  if(d.slides?.length)swap(SLIDES,d.slides.map(s=>s.video?{video:true,title:s.title,text:s.text}:{img:s.img,title:s.title,text:s.text}));
  if(d.values)swap(VALUES,d.values);
  if(d.loop)swap(LOOP,d.loop.map(l=>[l.title,l.text]));
  if(d.faqs)swap(FAQ,d.faqs.map(f=>[f.question,f.answer]));
  if(d.services){
    swap(SERVICES,d.services.map(s=>{const fb=s.fb||'/images/pillars/p02.jpg';return{t:s.title,d:s.description,img:s.img||fb,fb}}));
    swap(TOPICS,[...d.services.map(s=>s.title),'Other']);
  }
  if(d.stages&&d.pillars){
    swap(STAGES,d.stages.map(st=>({t:st.title,s:st.subtitle,p:d.pillars.filter(p=>p.stage===st.title).map(p=>[p.title,p.description])})));
    let n=0;
    swap(PILLARS,d.stages.flatMap(st=>d.pillars.filter(p=>p.stage===st.title).map(p=>{n++;const fb=`/images/pillars/p${String(((n-1)%11)+1).padStart(2,'0')}.jpg`;return{n,t:p.title,d:p.description,stage:st.title,img:p.img||fb,fb}})));
  }
  // gallery re-uses service / pillar images
  if(SERVICES[0])GALLERY[2]={...GALLERY[2],src:SERVICES[0].img,fb:SERVICES[0].fb,t:SERVICES[0].t};
  if(PILLARS[0])GALLERY[3]={...GALLERY[3],src:PILLARS[0].img,fb:PILLARS[0].fb};
  if(SERVICES[2])GALLERY[4]={...GALLERY[4],src:SERVICES[2].img,fb:SERVICES[2].fb};
  return true;
}
