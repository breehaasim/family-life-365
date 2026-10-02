import bcrypt from 'bcryptjs';import jwt from 'jsonwebtoken';import crypto from 'crypto';
import {AdminUser} from './models.js';
let SECRET=process.env.JWT_SECRET;
if(!SECRET){SECRET=crypto.randomBytes(32).toString('hex');console.warn('WARNING: JWT_SECRET not set in .env. A temporary one is used, admin logins will reset on every restart.');}
export const hash=p=>bcrypt.hash(p,10);
export const okPassword=p=>typeof p==='string'&&p.length>=8&&p.length<=100;
export const sign=u=>jwt.sign({id:String(u._id)},SECRET,{expiresIn:'12h'});
export const publicUser=u=>({id:u._id,name:u.name,email:u.email,role:u.role,active:u.active,lastLogin:u.lastLogin,createdAt:u.createdAt});

// Accepts: Bearer token (admin panel login)  OR  legacy x-admin-key header (old API usage, acts as admin)
export async function requireAuth(req,res,next){
  try{
    const key=process.env.ADMIN_KEY;
    if(key&&req.get('x-admin-key')===key){req.user={role:'admin',name:'API key',legacy:true};return next()}
    const h=req.get('authorization')||'';if(!h.startsWith('Bearer '))return res.status(401).json({error:'Unauthorized'});
    const {id}=jwt.verify(h.slice(7),SECRET);const u=await AdminUser.findById(id);
    if(!u||!u.active)return res.status(401).json({error:'Unauthorized'});
    req.user=u;next();
  }catch{res.status(401).json({error:'Session expired. Please log in again.'})}
}
export const requireAdmin=(req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({error:'Admin access only'});

export async function login(email,password){
  const u=await AdminUser.findOne({email:String(email||'').toLowerCase().trim()});
  const ok=u&&u.active&&await bcrypt.compare(String(password||''),u.passwordHash);
  if(!ok)return null;u.lastLogin=new Date();await u.save();return u;
}
// Admin account from .env.
// - First start (no admin yet): creates it from ADMIN_EMAIL / ADMIN_PASSWORD.
// - If an admin already exists the .env values are ignored. To force them (forgot password, changed email),
//   add RESET_ADMIN=true to .env, start the server once, then remove that line again.
export async function ensureFirstAdmin(){
  const {ADMIN_EMAIL:e,ADMIN_PASSWORD:p,RESET_ADMIN}=process.env;
  if(String(RESET_ADMIN).toLowerCase()==='true'){
    if(!e||!okPassword(p)){console.warn('RESET_ADMIN needs ADMIN_EMAIL and ADMIN_PASSWORD (8 to 100 characters) in .env');return}
    const email=e.toLowerCase().trim();
    await AdminUser.findOneAndUpdate({email},{$set:{name:'Admin',passwordHash:await hash(p),role:'admin',active:true}},{upsert:true,new:true,setDefaultsOnInsert:true});
    console.log('Admin login set from .env:',email,'| password updated. Now remove RESET_ADMIN from .env.');return;
  }
  const n=await AdminUser.countDocuments({role:'admin'});
  if(n){console.log('Admin user already exists, so ADMIN_EMAIL / ADMIN_PASSWORD in .env are ignored. To use them, add RESET_ADMIN=true to .env and restart.');return}
  if(!e||!okPassword(p)){console.warn('No admin user yet. Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in server/.env and restart.');return}
  await AdminUser.create({name:'Admin',email:e,passwordHash:await hash(p),role:'admin'});console.log('First admin created:',e);
}
// tiny in-memory rate limiter (no extra package)
export const limit=(max,ms)=>{const hits=new Map();return(req,res,next)=>{const k=req.ip,n=Date.now(),a=(hits.get(k)||[]).filter(t=>n-t<ms);
  if(a.length>=max){hits.set(k,a);return res.status(429).json({error:'Too many requests. Please try again later.'})}a.push(n);hits.set(k,a);
  if(hits.size>5000)for(const [x,v] of hits)if(!v.some(t=>n-t<ms))hits.delete(x);next()}};
