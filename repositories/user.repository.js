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
        const user = await User.findOne({ where: { email } }, "v_users");
        console.log("Znaleziony użytkownik:", user);
        return user || null;
    }

    async findAllWithDetails() {
        const users = await User.find(null, "v_users");
        return users || [];
    }

    async findById(id) {
        const user = await User.findOne({
            where: { id }
        }, "v_users");
        return user || null;
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