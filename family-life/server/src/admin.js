import express from 'express';
import {Appointment,Contact,Testimonial,Subscriber,Setting,Service,Faq,Stage,Pillar,QA,ChatLog,AdminUser} from './models.js';
import {requireAuth,requireAdmin,hash,okPassword,publicUser} from './auth.js';
import bcrypt from 'bcryptjs';

export const wrap=f=>(q,r,n)=>f(q,r,n).catch(e=>{
  if(e.code===11000)return r.status(409).json({error:'This value already exists.'});
  if(e.name==='CastError')return r.status(400).json({error:'Invalid id or value.'});
  if(e.name==='ValidationError')return r.status(400).json({error:e.message});
  console.error(e);r.status(500).json({error:'Server error'})});

// resource name -> [Model, default sort]
const RES={services:[Service,'order'],faqs:[Faq,'order'],stages:[Stage,'order'],pillars:[Pillar,'order'],qa:[QA,'-createdAt'],
  testimonials:[Testimonial,'-createdAt'],appointments:[Appointment,'-createdAt'],contacts:[Contact,'-createdAt'],subscribers:[Subscriber,'-createdAt']};
const clean=b=>{const x={...b};for(const k of ['_id','__v','createdAt','updatedAt'])delete x[k];return x};
const str=(v,n)=>String(v??'').trim().slice(0,n);

export const admin=express.Router();
admin.use(requireAuth);

admin.get('/me',(q,r)=>r.json(q.user.legacy?{name:'API key',role:'admin'}:publicUser(q.user)));
admin.put('/me/password',wrap(async(q,r)=>{
  if(q.user.legacy)return r.status(400).json({error:'Not available for API key access'});
  const {current,next}=q.body;if(!await bcrypt.compare(String(current||''),q.user.passwordHash))return r.status(400).json({error:'Current password is wrong'});
  if(!okPassword(next))return r.status(400).json({error:'New password must be 8 to 100 characters'});
  q.user.passwordHash=await hash(next);await q.user.save();r.json({ok:true})}));

admin.get('/stats',wrap(async(q,r)=>{
  const c=(M,f={})=>M.countDocuments(f);
  const [bookNew,bookAll,enqNew,enqAll,testPending,testAll,subs,unanswered,services,faqs,pillars,recent]=await Promise.all([
    c(Appointment,{status:'new'}),c(Appointment),c(Contact,{status:'new'}),c(Contact),c(Testimonial,{approved:false}),c(Testimonial),c(Subscriber),
    c(ChatLog,{answered:false,handled:false}),c(Service),c(Faq),c(Pillar),Appointment.find().sort('-createdAt').limit(5).lean()]);
  r.json({bookNew,bookAll,enqNew,enqAll,testPending,testAll,subs,unanswered,services,faqs,pillars,recent})}));

// ---- Site settings / content editor ----
admin.get('/settings',wrap(async(q,r)=>r.json(await Setting.findOne({key:'main'}).lean()||{})));
admin.put('/settings',wrap(async(q,r)=>{
  const b=q.body,set={};
  for(const [k,n] of [['name',100],['tag',200],['slogan',200],['phone',30],['wa',30],['email',150],['charges',500],['chargesAnswer',500]])if(k in b)set[k]=str(b[k],n);
  for(const k of ['showTestimonials','servicesConfirmed','autoApproveTestimonials'])if(k in b)set[k]=!!b[k];
  if(Array.isArray(b.values))set.values=b.values.map(v=>str(v,120)).filter(Boolean).slice(0,12);
  if(Array.isArray(b.loop))set.loop=b.loop.map(x=>({title:str(x.title,60),text:str(x.text,200)})).filter(x=>x.title).slice(0,8);
  if(Array.isArray(b.slides))set.slides=b.slides.map(x=>({video:!!x.video,img:str(x.img,600),title:str(x.title,120),text:str(x.text,250)})).filter(x=>x.title).slice(0,8);
  if(set.slides&&!set.slides.length)return r.status(400).json({error:'At least one hero slide is required'});
  r.json(await Setting.findOneAndUpdate({key:'main'},{$set:set},{new:true,upsert:true,runValidators:true}))}));

