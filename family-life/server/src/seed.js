// Default content = exactly what the website showed before (client/src/data.js). Seeded once, into an empty database.
import {Setting,Service,Faq,Stage,Pillar,QA} from './models.js';
const CH='Yes, our consultations are paid. Fee details are shared when you message us on WhatsApp.';
const IMG={b:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZxX385d_ERYjo9mUT1nllyA-DJCMw4gFbYVHpS_4Zww&s=10',c:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6-NSab3lLw3Pd4soWpwrrScSRasEeq6GqNoUTUOuaAA&s=10'};
const SETTINGS={name:'Family Life',tag:'Helping You, Help Yourself',slogan:'Better People, Brighter Tomorrow',phone:'0334-7580699',wa:'923347580699',email:'Ali.haider3860@gmail.com',contactMigrated:true,
 charges:CH,chargesAnswer:'Jee, our services are paid. Fee details are shared on WhatsApp (0334-7580699).',showTestimonials:true,servicesConfirmed:false,autoApproveTestimonials:false,
 slides:[{video:true,title:'Where life becomes meaningful',text:'A practical path to building and running a family.'},{img:IMG.b,title:'Strong homes raise confident children',text:'Roles, boundaries and culture, built together.'},{img:IMG.c,title:'Understand. Plan. Practice. Review.',text:'One loop that turns intentions into daily habits.'}],
 values:['Faith guides us','Compassion builds us','Respect strengthens us','Growth takes us forward'],
 loop:[['Understand','Identify needs, roles and root causes.'],['Plan','Set priorities, boundaries and routines.'],['Practice','Communicate and act consistently.'],['Review','Notice progress, repair and adjust.']].map(([title,text])=>({title,text}))};
const SERVICES=[
['Family counselling','Talk through family tension, communication and roles with a guide.','https://cdn2.psychologytoday.com/assets/styles/manual_crop_1_91_1_1528x800/public/teaser_image/blog_entry/2023-10/shutterstock_1125091478.jpg?itok=2G6bsOWK','/images/pillars/p02.jpg'],
['Parenting guidance','Practical support on discipline, routines, education and raising confident children.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCTnjKl4KqUJXfTRb0E3JjTcPPcyrsHVWs9zJ4Xpl8Qd-QLaZD0qCSLho&s=10','/images/pillars/p05.jpg'],
['Pre-marriage & partner guidance','Explore compatibility, expectations and goals before the big decision.','https://click2pro.com/media/blog/Pre_Marriage_Counseling_vs._Couples_Therapy_Understanding_the_Difference_and_Benefits.png','/images/pillars/p08.jpg'],
['Conflict resolution','Find the root cause, rebuild trust and agree on healthier ways forward.','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-I4BK1k4LeObVWH885i2QrGsSsPFLA8tYwINHLmUjJpZKOaCZCn2nF4WD&s=10','/images/pillars/p05.jpg']];
const FAQS=[['Who is Family Life for?','Parents, couples, young adults and anyone who wants a healthier family environment.'],['Is counselling free or paid?',CH],['How do I book?','Use the booking form or the chat assistant. Your request opens on WhatsApp so we can confirm a time.'],['Is my information private?','Yes. Your details are only used to arrange your session.']];
const PR={1:'https://www.vitanova.co.za/wp-content/uploads/2019/06/Depositphotos_24440795_ds_Parental-Guidance.jpg',2:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzI20B-rTzdV6uRI7UrmCT0iNT4l8E-g862PdssRvP766oyP-AdoxddZM&s=10',3:'/images/family-tree.jpg',4:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReaBYZdSukoSX21PCC89AsySB6ztPSo6P24W3L4ODxj7dgJEm7nCRaSpo&s=10',5:'https://c8.alamy.com/comp/2RFJA65/performance-increase-ways-motivation-and-self-discipline-goal-achievement-time-management-self-management-productivity-metaphors-flat-vector-mod-2RFJA65.jpg',6:'https://topagentmagazine.com/profiles/2016/07/goal-setting.jpeg',7:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKw0Y42ajZfOR6tLOkwrcJmNNOCL3PMx9h9_nFlHmRpGewee-0Awc7usI&s=10',8:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8rb3TAGp6iWaHLEIlhOAKu058DnArH2b0r3mI95qjW_Y1Wrir_CgVIzc6&s=10',10:'https://realkm.com/wp-content/uploads/2024/05/knowledge-management-applied-to-finding-a-life-partner.jpg',11:'https://therapygroupdc.com/wp-content/uploads/59fad3a0-3a78-466e-96b7-41129bb80afb.png'};
const STAGES=[
['Build the Home','Roles, culture, personal conduct',[['Parental Guidance','Father, mother and couple roles; healthy boundaries; teamwork for a strong environment.'],['Family Culture','Mutual respect, communication, shared values and traditions that bring the family closer.'],['Personal Grooming & Environmental Awareness','Manners, discipline, confidence, cleanliness and responsibility toward surroundings.'],['Education & Schooling','Understand strengths, choose educational paths, support learning and develop confident, responsible individuals.']]],
['Develop the Person','Learning, discipline, goals',[['Time Management & Self-Discipline','Priorities, healthy routines and balance across family, work, education and growth.'],['Goal Setting & Planning','Meaningful goals, practical planning, focus and turning intentions into action.']]],
['Turn Plans into Life','Implementation and well-being',[['Effective Implementation','Move from ideas to action through practical steps, consistency, discipline and follow-through.'],['Social & Environmental Health','Healthy living, positive connections, personal well-being and community responsibility.']]],
['Extend & Protect Relationships','Boundaries, compatibility, conflict',[['Relationships Beyond the Family','Respectful social connections, clear boundaries and healthy everyday relationships.'],['Partner Choice & Compatibility','Shared values, personalities, expectations and goals as a foundation for family life.'],['Conflict Resolution & Relationship Preservation','Understand root causes, improve communication, rebuild trust and find healthier ways forward.']]]];

