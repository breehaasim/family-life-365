#!/bin/bash
# Mac / Linux: ./run.sh
cd "$(dirname "$0")"
[ -f server/.env ] || { cp server/.env.example server/.env; echo "server/.env ban gayi hai, isay edit karke dobara ./run.sh chalayein"; exit 1; }
(cd server && npm install && npm run dev) &
(cd client && npm install && npm run dev) &
wait
