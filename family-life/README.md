# Family Life v5 (React + Node/Express + MongoDB) with Admin Panel / CMS

## Run (local)
1. MongoDB: local `mongod` ya MongoDB Atlas URI.
2. Backend:
   ```
   cd server
   cp .env.example .env        (Windows: copy .env.example .env)
   ```
   `.env` mein apni `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET` likhein, phir:
   ```
   npm install
   npm run dev
   ```
   Terminal mein ye lines aani chahiye: `MongoDB connected, database: familylife`, `Default website content saved to the database.`, `First admin created: ...`
3. Frontend (naya terminal): `cd client && npm install && npm run dev` -> http://localhost:5173
4. Admin panel: http://localhost:5173/admin (login: `.env` wala ADMIN_EMAIL / ADMIN_PASSWORD)

## Production (ek hi server)
`cd client && npm run build`, phir `cd server && npm start`. Express khud `client/dist` serve karta hai, website aur `/admin` dono ek hi address par chalte hain.

## Admin panel (/admin)
Dashboard, Content Editor (site info, phone/WhatsApp, fees text, hero slides, values, loop), Services, Pillars & Stages, FAQ, Bookings, Enquiries, Testimonials (approve/hide), Subscribers (CSV export), Chatbot (Q&A + unanswered questions), User Management, My account.
- Roles: `admin` (sab kuch + users) aur `editor` (content, bookings, enquiries; users nahi).
- Login JWT se hota hai (12 ghante), login par rate limit hai, passwords bcrypt se hash hote hain.
- Admin link public website par nahi hai.

## Database collections (MongoDB Atlas > Browse Collections > database `familylife`)
appointments (bookings), contacts (enquiries), testimonials, subscribers, settings, services, faqs, stages, pillars, qas (chatbot Q&A), chatlogs (chatbot sawal), adminusers.
Pehli baar server start hone par website ka purana content (data.js wala) database mein save ho jata hai, us ke baad website wahi se parhti hai.

## Chatbot
Jawab database se aate hain: Q&A (admin ne likhe), services, pillars, FAQ, fees text, contact details. "Are services paid?" par hamesha Content Editor wala *Chatbot answer* (default: "Jee, our services are paid...") milta hai.
`ANTHROPIC_API_KEY` `.env` mein ho to Claude database ke poore content ko knowledge bana kar har sawal ka jawab deta hai. Jo sawal samajh na aaye wo Admin > Chatbot > Unanswered mein aa jata hai, wahan se jawab likh dein.
Booking chatbot se bhi hoti hai: naam, phone, topic, time poochta hai aur database mein save karta hai.

## Chatbot ki zabanein
`ANTHROPIC_API_KEY` set ho to chatbot har zabaan mein jawab deta hai (Urdu script, Roman Urdu, English, Punjabi, Arabic waghera): jis zabaan mein visitor likhe usi mein jawab. Fees, Q&A aur content sab database se aata hai.
Key ke baghair chatbot sirf database ke English jawab deta hai (Urdu script mein fees/phone/salam jaise sawal samajh leta hai). Sasta model: `.env` mein `ANTHROPIC_MODEL=claude-haiku-4-5-20251001`.
Booking wala hissa (naam, phone, waqt) Urdu, Roman Urdu aur English mein khud chalta hai.

## API
Public: GET /api/content, GET /api/testimonials, POST /api/appointments, /api/contact, /api/subscribe, /api/testimonials/submit, /api/chat, GET /api/health
Auth: POST /api/auth/login
Admin (Bearer token): /api/admin/{me, stats, settings, users, services, faqs, stages, pillars, qa, appointments, contacts, testimonials, subscribers, chatlog} with GET/POST/PUT/DELETE
Purane v4 routes (`x-admin-key` header) bhi chalte hain agar `.env` mein ADMIN_KEY set ho.

## Security notes
- `.env` kabhi share/commit na karein. Pehle wali `.env.example` mein asli MongoDB password tha, Atlas mein wo password badal dein.
- Production mein lamba random `JWT_SECRET` zaroor rakhein.
- Atlas > Network Access mein apna/ server ka IP allow karein, warna data save nahi hoga (server log mein `MongoDB connection FAILED` aayega).

## Mobile / tablet / laptop par test
- Laptop par: browser mein F12, phir `Ctrl+Shift+M` (device toolbar), iPhone/iPad/Android sizes chun kar dekhein.
- Asli phone par (same Wi-Fi): `cd client && npm run dev -- --host`, terminal mein jo `Network: http://192.168.x.x:5173` likha aaye wo phone ke browser mein kholein. Admin: us ke aage `/admin`.
- Website aur admin dono responsive hain. Phone par admin ki tables cards ban jati hain aur menu side se khulta hai.
