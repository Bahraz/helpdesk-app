const db = require("../config/database");

class Department {
  static async findAllActive() {
    const sql = `
      select id, name
      from departments
      where is_active = 1
      order by sort_order, name
    `;

    const [rows] = await db.execute(sql);
    return rows;
  }
}

module.exports = Department;