// ---- Chatbot unanswered questions ----
admin.get('/chatlog',wrap(async(q,r)=>r.json(await ChatLog.find(q.query.all?{}:{answered:false}).sort('-createdAt').limit(300))));
admin.patch('/chatlog/:id',wrap(async(q,r)=>r.json(await ChatLog.findByIdAndUpdate(q.params.id,{handled:!!q.body.handled},{new:true}))));
admin.delete('/chatlog/:id',wrap(async(q,r)=>{await ChatLog.findByIdAndDelete(q.params.id);r.json({ok:true})}));

// ---- User management (admin only) ----
admin.get('/users',requireAdmin,wrap(async(q,r)=>r.json((await AdminUser.find().sort('createdAt')).map(publicUser))));
admin.post('/users',requireAdmin,wrap(async(q,r)=>{
  const {name,email,password,role}=q.body;if(!okPassword(password))return r.status(400).json({error:'Password must be 8 to 100 characters'});
  r.status(201).json(publicUser(await AdminUser.create({name:str(name,100),email,passwordHash:await hash(password),role:role==='admin'?'admin':'editor'})))}));
admin.put('/users/:id',requireAdmin,wrap(async(q,r)=>{
  const u=await AdminUser.findById(q.params.id);if(!u)return r.status(404).json({error:'Not found'});
  const b=q.body,self=String(u._id)===String(q.user._id);
  if(b.name!==undefined)u.name=str(b.name,100);
  if(b.role!==undefined){if(self&&b.role!==u.role)return r.status(400).json({error:'You cannot change your own role'});u.role=b.role==='admin'?'admin':'editor'}
  if(b.active!==undefined){if(self&&!b.active)return r.status(400).json({error:'You cannot deactivate yourself'});u.active=!!b.active}
  if(b.password){if(!okPassword(b.password))return r.status(400).json({error:'Password must be 8 to 100 characters'});u.passwordHash=await hash(b.password)}
  await u.save();r.json(publicUser(u))}));
admin.delete('/users/:id',requireAdmin,wrap(async(q,r)=>{
  if(String(q.params.id)===String(q.user._id))return r.status(400).json({error:'You cannot delete yourself'});
  await AdminUser.findByIdAndDelete(q.params.id);r.json({ok:true})}));

// ---- Generic CRUD: /api/admin/<resource> ----
const M=(q,r,n)=>{const e=RES[q.params.res];if(!e)return n('route');q.M=e[0];q.sort=e[1];n()};
admin.get('/:res',M,wrap(async(q,r)=>r.json(await q.M.find().sort(q.sort).limit(2000))));
admin.post('/:res',M,wrap(async(q,r)=>r.status(201).json(await q.M.create(clean(q.body)))));
admin.put('/:res/:id',M,wrap(async(q,r)=>{
  const body=clean(q.body);let old;
  if(q.params.res==='stages')old=await Stage.findById(q.params.id);
  const doc=await q.M.findByIdAndUpdate(q.params.id,{$set:body},{new:true,runValidators:true});
  if(!doc)return r.status(404).json({error:'Not found'});
  if(old&&body.title&&old.title!==doc.title)await Pillar.updateMany({stage:old.title},{stage:doc.title}); // keep pillars attached when a stage is renamed
  r.json(doc)}));
admin.delete('/:res/:id',M,wrap(async(q,r)=>{
  if(q.params.res==='stages'){const s=await Stage.findById(q.params.id);if(s&&await Pillar.countDocuments({stage:s.title}))return r.status(409).json({error:'This stage still has pillars. Move or delete them first.'})}
  await q.M.findByIdAndDelete(q.params.id);r.json({ok:true})}));
