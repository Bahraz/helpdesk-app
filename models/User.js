const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  static async create(userData) {
    const {
      firstName,
      lastName,
      company,
      department,
      position,
      phone,
      email,
      password,
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
            INSERT INTO users 
            (first_name, last_name, company, department, position, phone, email, password) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const [result] = await db.execute(sql, [
      firstName,
      lastName,
      company,
      department,
      position || null,
      phone || null,
      email,
      hashedPassword,
    ]);

    return result.insertId;
  }

  static async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  }

  static async findById(id) {
    const sql = "SELECT * FROM users WHERE id = ?";
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
}

module.exports = User;
