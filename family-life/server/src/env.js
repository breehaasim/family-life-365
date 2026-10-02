// Loads server/.env (always from the server folder, no matter where you start the command from) and tells you clearly what it found.
import dotenv from 'dotenv';import path from 'path';import fs from 'fs';import {fileURLToPath} from 'url';
const file=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','.env');
if(fs.existsSync(file)){
  dotenv.config({path:file});
  const need=['MONGODB_URI','ADMIN_EMAIL','ADMIN_PASSWORD','JWT_SECRET'].filter(k=>!process.env[k]);
  console.log('.env loaded from',file);
  if(need.length)console.warn('!!! These are missing or empty in .env:',need.join(', '),'\n!!! (file may be saved as UTF-16, or a line has a typo / extra spaces)');
}else{
  console.warn('\n!!! NO .env FILE FOUND. Expected here:\n!!! '+file+'\n!!! Copy .env.example to .env in the same folder and put your values in .env (not in .env.example). Using defaults for now.\n');
}
