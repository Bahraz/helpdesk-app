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
        return await User.findOne({ where: { email } });
    }

    async findById(id) {
        return User.findOne({
            where: { id }
        });
    }

    async update(id, data) {
        return User.updateById(id, {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            department_id: data.departmentId,
            role_id: data.roleId,
            is_active: data.isActive
        });
    }

    async resetPassword(id, newHashedPassword) {
        return await User.updateById(id, { password_hash: newHashedPassword });
    }

    async findAll() {
        return await User.find();
    }
}

module.exports = new UserRepository();