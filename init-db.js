require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/database");

async function initializeDB() {
  try {
    console.log("Czyszczenie bazy...");

    await db.execute("SET FOREIGN_KEY_CHECKS = 0");
    await db.execute("DROP TABLE IF EXISTS comments");
    await db.execute("DROP TABLE IF EXISTS tickets");
    await db.execute("DROP TABLE IF EXISTS users");
    await db.execute("DROP TABLE IF EXISTS roles");
    await db.execute("DROP TABLE IF EXISTS departments");
    await db.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Tworzenie tabel...");

    await db.execute(`
      CREATE TABLE roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        sort_order INT NOT NULL DEFAULT 0
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
    `);

    await db.execute(`
      CREATE TABLE departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
    `);

    await db.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NULL,
        department_id INT NULL,
        role_id INT NOT NULL,
        is_first_login TINYINT(1) NOT NULL DEFAULT 1,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        last_login_at DATETIME NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id),
        CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments(id)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;
    `);

    await db.execute(`
      CREATE TABLE tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'medium',
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        agent_id INT NULL,
        requestor_id INT NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
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

    await db.execute(`
      create or replace view v_tickets as
        select
          t.id,
          t.title as ticket_title,
          t.description as ticket_description,
            t.status,
            t.priority,

          ur.id as requestor_id,
          ur.first_name as requestor_first_name,
          ur.last_name as requestor_last_name,
          ur.email as requestor_email,

          ua.id as agent_id,
          ua.first_name as agent_first_name,
          ua.last_name as agent_last_name,
          ua.email as agent_email,

          t.created_at,
          t.updated_at
        from tickets as t
        left join users as ur
          on t.requestor_id = ur.id
        left join users as ua
          on t.agent_id = ua.id
      `);

    await db.execute(`
      create or replace view v_comments as
      select
        c.id,
        c.ticket_id,
        c.user_id,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        r.name as role,
        u.email as user_email,
        c.comment,
        c.created_at
      from comments as c
      left join users as u
        on c.user_id = u.id
      left join roles as r
        on u.role_id = r.id;
      `);

    await db.execute(`
      create or replace view v_users as
      select
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      u.last_login_at,
      u.role_id,
      u.department_id,
      u.password_hash,
      u.is_active,
      r.name as role,
      d.name as department_name
      from users as u
      left join roles as r
        on u.role_id = r.id
      left join departments as d
        on u.department_id = d.id;
    `);

    await db.execute(
      "CREATE INDEX ix_tickets_requestor_id ON tickets(requestor_id);",
    );
    await db.execute("CREATE INDEX ix_tickets_agent_id ON tickets(agent_id);");
    await db.execute(
      "CREATE INDEX ix_comments_ticket_id ON comments(ticket_id);",
    );
    await db.execute("CREATE INDEX ix_comments_user_id ON comments(user_id);");

    console.log("Dodawanie danych testowych...");

    const salt = await bcrypt.genSalt(10);
    const defaultHash = await bcrypt.hash("password", salt);

    await db.execute(
      `INSERT INTO roles (id, name, sort_order) VALUES (1, 'Admin', 10), (2, 'Agent', 20), (3, 'Requestor', 30)`,
    );

    await db.execute(`
      INSERT INTO departments (id, name, is_active, sort_order) VALUES 
      (1, 'IT', 1, 10), (2, 'Helpdesk', 1, 20), (3, 'Księgowość', 1, 30), (4, 'HR', 1, 40), (5, 'Magazyn', 1, 50), (6, 'Zarząd', 1, 60)
    `);

    await db.execute(`
      INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_first_login, department_id, is_active) VALUES
      ('Admin', 'Główny', 'admin@system.pl', '${defaultHash}', 1, 0, 1, 1),
      ('User', 'Testowy', 'user@system.pl', '${defaultHash}', 3, 0, 2, 1),
      ('Jan', 'Kowalski', 'jan.kowalski@firma.pl', '${defaultHash}', 3, 1, 3, 1),
      ('Marta', 'Nowak', 'marta.nowak@firma.pl', '${defaultHash}', 3, 1, 4, 1),
      ('Piotr', 'Zieliński', 'piotr.zielinski@firma.pl', '${defaultHash}', 3, 1, 5, 1),
      ('Katarzyna', 'Wójcik', 'katarzyna.wojcik@firma.pl', '${defaultHash}', 3, 1, 6, 1);
    `);

    await db.execute(`
      INSERT INTO tickets (title, description, priority, status, agent_id, requestor_id) VALUES
      ('Problem z logowaniem do VPN', 'Nie mogę połączyć się z siecią firmową z domu. Wyrzuca błąd limitu czasu.', 'high', 'new', NULL, 2),
      ('Brak dostępu do folderu współdzielonego', 'Proszę o nadanie uprawnień do katalogu /Finanse dla nowego projektu.', 'medium', 'new', NULL, 3),
      ('Myszka komputerowa przestała działać', 'Myszka bezprzewodowa nie reaguje, wymiana baterii nie pomogła. Proszę o nową.', 'low', 'new', NULL, 4),
      ('Błąd 500 przy generowaniu raportu', 'Podczas próby pobrania raportu rocznego system zawiesza się i zwraca błąd 500.', 'high', 'new', NULL, 5),
      ('Konfiguracja skrzynki pocztowej na telefonie', 'Potrzebuję instrukcji lub pomocy przy ustawieniu maila służbowego na Androidzie.', 'low', 'new', NULL, 6),
      ('Wymiana tonera w drukarce na 2. piętrze', 'Kończy się czarny toner w drukarce departamentowej. Zaczynają pojawiać się smugi.', 'medium', 'new', NULL, 3),
      ('Nowy pracownik - założenie konta', 'Od poniedziałku dołącza do nas nowa osoba. Proszę o przygotowanie konta w systemie.', 'high', 'new', NULL, 4),
      ('Prośba o instalację oprogramowania Docker', 'Potrzebuję środowiska Docker do lokalnych testów aplikacji.', 'medium', 'new', NULL, 2),
      ('Niestabilne działanie Wi-Fi w sali konferencyjnej', 'Podczas spotkań często zrywa połączenie z siecią "Firma_Guest".', 'medium', 'new', NULL, 5),
      ('Aktualizacja danych w profilu pracownika', 'Proszę o zmianę mojego nazwiska w systemie kadrowym po ślubie.', 'low', 'new', NULL, 6),
      ('Reset hasła do systemu domenowego', 'Zapomniałem hasła po urlopie, proszę o wygenerowanie tymczasowego.', 'high', 'in_progress', 1, 3),
      ('Zakup licencji JetBrains', 'Prośba o przedłużenie licencji na środowisko programistyczne.', 'medium', 'in_progress', 1, 2),
      ('Monitor mruga podczas pracy', 'Główny monitor od stacji dokującej co kilka minut gaśnie na sekundę.', 'medium', 'new', 1, 5),
      ('Wniosek o dostęp do bazy PostgreSQL', 'Potrzebuję uprawnień do odczytu bazy produkcyjnej na potrzeby migracji.', 'high', 'in_progress', 1, 2),
      ('Komputer wolno działa (prawdopodobnie wirus)', 'System bardzo zwolnił, wyskakują dziwne powiadomienia w przeglądarce.', 'high', 'in_progress', 1, 4),
      ('Konfiguracja drugiego monitora', 'Otrzymałem dodatkowy monitor, ale system go nie wykrywa. Proszę o wsparcie.', 'low', 'resolved', 1, 6),
      ('Blokada konta po wpisaniu błędnego PINu', 'Konto zostało zablokowane po trzech nieudanych próbach logowania.', 'high', 'resolved', 1, 3),
      ('Przeniesienie stanowiska komputerowego', 'Prośba o przepięcie sprzętu (komputer, 2 monitory, telefon) do pokoju 204.', 'medium', 'new', 1, 4),
      ('Błąd synchronizacji kalendarza', 'Spotkania wpisane w Outlooku nie pojawiają się w aplikacji mobilnej.', 'low', 'in_progress', 1, 5),
      ('Zgłoszenie uszkodzenia kabla sieciowego', 'Zatrzask w kablu RJ45 przy moim biurku jest ułamany i kabel wypada z karty.', 'low', 'new', 1, 6);
    `);

    await db.execute(`
    INSERT INTO comments (ticket_id, user_id, \`comment\`) VALUES
    (11, 1, 'Cześć Jan, wygenerowałem nowe hasło tymczasowe: Start123!. Przy pierwszym logowaniu system wymusi jego zmianę.'),
    (11, 3, 'Dzięki, ale dostaję komunikat, że hasło nie spełnia wymogów złożoności. Możesz zerknąć?'),
    (11, 1, 'Mój błąd, zapomniałem o nowej polityce. Spróbuj teraz: BezpieczneHaslo2026!'),
    (11, 3, 'Teraz przeszło bez problemu. Wielkie dzięki za szybką pomoc, można zamykać.'),
    (12, 1, 'Wniosek o licencję został przekazany do działu zakupów. Czekam na akceptację budżetu.'),
    (12, 2, 'Jasne, daj znać jak tylko dostaniesz klucz, bo stara licencja wygasa mi pojutrze.'),
    (12, 1, 'Dyrektor podbił budżet. Przesłałem zamówienie do dystrybutora, klucze powinny być jutro rano.'),
    (13, 1, 'Piotr, czy sprawdzałeś inne gniazdo w stacji dokującej? Często to wina uszkodzonego kabla DisplayPort.'),
    (13, 5, 'Tak, przepiąłem do drugiego portu i dalej to samo. Podłączyłem też bezpośrednio do HDMI w laptopie i wtedy działa stabilnie.'),
    (13, 1, 'W takim razie winna jest sama stacja dokująca albo jej zasilacz. Podejdę do Ciebie po południu z nową stacją na podmianę.'),
    (14, 1, 'Do jakich konkretnie schematów potrzebujesz dostępu? Standardowo na prodzie dajemy tylko read-only do schematu public.'),
    (14, 2, 'Dokładnie tak, potrzebuję tylko odczytu (SELECT) do schematów "public" oraz "orders" na potrzeby weryfikacji danych przed migracją.'),
    (14, 1, 'Dostęp został nadany. Uprawnienia wygasną automatycznie za 14 dni.'),
    (15, 1, 'Marta, odłącz natychmiast komputer od sieci Wi-Fi i kablowej. Zaraz będę u Ciebie na stanowisku.'),
    (15, 4, 'Odłączyłam kabel. Komputer strasznie głośno chodzi (wentylatory) i co chwilę wyskakuje okienko z informacją o zablokowanych plikach!'),
    (15, 1, 'Wygląda na to, że system złapał ransomware. Zabezpieczam dysk, będziemy musieli postawić system od nowa z backupu z zeszłego tygodnia.'),
    (16, 1, 'Kasia, wejdź w Ustawienia Ekranu (prawy przycisk myszy na pulpicie) i kliknij przycisk "Wykryj". Zobacz czy coś się zmieni.'),
    (16, 6, 'Kliknęłam, ale system pisze, że nie znaleziono innego ekranu. Monitor jest włączony i świeci się pomarańczowa dioda.'),
    (16, 1, 'Ok, w takim razie problemem może być przejściówka z USB-C. Przyniosę inną i sprawdzimy.'),
    (16, 6, 'Super, nowa przejściówka zadziałała od razu! Wszystko super widać, dziękuję.'),
    (17, 1, 'Konto w Active Directory zostało odblokowane. Licznik nieudanych prób logowania wyczyszczony.'),
    (17, 3, 'Działa, zalogowałem się. Musiałem pomylić cyfry na klawiaturze numerycznej.'),
    (18, 4, 'Czy uda się to zrobić w ten piątek po godzinie 15:00? Chciałabym od poniedziałku zacząć już w nowym pokoju.'),
    (18, 1, 'Piątek po 15:00 mi pasuje. Przygotuj proszę wszystkie drobne rzeczy do kartonów, a ja zajmę się odpięciem i przeniesieniem elektroniki.'),
    (19, 1, 'Spróbuj usunąć konto służbowe z aplikacji mobilnej, zrestartować telefon i dodać je ponownie.'),
    (19, 5, 'Zrobiłem tak, ale teraz podczas konfiguracji dostaję błąd uwierzytelniania dwuskładnikowego (MFA).'),
    (19, 1, 'Muszę zresetować Twoją sesję mobilną w panelu admina. Daj mi 5 minut i spróbuj wygenerować kod ponownie.'),
    (20, 1, 'Cześć Kasia, zaciąłem dzisiaj nowy wtyk RJ45 na tym kablu przy Twoim biurku. Przetestowałem testerem, sygnał jest idealny.'),
    (20, 6, 'Potwierdzam, wtyczka już nie wypada i Internet działa o wiele szybciej. Dzięki!');
    `);

    console.log("Baza gotowa!");
    process.exit(0);
  } catch (error) {
    console.error("Błąd bazy danych:", error);
    process.exit(1);
  }
}

initializeDB();
