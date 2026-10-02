import mongoose from 'mongoose';
const {Schema,model}=mongoose;
const T={type:String,trim:true};

// ---- Existing collections (same names as before: appointments, contacts, testimonials, subscribers) ----
export const Appointment=model('Appointment',new Schema({
  name:{...T,required:true,maxlength:100},phone:{...T,required:true,maxlength:30},
  topic:{...T,maxlength:150},mode:{...T,maxlength:30},when:{...T,maxlength:200},
  source:{type:String,enum:['form','chatbot'],default:'form'},
  status:{type:String,enum:['new','confirmed','done','cancelled'],default:'new'},
  notes:{...T,maxlength:1000}},{timestamps:true}));

export const Contact=model('Contact',new Schema({
  name:{...T,required:true,maxlength:100},email:{...T,maxlength:150},phone:{...T,maxlength:30},
  message:{...T,required:true,maxlength:2000},
  status:{type:String,enum:['new','read','replied'],default:'new'},notes:{...T,maxlength:1000}},{timestamps:true}));

export const Testimonial=model('Testimonial',new Schema({
  name:{...T,required:true,maxlength:100},role:{...T,maxlength:100},quote:{...T,required:true,maxlength:600},
  approved:{type:Boolean,default:true}},{timestamps:true}));

export const Subscriber=model('Subscriber',new Schema({
  email:{type:String,required:true,unique:true,lowercase:true,trim:true}},{timestamps:true}));

// ---- New: CMS content ----
export const Setting=model('Setting',new Schema({
  key:{type:String,default:'main',unique:true},
  name:T,tag:T,slogan:T,phone:T,wa:T,email:T,
  charges:{...T,maxlength:500},                 // shown on website (Services note + FAQ)
  chargesAnswer:{...T,maxlength:500},           // what the chatbot answers for paid/free/fees questions
  showTestimonials:{type:Boolean,default:true},
  servicesConfirmed:{type:Boolean,default:false},
  autoApproveTestimonials:{type:Boolean,default:false},
  slides:[{_id:false,video:Boolean,img:String,title:String,text:String}],
  values:[String],
  loop:[{_id:false,title:String,text:String}],
  seeded:{type:Boolean,default:false},contactMigrated:{type:Boolean,default:false}},{timestamps:true}));

const ord={type:Number,default:0};
export const Service=model('Service',new Schema({title:{...T,required:true,maxlength:120},description:{...T,required:true,maxlength:600},img:T,fb:T,order:ord,active:{type:Boolean,default:true}},{timestamps:true}));
export const Faq=model('Faq',new Schema({question:{...T,required:true,maxlength:250},answer:{...T,required:true,maxlength:1000},order:ord,active:{type:Boolean,default:true}},{timestamps:true}));
export const Stage=model('Stage',new Schema({title:{...T,required:true,maxlength:100,unique:true},subtitle:{...T,maxlength:200},order:ord},{timestamps:true}));
export const Pillar=model('Pillar',new Schema({title:{...T,required:true,maxlength:150},description:{...T,required:true,maxlength:600},stage:{...T,required:true},img:T,order:ord},{timestamps:true}));

// ---- New: chatbot knowledge + log of asked questions ----
export const QA=model('QA',new Schema({question:{...T,required:true,maxlength:250},keywords:{...T,maxlength:400}, // comma separated
  answer:{...T,required:true,maxlength:1000},active:{type:Boolean,default:true}},{timestamps:true}));
export const ChatLog=model('ChatLog',new Schema({question:{type:String,maxlength:1000},answered:Boolean,source:String,handled:{type:Boolean,default:false}},{timestamps:true}));

// ---- New: admin users ----
export const AdminUser=model('AdminUser',new Schema({
  name:{...T,required:true,maxlength:100},email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true},role:{type:String,enum:['admin','editor'],default:'editor'},
  active:{type:Boolean,default:true},lastLogin:Date},{timestamps:true}));
