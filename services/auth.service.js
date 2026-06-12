const User = require("../models/user.model.js");
const userRepository = require("../repositories/user.repository.js");
const bcrypt = require("bcryptjs");
const { invalidCredentialsError, inactiveAccountError } = require("../helpers/error.helper.js");


class AuthService {
    async login(credentials) {
        const user = await userRepository.findByEmail(credentials.email);

        if (!user)
            invalidCredentialsError();

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid)
            invalidCredentialsError();

        if (!user.is_active)
            inactiveAccountError();

        await userRepository.update(user.id, { last_login_at: new Date() });

        return user;
    }
}

module.exports = new AuthService();
