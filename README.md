## Sposób uruchomienia projektu:

Terminal 1

(ważne najpierw uruchomić kontener z bazą damnych)
docker-compose up

Terminal 2

npm i

(Upewnić się, że kontener bazy danych jest uruchomiony i działa w tle) - inicjacja bazy danych.
node init-db.js

npm run dev


## TODO (na backendzie)

- Logowanie z (`POST /auth/login`): Weryfikacja e-maila i hasła (bcrypt). Ustawienie `req.session.user`.
- Wymuszenie zmiany hasła: Sprawdzanie flagi `is_first_login` w tabeli `users`. Jeśli `true`, zablokować dostęp do systemu i przekierować na widok zmiany hasła (w trakcie jeszcze nie ma tego widoku)
- Wylogowanie (`GET /logout`): Niszczenie sesji i renderowanie `auth/logout-success`.
- Middleware ochrony tras: Utworzenie middleware sprawdzającego czy user jest zalogowany (`isAuth`) oraz czy ma odpowiednią rolę (`isAdmin`).

- Profil Admina (`GET /users`): Pobieranie danych zalogowanego użytkownika oraz pobranie listy wszystkich pracowników z bazy do tabeli.
- Edycja własnego profilu (`POST /user/update`): Aktualizacja imienia, nazwiska oraz reset hasła jako opcja.
- Tworzenie konta pracownika (`POST /admin/user/new`): Zapis do bazy, ustawienie `is_first_login = 1` oraz wygenerowanie losowego, tymczasowego hasła. Przekazanie go do widoku `user-create-success`.
- Edycja pracownika (`POST /admin/user/edit`): Aktualizacja działu, roli oraz statusu `is_active` w bazie.
- Resetowanie hasła (`GET/POST /admin/users/reset-password`): Wygenerowanie nowego hasła tymczasowego dla wybranego pracownika, aktualizacja bazy, zmiana `is_first_login` na `1` i renderowanie `user-reset-password`.

- Oczekujące (`GET /tickets/pending`): Pobranie z bazy zgłoszeń z przypisanym statusem nowym (`agent_id IS NULL` lub status 'new').
- Twoje aktywne (`GET /tickets/active`): Pobranie zgłoszeń przypisanych do zalogowanego admina (`agent_id = req.session.user.id` oraz status w toku).
- Zamknięte (`GET /tickets/closed`): Pobranie archiwum zgłoszeń (`status = 'closed'` lub `resolved`).
- Szczegóły zgłoszenia (`GET /tickets/detail/:id`):
  - Pobranie ticketu o danym ID oraz informacji o autorze (`requestor_id`).
  - Pobranie wszystkich komentarzy do tego ticketu z tabeli `comments` wraz z ich autorami.
- Odpowiadanie / Zamykanie (`POST /tickets/:id/reply`):
  - Odczytanie `req.body.action`.
  - Jeśli `reply`: Zapis nowego komentarza do tabeli `comments`. (Automatyczne przypisanie `agent_id` do admina, jeśli to pierwsza odpowiedź).
  - Jeśli `close`: Zmiana statusu ticketa na `closed` lub `resolved` w tabeli `tickets`.






## Baza danych INFO:

Konto administratora (bazowe, tworzone przy inicjacji projektu) - brak rejestracji - konto tworzy tylko administrator systemu dla nowego użytkownika z hasłem jednorazowym. Hasło trzeba zmienić przy pierwszym zalogowaniu więc tabela user może mieć jakiś bool kolumna first_login?

Tabela user
id, imię, nazwisko, email, hasło_zahashowane, numer_telefonu, dział, rola, first_login [true/false], is_active [true/false] (tylko admini obsługują tickety, brak widoków tworzenia dla adminów)

Tabela ticket
id, tytuł, opis, priorytet, status, przypisany_admin_id, twórca_id, czas_założenia, czas_aktualizacji

Tabela odpowiedzi
id, id_ticketa, id_autora, tresc, czas_odpowiedz


