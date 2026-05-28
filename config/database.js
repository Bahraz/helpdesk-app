require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "helpdesk_user",
  password: process.env.DB_PASSWORD || "helpdesk_password",
  database: process.env.DB_NAME || "helpdesk_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
