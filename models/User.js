const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  static async createByAdmin(userData) {
    const bcrypt = require("bcryptjs");

    const {
      firstName,
      lastName,
      email,
      phone,
      roleId,
      departmentId,
      password,
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 12);

    const sql = `
      insert into users
        (first_name, last_name, email, phone, role_id, department_id, password_hash, is_active)
      values
        (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.execute(sql, [
      firstName,
      lastName,
      email,
      phone || null,
      roleId,
      departmentId || null,
      hashedPassword,
    ]);

    return result.insertId;
  }

  static async updateByAdmin(userId, userData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      roleId,
      departmentId,
      isActive,
    } = userData;

    const sql = `
      update users
      set
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        role_id = ?,
        department_id = ?,
        is_active = ?
      where id = ?
    `;

    await db.execute(sql, [
      firstName,
      lastName,
      email,
      phone || null,
      roleId,
      departmentId || null,
      Number(isActive),
      userId,
    ]);
  }

  static async resetPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const sql = `
      update users
      set password_hash = ?
      where id = ?
    `;

    await db.execute(sql, [hashedPassword, userId]);

    return hashedPassword;
  }

  static async findAllWithDetails() {
    const sql = `
      select
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role_id,
        u.department_id,
        u.is_active,
        r.name as role_name,
        d.name as department_name
      from users u
      left join roles r on r.id = u.role_id
      left join departments d on d.id = u.department_id
      order by u.last_name, u.first_name
    `;

    const [rows] = await db.execute(sql);
    return rows;
  }

  static async findByEmail(email) {
    const sql = `
    select 
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.password_hash,
      u.role_id,
      u.department_id,
      u.is_active,
      u.last_login_at,

      r.name as role_name,

      d.name as department_name
    from users as u
    left join roles as r on u.role_id=r.id
    left join departments as d on u.department_id=d.id
    where email = ?
    limit 1`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const sql = "select * from users where id = ?";
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  static async findByIdWithDetails(id) {
    const sql = `
      select
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role_id,
        u.department_id,
        u.is_active,
        r.name as role_name,
        d.name as department_name
      from users u
      left join roles r on r.id = u.role_id
      left join departments d on d.id = u.department_id
      where u.id = ?
      limit 1
    `;

    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  static async updateLastLogin(userId) {
    const sql = `
      update users
      set last_login_at = current_timestamp(6)
      where id = ?
    `;

    await db.execute(sql, [userId]);
  }
}

module.exports = User;
