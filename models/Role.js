const db = require("../config/database");

class Role {
  static async findAllActive() {
    const sql = `
      select id, name
      from roles
      where id in (1,3)
      order by sort_order, name
    `;

    const [rows] = await db.execute(sql);
    return rows;
  }
}

module.exports = Role;