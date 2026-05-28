require("dotenv").config();
const db = require("./config/database");

async function initializeDB() {
  try {
    console.log("Czyszczenie bazy...");
    
    await db.execute("DROP TABLE IF EXISTS comments");
    await db.execute("DROP TABLE IF EXISTS tickets");
    await db.execute("DROP TABLE IF EXISTS users");

    console.log("Tworzenie tabel...");

    await db.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NULL,
        department VARCHAR(100) NULL,
        role VARCHAR(50) NOT NULL,
        is_first_login TINYINT(1) NOT NULL DEFAULT 1,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NULL
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
    `);

    await db.execute(`
      CREATE TABLE tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'new',
        status VARCHAR(50) NOT NULL,
        agent_id INT NULL,
        requestor_id INT NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NULL,
        CONSTRAINT fk_user_as_agent_in_tickets FOREIGN KEY (agent_id) REFERENCES users(id),
        CONSTRAINT fk_user_as_requestor_in_tickets FOREIGN KEY (requestor_id) REFERENCES users(id)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
    `);

    await db.execute(`
      CREATE TABLE comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        \`comment\` TEXT NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CONSTRAINT fk_ticket_in_comments FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        CONSTRAINT fk_user_in_comments FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
    `);

    await db.execute("CREATE INDEX ix_tickets_requestor_id ON tickets(requestor_id);");
    await db.execute("CREATE INDEX ix_tickets_agent_id ON tickets(agent_id);");
    await db.execute("CREATE INDEX ix_comments_ticket_id ON comments(ticket_id);");
    await db.execute("CREATE INDEX ix_comments_user_id ON comments(user_id);");

    console.log("Dodawanie danych testowych...");

    await db.execute(`
      INSERT INTO users (name, surname, email, password_hash, role, is_first_login, department) VALUES
      ('Admin', 'Główny', 'admin@system.pl', 'dummy_hash_123', 'Admin', 0, 'IT'),
      ('Anna', 'Wsparcie', 'anna@system.pl', 'dummy_hash_123', 'Agent', 0, 'Helpdesk'),
      ('Jan', 'Kowalski', 'jan.kowalski@firma.pl', 'dummy_hash_123', 'Requestor', 1, 'Księgowość'),
      ('Marta', 'Nowak', 'marta.nowak@firma.pl', 'dummy_hash_123', 'Requestor', 1, 'HR'),
      ('Piotr', 'Zieliński', 'piotr.zielinski@firma.pl', 'dummy_hash_123', 'Requestor', 1, 'Magazyn'),
      ('Katarzyna', 'Wójcik', 'katarzyna.wojcik@firma.pl', 'dummy_hash_123', 'Requestor', 1, 'Zarząd');
    `);

    await db.execute(`
      INSERT INTO tickets (title, description, priority, status, agent_id, requestor_id) VALUES
      ('Problem z logowaniem do systemu ERP', 'Wywala błąd 500 przy próbie logowania.', 'high', 'new', NULL, 3),
      ('Brak tonera w drukarce', 'Drukarka na 2 piętrze woła o nowy toner.', 'medium', 'in_progress', 1, 4),
      ('Awaria głównego serwera!', 'Nikt nie ma dostępu do dysku sieciowego.', 'critical', 'resolved', 2, 5),
      ('Nowa myszka bezprzewodowa', 'Proszę o zamówienie nowej myszki, stara przerywa.', 'low', 'waiting_for_requestor', 1, 6),
      ('Aktualizacja oprogramowania', 'Czy planujecie wgrać nowy update w tym tygodniu?', 'low', 'new', NULL, 3),
      ('Zepsuty monitor na stanowisku', 'Ekran miga i gaśnie po kilku minutach pracy.', 'medium', 'in_progress', 2, 3),
      ('Dostęp do folderu HR', 'Proszę o nadanie uprawnień do folderu rekrutacji.', 'medium', 'closed', 1, 4),
      ('Brak internetu na hali', 'Od rana nie mamy dostępu do sieci na magazynie.', 'high', 'new', NULL, 5),
      ('Zmiana nazwiska w systemie', 'Wyszłam za mąż, proszę o aktualizację danych.', 'low', 'waiting_for_requestor', 2, 6),
      ('Klawiatura zalana kawą', 'Niestety wypadki się zdarzają... spacja nie działa.', 'low', 'resolved', 1, 3),
      ('Prośba o nowy telefon służbowy', 'Bateria w starym trzyma tylko godzinę.', 'low', 'new', NULL, 4),
      ('Konfiguracja VPN', 'Potrzebuję dostępu z domu na jutro.', 'medium', 'in_progress', 1, 5),
      ('Błąd przy generowaniu raportu', 'System zawiesza się przy generowaniu zestawienia.', 'high', 'in_progress', 2, 6),
      ('Klimatyzacja w serwerowni', 'Temperatura niebezpiecznie rośnie, alarm pika!', 'critical', 'resolved', 1, 5),
      ('Zablokowane konto domenowe', '3 razy wpisałem złe hasło i mnie zablokowało.', 'high', 'new', NULL, 3);
    `);

    await db.execute(`
      INSERT INTO comments (ticket_id, user_id, \`comment\`) VALUES
      (2, 4, 'Czy wiadomo, kiedy toner zostanie wymieniony? Mamy pilne dokumenty do druku.'),
      (2, 1, 'Jestem w drodze na 2 piętro, zaraz to załatwię.'),
      (3, 2, 'Serwer został zrestartowany. Problem był z zawieszonym procesem bazy danych. Zamykam zgłoszenie.'),
      (4, 1, 'Czy ma to być myszka na Bluetooth, czy ze zwykłym adapterem USB?'),
      (4, 6, 'Najlepiej na Bluetooth, mam mało portów w laptopie. Dzięki!'),
      (6, 2, 'Jaki to model monitora? Podejdę z zamiennikiem.'),
      (6, 3, 'To ten stary Dell 24 cale.'),
      (6, 2, 'Ok, zaraz będę.'),
      (7, 4, 'Proszę o szybkie załatwienie, mam dziś rozmowy rekrutacyjne.'),
      (7, 1, 'Uprawnienia nadane. Proszę przelogować się do systemu.'),
      (7, 4, 'Działa, dziękuję!'),
      (9, 2, 'Gratulacje! Proszę jednak o przesłanie skanu dokumentu z HR do weryfikacji.'),
      (10, 3, 'Tylko proszę nie mówić szefowi...'),
      (10, 1, 'Wydano nową klawiaturę z magazynu IT. Stara poszła do utylizacji. Bez obaw, tajemnica zawodowa ;)'),
      (12, 1, 'Instrukcja konfiguracji i certyfikaty wysłane na maila. Proszę dać znać, czy działa.'),
      (12, 5, 'Niestety przy próbie łączenia wyskakuje błąd 403.'),
      (13, 6, 'Pojawia się komunikat o braku pamięci (Out of memory).'),
      (13, 2, 'Sprawdzam logi serwera. Wygląda na zapętlone zapytanie do bazy, zabiję proces i zobaczymy.'),
      (14, 5, 'Ratunku, zaraz się ugotujemy!'),
      (14, 1, 'Zgłoszono do serwisu zewnętrznego, będą za 15 minut.'),
      (14, 1, 'Serwis naprawił wyciek chłodziwa. Temperatura wraca do normy. Dobrze, że szybko daliście znać.');
    `);

    console.log("Baza gotowa!");
    process.exit(0);
  } catch (error) {
    console.error("Błąd bazy danych:", error);
    process.exit(1);
  }
}

initializeDB();