export async function seedIfEmpty(){
  let s=await Setting.findOne({key:'main'});
  if(s?.seeded)return false;
  s=s||new Setting({key:'main'});Object.assign(s,SETTINGS,{seeded:true});await s.save();
  if(!await Service.countDocuments())await Service.insertMany(SERVICES.map(([title,description,img,fb],order)=>({title,description,img,fb,order})));
  if(!await Faq.countDocuments())await Faq.insertMany(FAQS.map(([question,answer],order)=>({question,answer,order})));
  if(!await Stage.countDocuments()){
    await Stage.insertMany(STAGES.map(([title,subtitle],order)=>({title,subtitle,order})));
    let n=0;await Pillar.insertMany(STAGES.flatMap(([stage,,ps])=>ps.map(([title,description])=>{n++;return{title,description,stage,img:PR[n]||'',order:n}})));}
  if(!await QA.countDocuments())await QA.create({question:'Do you offer online sessions?',keywords:'online,zoom,video call,remote,in person,in-person',answer:'Yes. When you book, you can choose Online or In person, and we confirm the time with you on WhatsApp.'});
  return true;
}

// One-time update for databases created before the contact details were corrected.
// Only values that are still the OLD defaults are replaced, so anything edited in the admin panel is kept.
const OLD={phone:'0325-1235888',wa:'923251235888'};
export async function migrateContact(){
  const s=await Setting.findOne({key:'main'});if(!s||s.contactMigrated)return false;
  if(s.phone===OLD.phone)s.phone=SETTINGS.phone;
  if(s.wa===OLD.wa)s.wa=SETTINGS.wa;
  if(!s.email)s.email=SETTINGS.email;
  if(s.chargesAnswer?.includes(OLD.phone))s.chargesAnswer=s.chargesAnswer.split(OLD.phone).join(SETTINGS.phone);
  s.contactMigrated=true;await s.save();return true;
}
