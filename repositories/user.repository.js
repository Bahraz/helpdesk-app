const User = require("../models/user1.js");


class UserRepository {
    async create(data) {
        const user = new User({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password_hash: data.password,
            phone: data.phone,
            department_id: data.departmentId,
            role_id: data.roleId
        });
        return await user.create();
    }

    async findByEmail(email) {
        const sql = `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.password_hash,
                u.role_id,
                u.department_id,
                u.is_active,
                u.last_login_at,
                r.name AS role_name,
                d.name AS department_name
            FROM users u
            LEFT JOIN roles r
                ON r.id = u.role_id
            LEFT JOIN departments d
                ON d.id = u.department_id
            WHERE u.email = ?
            LIMIT 1
        `;

        const rows = await User.query(sql, [email]);

        return rows[0] || null;
    }

    async findAllWithDetails() {
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

        const [rows] = await User.query(sql);
        return rows;
    }

    async findById(id) {
        return User.findOne({
            where: { id }
        });
    }

    async update(id, data) {
        return User.updateById(id, data);
    }

    async resetPassword(id, newHashedPassword) {
        return await User.updateById(id, { password_hash: newHashedPassword });
    }

    async findAll() {
        return await User.find();
    }
}

module.exports = new UserRepository();