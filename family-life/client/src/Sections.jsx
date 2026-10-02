import {useState,useEffect,useRef} from 'react';
import {SITE,SLIDES,PILLARS,LOOP,SERVICES,TOPICS,FAQ,VALUES,IMG,waLink,api,get,STAGES,ABOUT_IMG,BOOK_IMG,GALLERY} from './data.js';
import {Reveal,Words,Img,Btn,useProgress} from './ui.jsx';
export function Navbar(){const [s,setS]=useState(false),[o,setO]=useState(false);
useEffect(()=>{const f=()=>setS(scrollY>40);f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);
useEffect(()=>{document.body.style.overflow=o?'hidden':''},[o]);
const L=[['top','Home'],['about','About'],['stages','Stages'],['pillars','11 Pillars'],['services','Services'],['gallery','Gallery'],['testimonials','Testimonials'],['contact','Contact']];
return <header className={`nav ${s?'sc':''}`}><a href="#top" className="logo">Family <b>Life</b></a>
<nav className={o?'open':''} aria-label="Main">{L.map(([h,t],i)=><a key={h} href={'#'+h} style={{'--i':i}} onClick={()=>setO(false)}>{t}</a>)}<Btn href="#book" small onClick={()=>setO(false)}>Book now</Btn></nav>
<button className={`burger ${o?'x':''}`} onClick={()=>setO(!o)} aria-label="Menu" aria-expanded={o}><span/><span/></button></header>}
export function Hero(){const [i,setI]=useState(0);const x=useRef(0);const ms=SLIDES[i].video?9000:6500;
useEffect(()=>{const t=setTimeout(()=>setI(v=>(v+1)%SLIDES.length),ms);return()=>clearTimeout(t)},[i,ms]);
const go=d=>setI(v=>(v+d+SLIDES.length)%SLIDES.length);
return <section id="top" className="hero" onTouchStart={e=>x.current=e.touches[0].clientX} onTouchEnd={e=>{const d=e.changedTouches[0].clientX-x.current;if(Math.abs(d)>50)go(d<0?1:-1)}}>
{SLIDES.map((s,k)=><div key={k} className={`slide ${k===i?'on':''}`} aria-hidden={k!==i}>
{s.video?<video className="bg" src="/videos/hero.mp4" poster="/images/poster.jpg" autoPlay muted loop playsInline/>:<Img src={s.img} className="bg"/>}
<div className="shade"/><div className="hc"><p className="lab">Family • Connection • Life</p><Words as="h1" text={s.title} on={k===i} delay={300}/><p className="sub">{s.text}</p>
<div className="row"><Btn href="#story">Explore our story</Btn><Btn href="#pillars" ghost>Discover the 11 pillars</Btn></div></div></div>)}
<div className="dots"><span>0{i+1} / 0{SLIDES.length}</span>{SLIDES.map((_,k)=><button key={k} className={k===i?'on':''} style={{'--d':ms+'ms'}} onClick={()=>setI(k)} aria-label={`Slide ${k+1}`}/>)}</div>
<a href="#story" className="scroll" aria-label="Scroll down"><i/></a></section>}
export function Statement(){const [on,setOn]=useState(false);const r=useProgress(p=>setOn(p>.45));return <section id="story" className="pin" ref={r}><div className="stick">
<div className="frame"><video src="/videos/story.mp4" poster="/images/story-poster.jpg" autoPlay muted loop playsInline/></div>
<div className="stx"><p className={`lab rv ${on?'in':''}`}>Our story</p><Words as="h2" text="A family is built through everyday choices." on={on} delay={150}/><p className={`rv ${on?'in':''}`} style={{transitionDelay:'900ms'}}>Roles, culture, education, habits and repair. One connected journey, from the home outward.</p></div></div></section>}
export function About(){return <section id="about" className="sec split"><Reveal className="pic"><Img src={ABOUT_IMG} fb="/images/pillars/p02.jpg" alt="Family looking toward a brighter future"/></Reveal>
<div><Reveal as="p" className="lab">Who we are</Reveal><Words text="Better people, brighter tomorrow."/>
<Reveal delay={150} as="p" className="lead">Family Life is a practical guide to building and running a family, with support that meets you where you are.</Reveal>
<Reveal delay={250}><div className="vals">{VALUES.map(v=><span key={v}>{v}</span>)}</div></Reveal></div></section>}
export function Pillars(){const [a,setA]=useState(0);const rows=[PILLARS.slice(0,4),PILLARS.slice(4,7),PILLARS.slice(7,11)];
return <section id="pillars" className="sec dark"><Reveal as="p" className="lab">The framework</Reveal><Words text="The 11 pillars of a strong family"/>
<Reveal as="p" delay={150} className="lead">Tap or hover a pillar to explore it.</Reveal>
<div className="honey">{rows.map((r,ri)=><div className="hrow" key={ri}>{r.map(p=><Reveal key={p.n} delay={p.n*90} className="hexw">
<button className={`hex ${a===p.n?'act':''}`} onClick={()=>setA(a===p.n?0:p.n)} aria-label={p.t}><span className="hin"><Img src={p.img} fb={p.fb} alt="" style={{animationDelay:-p.n*2+'s'}}/><span className="hsh"/>
<span className="ht"><em>{String(p.n).padStart(2,'0')}</em><h3>{p.t}</h3><small>{p.stage}</small><p>{p.d}</p><b>Explore →</b></span></span></button></Reveal>)}</div>)}</div></section>}
export function Loop(){return <section className="sec loop"><Words text="A continuous relationship loop"/>
<div className="steps">{LOOP.map((l,k)=><Reveal key={k} delay={k*140} className="step sg"><i>{k+1}</i><h3>{l[0]}</h3><p>{l[1]}</p></Reveal>)}</div>
<Words as="blockquote" text="A strong family environment helps children grow with confidence, responsibility and happiness." delay={100}/></section>}
export function Services(){return <section id="services" className="sec"><Reveal as="p" className="lab">Services</Reveal><Words text="How we can help"/>
<Reveal as="figure" className="svbanner"><video src="/videos/hero.mp4" poster="/images/poster.jpg" autoPlay muted loop playsInline/><figcaption>Guidance for every stage of family life</figcaption></Reveal>
<div className="svc">{SERVICES.map((s,k)=><Reveal key={k} delay={k*110} className="sg"><a href="#book" className="card"><span className="pic"><Img src={s.img} fb={s.fb} alt={s.t}/><em className="cb">{'0'+(k+1)}</em></span><span className="ct"><h3>{s.t}</h3><p>{s.d}</p><b>Book now →</b></span></a></Reveal>)}</div>
<Reveal><p className="note">{SITE.charges}</p>{!SITE.servicesConfirmed&&<p className="note">Full services list to be confirmed.</p>}</Reveal></section>}
export function Book(){const [f,setF]=useState({name:'',phone:'',topic:TOPICS[0],mode:'Online',when:''});const [st,setSt]=useState('');const u=k=>e=>setF({...f,[k]:e.target.value});const ok=f.name&&f.phone;
const submit=async()=>{setSt('...');const r=await api('/appointments',{...f,source:'form'});setSt(r?'sent':'err');open(waLink(`Assalam o Alaikum, I am ${f.name} (${f.phone}). I would like to book a ${f.mode} consultation about: ${f.topic}. Preferred time: ${f.when||'flexible'}.`),'_blank')};
return <section id="book" className="sec book"><div className="bgimg" data-par><Img src={BOOK_IMG} fb="/images/poster.jpg" alt=""/></div><div className="bk"><Reveal as="p" className="lab">Appointments</Reveal><Words text="Book your consultation"/>
<Reveal delay={150} as="p" className="lead">Share your details. We save your request and open WhatsApp to confirm a time.</Reveal>
<Reveal delay={250}><div className="form"><input placeholder="Your name" value={f.name} onChange={u('name')} aria-label="Name"/><input placeholder="Phone number" value={f.phone} onChange={u('phone')} aria-label="Phone"/>
<select value={f.topic} onChange={u('topic')} aria-label="Topic">{TOPICS.map(t=><option key={t}>{t}</option>)}</select><select value={f.mode} onChange={u('mode')} aria-label="Mode"><option>Online</option><option>In person</option></select>
<input placeholder="Preferred day and time" value={f.when} onChange={u('when')} aria-label="Preferred time"/>
<Btn onClick={submit} disabled={!ok||st==='...'}>{st==='sent'?'Request sent':'Send request'}</Btn>{st==='err'&&<p>We could not save your request online, but WhatsApp has opened so you can still reach us.</p>}</div></Reveal></div></section>}
export function Faq(){const [o,setO]=useState(0);return <section className="sec narrow"><Words text="Frequently asked questions"/>
{FAQ.map((q,k)=><Reveal key={k} delay={k*80} className={`faq ${o===k?'on':''}`}><button onClick={()=>setO(o===k?-1:k)} aria-expanded={o===k}>{q[0]}<span>+</span></button><div className="ans"><p>{q[1]}</p></div></Reveal>)}</section>}
export function Gallery(){return <section id="gallery" className="sec"><Reveal as="p" className="lab">Gallery</Reveal><Words text="Moments that matter"/>
<div className="gal">{GALLERY.map((g,k)=><Reveal as="figure" key={k} delay={k*90} className="gt"><Img src={g.src} fb={g.fb} alt={g.t}/><figcaption>{g.t}</figcaption></Reveal>)}</div></section>}
export function Footer(){const [em,setEm]=useState('');const [ok,setOk]=useState('');
const sub=async e=>{e.preventDefault();const r=await api('/subscribe',{email:em});setOk(r?'Thank you for subscribing.':'Please try again.');if(r)setEm('')};
return <footer id="contact"><video className="vbg" data-par src="/videos/hero.mp4" poster="/images/poster.jpg" autoPlay muted loop playsInline preload="none"/>
<Reveal className="sg"><h2>Family <b>Life</b></h2><p>{SITE.tag}</p><p className="slog">{SITE.slogan}</p></Reveal>
<Reveal delay={150} className="sg"><h3>Get in touch</h3><a href={`tel:${SITE.phone.replace(/-/g,'')}`}>{SITE.phone}</a><a href={waLink('Assalam o Alaikum')} target="_blank" rel="noreferrer">WhatsApp</a>{SITE.email&&<a href={`mailto:${SITE.email}`}>{SITE.email}</a>}</Reveal>
<Reveal delay={300} className="sg"><h3>Stay in touch</h3><p>Occasional guidance for stronger families.</p><form className="news" onSubmit={sub}><input type="email" required value={em} onChange={e=>setEm(e.target.value)} placeholder="Your email" aria-label="Email"/><button className="btn sm"><span>Subscribe</span><i>→</i></button></form>{ok&&<p>{ok}</p>}</Reveal>
<Reveal as="p" className="copy">© {new Date().getFullYear()} Family Life. Your journey matters, and we are here for you.</Reveal></footer>}
export function Stages(){return <section id="stages" className="sec"><Reveal as="p" className="lab">The journey</Reveal><Words text={`${STAGES.length} stages, one stronger family`}/>
<Reveal as="p" delay={150} className="lead">The framework moves from the home outward. Each stage groups the pillars that belong together.</Reveal>
<div className="stg">{STAGES.map((g,k)=>{const ps=PILLARS.filter(p=>p.stage===g.t).map(p=>p.n);return <Reveal key={k} delay={k*140} className="stgi sg"><span className="sn">{k+1}</span><h3>{g.t}</h3><small>{g.s}</small><p>Pillars {ps[0]}{ps.length>1?` to ${ps[ps.length-1]}`:''}</p><a href="#pillars">See pillars →</a></Reveal>})}</div></section>}
export function How(){const S=[['Book','Choose a time by form, chat or WhatsApp.'],['Consultation','Talk through your situation with our team.'],['Guidance','Leave with a clear plan you can practise.']];
return <section className="sec dark"><Reveal as="p" className="lab">How it works</Reveal><Words text="Three simple steps"/><div className="how">{S.map((x,k)=><Reveal key={k} delay={k*140} className="hs sg"><i>{k+1}</i><h3>{x[0]}</h3><p>{x[1]}</p></Reveal>)}</div><Reveal><Btn href="#book">Book a consultation</Btn></Reveal></section>}
export function Testimonials(){const [l,setL]=useState([]);const [f,setF]=useState({name:'',role:'',quote:''});const [st,setSt]=useState('');
useEffect(()=>{get('/testimonials').then(d=>d&&setL(d))},[]);if(!SITE.showTestimonials)return null;
const u=k=>e=>setF({...f,[k]:e.target.value});const send=async()=>{setSt('...');const r=await api('/testimonials/submit',f);setSt(r?'ok':'err');if(r)setF({name:'',role:'',quote:''})};
return <section id="testimonials" className="sec"><Reveal as="p" className="lab">Testimonials</Reveal><Words text="What our clients say"/>
{l.length?<div className="tst">{l.map((t,k)=><Reveal key={t._id} delay={k*100} className="sg"><figure className="tq"><blockquote>{t.quote}</blockquote><figcaption>{t.name}{t.role&&<small>{t.role}</small>}</figcaption></figure></Reveal>)}</div>:<Reveal as="p" delay={150} className="empty">Client stories will appear here once families share them. We only show real feedback.</Reveal>}
<Reveal delay={200}><div className="tform"><h3>Share your experience</h3><input placeholder="Your name" value={f.name} onChange={u('name')} aria-label="Name"/><input placeholder="Relation, e.g. Parent (optional)" value={f.role} onChange={u('role')} aria-label="Role"/><textarea rows="4" placeholder="Your story" value={f.quote} onChange={u('quote')} aria-label="Story"/>
<Btn onClick={send} disabled={!f.name||!f.quote||st==='...'}>Submit story</Btn>{st==='ok'&&<p>Thank you. Your story will appear after review.</p>}{st==='err'&&<p>Could not send. Please try again.</p>}</div></Reveal></section>}

export function Enquiry(){const [f,setF]=useState({name:'',email:'',phone:'',message:''});const [st,setSt]=useState('');const u=k=>e=>setF({...f,[k]:e.target.value});
const send=async()=>{setSt('...');const r=await api('/contact',f);setSt(r?'ok':'err');if(r)setF({name:'',email:'',phone:'',message:''})};
return <section id="enquiry" className="sec"><Reveal as="p" className="lab">Enquiries</Reveal><Words text="Have a question? Send us a message"/>
<Reveal delay={150}><div className="tform" style={{marginTop:'1rem'}}><input placeholder="Your name" value={f.name} onChange={u('name')} aria-label="Name"/><input type="email" placeholder="Email" value={f.email} onChange={u('email')} aria-label="Email"/><input placeholder="Phone (optional if you gave an email)" value={f.phone} onChange={u('phone')} aria-label="Phone"/><textarea rows="4" placeholder="Your message" value={f.message} onChange={u('message')} aria-label="Message"/>
<Btn onClick={send} disabled={!f.name||!f.message||(!f.email&&!f.phone)||st==='...'}>Send message</Btn>{st==='ok'&&<p>Thank you. We have received your message and will get back to you.</p>}{st==='err'&&<p>Could not send. Please try again or message us on WhatsApp.</p>}</div></Reveal></section>}
