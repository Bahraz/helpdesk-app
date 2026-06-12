const userRepository = require("../repositories/user.repository.js");
const { generateTemporaryPassword } = require("../helpers/password.helper.js");
const { notFoundError, conflictError } = require("../helpers/error.helper.js");
const bcrypt = require("bcrypt");
const { formatDate } = require("../utils/date.util.js");


class UserService {
    async createUser(data) {
        const existingUser = await userRepository.findByEmail(data.email);

        if (existingUser)
            conflictError("Użytkownik z takim adresem e-mail już istnieje.");
        

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        await userRepository.create({
            ...data,
            password: hashedPassword
        });

        return {
            ...data,
            temporaryPassword
        }
    }

    async updateUser(userId, data) {
        const user = await userRepository.findById(userId);

        if (!user)
            notFoundError("Nie można znaleźć użytkownika o podanym ID.");
        

        const existingUserWithEmail = await userRepository.findByEmail(data.email);

        if (existingUserWithEmail && 
            Number(existingUserWithEmail.id) !== Number(userId)) {
            conflictError("Użytkownik z takim adresem e-mail już istnieje.");
        }

        await userRepository.update(userId, data);

        return user;
    }

    async resetPassword(userId) {
        const user = await userRepository.findById(userId);

        if (!user) { 
            notFoundError("Nie można znaleźć użytkownika o podanym ID."); }

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
        await userRepository.resetPassword(userId, hashedPassword);

        return {
            ...user,
            temporaryPassword
        };
    }

    async findById(id) {
        const user = await userRepository.findById(id);
        if (!user) 
            notFoundError("Nie można znaleźć użytkownika o podanym ID.");
        
        return user;
    }

    async getUsers() {
        const users = await userRepository.findAllWithDetails();
        const formattedUsers = users.map(user => ({
            ...user,
            last_login_at: user.last_login_at ? formatDate(user.last_login_at) : null
        }));
        return formattedUsers;
    }

    async updateUserPassword(userId, currentPassword, newPassword, confirmPassword) {
        const user = await userRepository.findById(userId);
        if (!user) {
            notFoundError("Nie można znaleźć użytkownika o podanym ID.");
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            conflictError("Podane aktualne hasło jest nieprawidłowe.");
        }
        if (newPassword !== confirmPassword) {
            conflictError("Nowe hasło i potwierdzenie hasła nie są zgodne.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.resetPassword(userId, hashedPassword);
    }
}

module.exports = new UserService();