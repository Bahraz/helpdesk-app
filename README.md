Sposób uruchomienia projektu:

Terminal 1

(ważne najpierw uruchomić kontener z bazą damnych)
docker-compose up

Terminal 2

npm i

(Upewnić się, że kontener bazy danych jest uruchomiony i działa w tle) - inicjacja bazy danych.
node init-db.js

npm run dev




Baza danych INFO:

Konto administratora (bazowe, tworzone przy inicjacji projektu) - brak rejestracji - konto tworzy tylko administrator systemu dla nowego użytkownika z hasłem jednorazowym. Hasło trzeba zmienić przy pierwszym zalogowaniu więc tabela user może mieć jakiś bool kolumna first_login? 

Tabela user
id, imię, nazwisko, email, hasło_zahashowane, numer_telefonu, dział, rola, first_login [true/false], is_active [true/false] (tylko admini obsługują tickety, brak widoków tworzenia dla adminów)

Tabela ticket
id, tytuł, opis, priorytet, status, przypisany_admin_id, twórca_id, czas_założenia, czas_aktualizacji

Tabela odpowiedzi
id, id_ticketa, id_autora, tresc, czas_odpowiedz