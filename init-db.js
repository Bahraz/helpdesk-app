require("dotenv").config();
const db = require("./config/database");

async function initializeDB() {
  try {
    await db.execute("DROP TABLE IF EXISTS tickets");
    await db.execute("DROP TABLE IF EXISTS users");

    await db.execute(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                company VARCHAR(100) NOT NULL,
                department VARCHAR(50) NOT NULL,
                position VARCHAR(50),
                phone VARCHAR(20),
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    await db.execute(`
            CREATE TABLE tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                status ENUM('Nowe', 'W toku', 'Zakończone') DEFAULT 'Nowe',
                user_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

    console.log("Struktura bazy danych została zaktualizowana!");
    process.exit(0);
  } catch (error) {
    console.error("Błąd bazy danych:", error);
    process.exit(1);
  }
}

initializeDB();
