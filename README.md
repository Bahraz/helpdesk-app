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

- jak sie kafelki ticketow wyswietlaja to u mnie nie widze tytułów i opisów (ale to widze ze w ticket-card trzeba chyba zmienic z ticket.title na ticket.ticket_title i ticket.description na ticket.ticket_description - zostawiam jak jest bo nie wiem czy Ci nie namieszam)

- jak jest priorytet low/medium/high to żeby do widoku było przesyłane "Niski", "Średni", "Wysoki" bo interfejs mamy po polsku,
- tak samo status new,in_progress,resolved to "Nowy", "W trakcie", "Rozwiązany"

- user jak dodaje ticket to ma go tworzyć jako new ale nie przypisywać agenta od razu tylku dawać null 
- dopiero ten admin ktory odpowie pierwszy to go tam przypisze do agent_id i zmieni status na in_progress (sprawdzić to bo miałem wrażenie, że od razu mi admina przypisało)

- jak admin doda treść i kliknie zamknij to komentarz się nie dodaje, a ticket sie nie zamyka (mimo, że jest komunikat o poprawnym zamknięciu) to po odświeżeniu strony nic się nie zmienia -> powinno dodać odpowiedź i wskoczyc status resolved

- w archiwum zgłoszeń powinny wyświetlać sie wszystkie archwialne zgłoszenia tj "resolved", nie wyświetla się nic


- dashboard admina może wyświetlać w sumie sekcje (nowe) co robi poprawnie oraz jednocześnie przypisane (czego poprawnie teraz nie robi bo zwraca też te tickety, w których nie udzieli odpowiedzi)

- oczekujace dziala poprawnie (wyswietla tylko te ktore nie maja odpowiedzi czyli status 'new')

- przyjete dziala poprawnie (wyswietla te ktore sa przpisane do agenta)

- przestał działać panel "użytkownicy" przez co nie da się ich przeglądać/dodawać/resetować haseł etc jest błąd serwera przy próbe wejścia