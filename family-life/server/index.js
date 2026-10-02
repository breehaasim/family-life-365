import './src/env.js';import express from 'express';import cors from 'cors';import mongoose from 'mongoose';
import path from 'path';import fs from 'fs';import {fileURLToPath} from 'url';
import {Appointment,Contact,Testimonial,Subscriber,Setting,Service,Faq,Stage,Pillar} from './src/models.js';
import {admin,wrap} from './src/admin.js';
import {requireAuth,login,sign,publicUser,ensureFirstAdmin,limit} from './src/auth.js';
import {chat} from './src/chat.js';
import {seedIfEmpty,migrateContact} from './src/seed.js';

mongoose.set('bufferCommands',false); // fail fast instead of silently waiting when DB is down
const app=express();app.set('trust proxy',1);
app.use(cors(process.env.CLIENT_ORIGIN?{origin:process.env.CLIENT_ORIGIN.split(',')}:undefined),express.json({limit:'50kb'}));
const dbUp=()=>mongoose.connection.readyState===1;
app.get('/api/health',(q,r)=>r.json({ok:true,db:dbUp()}));
app.use('/api',(q,r,n)=>dbUp()?n():r.status(503).json({error:'Database not connected'}));

const pub=limit(20,10*60*1000),digits=s=>String(s||'').replace(/\D/g,'').length;

// ---- Public: website content (what the admin panel edits) ----
app.get('/api/content',wrap(async(q,r)=>{
  const [s,services,faqs,stages,pillars]=await Promise.all([Setting.findOne({key:'main'}).lean(),Service.find({active:true}).sort('order').lean(),Faq.find({active:true}).sort('order').lean(),Stage.find().sort('order').lean(),Pillar.find().sort('order').lean()]);
  const {_id,__v,seeded,contactMigrated,key,createdAt,updatedAt,slides,values,loop,chargesAnswer,autoApproveTestimonials,...site}=s||{};
  r.json({site,slides:slides||[],values:values||[],loop:loop||[],services,faqs,stages,pillars})}));

// ---- Public: forms ----
app.post('/api/appointments',pub,wrap(async(q,r)=>{const {name,phone,topic,mode,when,source}=q.body;
  if(digits(phone)<7)return r.status(400).json({error:'Please enter a valid phone number'});
  r.status(201).json(await Appointment.create({name,phone,topic,mode,when,source:source==='chatbot'?'chatbot':'form'}))}));
app.post('/api/contact',pub,wrap(async(q,r)=>{const {name,email,phone,message}=q.body;if(!email&&!phone)return r.status(400).json({error:'Please give an email or phone number'});r.status(201).json(await Contact.create({name,email,phone,message}))}));
app.get('/api/testimonials',wrap(async(q,r)=>r.json(await Testimonial.find({approved:true}).sort('-createdAt').limit(20))));
app.post('/api/testimonials/submit',pub,wrap(async(q,r)=>{const {name,role,quote}=q.body;const s=await Setting.findOne({key:'main'}).lean();
  await Testimonial.create({name,role,quote,approved:!!s?.autoApproveTestimonials});r.status(201).json({ok:true})}));
app.post('/api/subscribe',pub,wrap(async(q,r)=>{const e=String(q.body.email||'').toLowerCase().trim();if(!/^\S+@\S+\.\S+$/.test(e))return r.status(400).json({error:'Invalid email'});
  await Subscriber.updateOne({email:e},{$setOnInsert:{email:e}},{upsert:true});r.json({ok:true})}));
app.post('/api/chat',limit(40,10*60*1000),wrap(async(q,r)=>r.json(await chat(q.body.messages))));

// ---- Auth ----
app.post('/api/auth/login',limit(10,15*60*1000),wrap(async(q,r)=>{const u=await login(q.body.email,q.body.password);
  if(!u)return r.status(401).json({error:'Wrong email or password'});r.json({token:sign(u),user:publicUser(u)})}));

// ---- Admin panel API (login required) ----
app.use('/api/admin',admin);
// Old routes from v4 still work (Bearer token or x-admin-key header)
app.get('/api/appointments',requireAuth,wrap(async(q,r)=>r.json(await Appointment.find().sort('-createdAt').limit(500))));
app.patch('/api/appointments/:id',requireAuth,wrap(async(q,r)=>r.json(await Appointment.findByIdAndUpdate(q.params.id,{status:q.body.status},{new:true,runValidators:true}))));
app.delete('/api/appointments/:id',requireAuth,wrap(async(q,r)=>{await Appointment.findByIdAndDelete(q.params.id);r.json({ok:true})}));
app.get('/api/contact',requireAuth,wrap(async(q,r)=>r.json(await Contact.find().sort('-createdAt').limit(500))));
app.post('/api/testimonials',requireAuth,wrap(async(q,r)=>{const {name,role,quote}=q.body;r.status(201).json(await Testimonial.create({name,role,quote}))}));
app.delete('/api/testimonials/:id',requireAuth,wrap(async(q,r)=>{await Testimonial.findByIdAndDelete(q.params.id);r.json({ok:true})}));
app.get('/api/testimonials/all',requireAuth,wrap(async(q,r)=>r.json(await Testimonial.find().sort('-createdAt'))));
app.patch('/api/testimonials/:id',requireAuth,wrap(async(q,r)=>r.json(await Testimonial.findByIdAndUpdate(q.params.id,{approved:!!q.body.approved},{new:true}))));
app.get('/api/subscribe',requireAuth,wrap(async(q,r)=>r.json(await Subscriber.find().sort('-createdAt'))));

// ---- Production: serve the built website from the same server (npm run build in client first) ----
const dist=path.join(path.dirname(fileURLToPath(import.meta.url)),'../client/dist');
if(fs.existsSync(dist)){app.use(express.static(dist));app.get(/^\/(?!api\/).*/,(q,r)=>r.sendFile(path.join(dist,'index.html')))}

const uri=process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/familylife';
mongoose.connect(uri,{serverSelectionTimeoutMS:10000}).then(async()=>{
  console.log('MongoDB connected, database:',mongoose.connection.name,'| host:',mongoose.connection.host,/127\.0\.0\.1|localhost/.test(mongoose.connection.host)?'  <-- LOCAL database on this computer, NOT Atlas':'  (Atlas/cloud)');
  if(await seedIfEmpty())console.log('Default website content saved to the database.');
  if(await migrateContact())console.log('Contact details updated in the database.');
  await ensureFirstAdmin();
}).catch(e=>console.error('MongoDB connection FAILED:',e.message,'\nCheck MONGODB_URI in server/.env and Atlas Network Access (IP allow list).'));
app.listen(process.env.PORT||5000,()=>console.log('API on :'+(process.env.PORT||5000)));
