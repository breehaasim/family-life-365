@echo off
cd /d "%~dp0"
if not exist server\.env (
  copy server\.env.example server\.env >nul
  echo server\.env bani hai. Notepad khul raha hai: MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET likh kar Save karein.
  notepad server\.env
  pause
)
start "Family Life API" cmd /k "cd server && npm install && npm run dev"
start "Family Life Website" cmd /k "cd client && npm install && npm run dev"
echo Website: http://localhost:5173   Admin: http://localhost:5173/admin
timeout /t 20 >nul
start http://localhost:5173
start http://localhost:5173/admin
