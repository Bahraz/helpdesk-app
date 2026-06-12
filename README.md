## Sposób uruchomienia projektu:

Terminal 1

(ważne najpierw uruchomić kontener z bazą damnych)
docker-compose up

Terminal 2

npm i

(Upewnić się, że kontener bazy danych jest uruchomiony i działa w tle) - inicjacja bazy danych.
node init-db.js

npm run dev
