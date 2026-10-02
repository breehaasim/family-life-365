// ===== EDIT HERE: sab client data ek jagah =====
export const SITE={name:'Family Life',tag:'Helping You, Help Yourself',slogan:'Better People, Brighter Tomorrow',
phone:'0334-7580699',wa:'923347580699',email:'Ali.haider3860@gmail.com',
showTestimonials:true,servicesConfirmed:false /* TODO: client list confirm kare to true */,
charges:'Yes, our consultations are paid. Fee details are shared when you message us on WhatsApp.' /* TODO: free/paid */};
// Apni images public/images/ mein rakh kar yahan '/images/x.jpg' likhein. Load na hon to gradient fallback dikhta hai.
export const IMG={
a:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL8Go3nTFfWB8vvAQ8-l32lFu71If4G6d1EvBdqbDlRg&s=10',
b:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZxX385d_ERYjo9mUT1nllyA-DJCMw4gFbYVHpS_4Zww&s=10',
c:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6-NSab3lLw3Pd4soWpwrrScSRasEeq6GqNoUTUOuaAA&s=10'};
export const SLIDES=[
{video:true,title:'Where life becomes meaningful',text:'A practical path to building and running a family.'},
{img:IMG.b,title:'Strong homes raise confident children',text:'Roles, boundaries and culture, built together.'},
{img:IMG.c,title:'Understand. Plan. Practice. Review.',text:'One loop that turns intentions into daily habits.'}];
export const STAGES=[ // TODO: client 3 ya 4 stages confirm kare (PPTX = 4, PDF = 3)
{t:'Build the Home',s:'Roles, culture, personal conduct',p:[
['Parental Guidance','Father, mother and couple roles; healthy boundaries; teamwork for a strong environment.'],
['Family Culture','Mutual respect, communication, shared values and traditions that bring the family closer.'],
['Personal Grooming & Environmental Awareness','Manners, discipline, confidence, cleanliness and responsibility toward surroundings.'],
['Education & Schooling','Understand strengths, choose educational paths, support learning and develop confident, responsible individuals.']]},
{t:'Develop the Person',s:'Learning, discipline, goals',p:[
['Time Management & Self-Discipline','Priorities, healthy routines and balance across family, work, education and growth.'],
['Goal Setting & Planning','Meaningful goals, practical planning, focus and turning intentions into action.']]},
{t:'Turn Plans into Life',s:'Implementation and well-being',p:[
['Effective Implementation','Move from ideas to action through practical steps, consistency, discipline and follow-through.'],
['Social & Environmental Health','Healthy living, positive connections, personal well-being and community responsibility.']]},
{t:'Extend & Protect Relationships',s:'Boundaries, compatibility, conflict',p:[
['Relationships Beyond the Family','Respectful social connections, clear boundaries and healthy everyday relationships.'],
['Partner Choice & Compatibility','Shared values, personalities, expectations and goals as a foundation for family life.'],
['Conflict Resolution & Relationship Preservation','Understand root causes, improve communication, rebuild trust and find healthier ways forward.']]}];
export const LOOP=[['Understand','Identify needs, roles and root causes.'],['Plan','Set priorities, boundaries and routines.'],['Practice','Communicate and act consistently.'],['Review','Notice progress, repair and adjust.']];
export const SERVICES=[ // TODO: client final list de
{t:'Family counselling',d:'Talk through family tension, communication and roles with a guide.',img:'https://cdn2.psychologytoday.com/assets/styles/manual_crop_1_91_1_1528x800/public/teaser_image/blog_entry/2023-10/shutterstock_1125091478.jpg?itok=2G6bsOWK',fb:'/images/pillars/p02.jpg'},
{t:'Parenting guidance',d:'Practical support on discipline, routines, education and raising confident children.',img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCTnjKl4KqUJXfTRb0E3JjTcPPcyrsHVWs9zJ4Xpl8Qd-QLaZD0qCSLho&s=10',fb:'/images/pillars/p05.jpg'},
{t:'Pre-marriage & partner guidance',d:'Explore compatibility, expectations and goals before the big decision.',img:'https://click2pro.com/media/blog/Pre_Marriage_Counseling_vs._Couples_Therapy_Understanding_the_Difference_and_Benefits.png',fb:'/images/pillars/p08.jpg'},
{t:'Conflict resolution',d:'Find the root cause, rebuild trust and agree on healthier ways forward.',img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-I4BK1k4LeObVWH885i2QrGsSsPFLA8tYwINHLmUjJpZKOaCZCn2nF4WD&s=10',fb:'/images/pillars/p05.jpg'}];
export const TOPICS=['Family counselling','Parenting guidance','Pre-marriage guidance','Conflict resolution','Other'];
export const FAQ=[['Who is Family Life for?','Parents, couples, young adults and anyone who wants a healthier family environment.'],
['Is counselling free or paid?',SITE.charges],['How do I book?','Use the booking form or the chat assistant. Your request opens on WhatsApp so we can confirm a time.'],
['Is my information private?','Yes. Your details are only used to arrange your session.']];
export const VALUES=['Faith guides us','Compassion builds us','Respect strengthens us','Growth takes us forward'];
export const waLink=m=>`https://wa.me/${SITE.wa}?text=${encodeURIComponent(m)}`;
const PR={3: '/images/family-tree.jpg', 1: 'https://www.vitanova.co.za/wp-content/uploads/2019/06/Depositphotos_24440795_ds_Parental-Guidance.jpg', 2: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzI20B-rTzdV6uRI7UrmCT0iNT4l8E-g862PdssRvP766oyP-AdoxddZM&s=10', 4: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReaBYZdSukoSX21PCC89AsySB6ztPSo6P24W3L4ODxj7dgJEm7nCRaSpo&s=10', 5: 'https://c8.alamy.com/comp/2RFJA65/performance-increase-ways-motivation-and-self-discipline-goal-achievement-time-management-self-management-productivity-metaphors-flat-vector-mod-2RFJA65.jpg', 6: 'https://topagentmagazine.com/profiles/2016/07/goal-setting.jpeg', 7: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKw0Y42ajZfOR6tLOkwrcJmNNOCL3PMx9h9_nFlHmRpGewee-0Awc7usI&s=10', 8: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8rb3TAGp6iWaHLEIlhOAKu058DnArH2b0r3mI95qjW_Y1Wrir_CgVIzc6&s=10', 10: 'https://realkm.com/wp-content/uploads/2024/05/knowledge-management-applied-to-finding-a-life-partner.jpg', 11: 'https://therapygroupdc.com/wp-content/uploads/59fad3a0-3a78-466e-96b7-41129bb80afb.png'};
let n=0;export const PILLARS=STAGES.flatMap(s=>s.p.map(([t,d])=>{n++;const fb=`/images/pillars/p${String(n).padStart(2,'0')}.jpg`;return{n,t,d,stage:s.t,img:PR[n]||fb,fb}}));
export const api=async(u,b)=>{try{const r=await fetch('/api'+u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});return r.ok?await r.json():null}catch{return null}};
export const get=async u=>{try{const r=await fetch('/api'+u);return r.ok?await r.json():null}catch{return null}};
export const ABOUT_IMG='https://www.sunlife.co.id/content/dam/sunlife/legacy/assets/id/Life%20Moments/Starting%20My%20Career/OG%20Images_L4%20Life%20Moments_Starting%20My%20Career_The%20Key%20to%20Brighter%20Future.jpg';
export const BOOK_IMG='https://innerengineering.sadhguru.org/online/blog/wp-content/uploads/2014/11/shutterstock_lowres_72ppi.jpg';
export const GALLERY=[{src:'/images/pillars/p03.jpg',fb:'/images/poster.jpg',t:'Growing together'},{src:ABOUT_IMG,fb:'/images/pillars/p02.jpg',t:'A brighter future'},{src:SERVICES[0].img,fb:SERVICES[0].fb,t:'Family counselling'},{src:PILLARS[0].img,fb:PILLARS[0].fb,t:'Parental guidance'},{src:SERVICES[2].img,fb:SERVICES[2].fb,t:'Partner guidance'},{src:BOOK_IMG,fb:'/images/poster.jpg',t:'Peace of mind'}];
