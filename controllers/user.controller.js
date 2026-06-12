const Role = require("../models/role.model");
const Department = require("../models/department.model");
const {
    renderUserCreateForm,
    renderUserEditForm
} = require("../helpers/view.helper");
const userService = require("../services/user.service");
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();

        console.log("Pobrani użytkownicy:", users[0]);

        return res.render("index", {
            user: req.session.user,
            page: "pages/admin/users",
            users: users,
        });
    } catch (error) {
        console.error("Błąd pobierania użytkowników:", error);

        return res.status(500).render("index", {
            user: req.session.user,
            page: "partials/error",
            message: "Nie udało się pobrać listy użytkowników.",
        });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await userService.findById(req.session.user.id);
        return res.render("index", {
            user,
            page: "pages/requestor/profile",
        });
    } catch (error) {
        console.error("Błąd pobierania profilu użytkownika:", error);
        return res.status(500).render("index", {
            user: req.session.user,
            page: "partials/error",
            message: "Nie udało się pobrać profilu użytkownika.",
        });
    }
};

exports.getUserCreate = async (req, res) => {
    try {
        const roles = await Role.findAllActive();
        const departments = await Department.findAllActive();

        res.render("index", {
            user: req.session.user,
            page: "pages/admin/user-create",
            roles,
            departments,
            formData: {},
            error: null,
        });
    } catch (error) {
        console.error("Błąd pobierania danych do formularza użytkownika:", error);

        res.status(500).render("index", {
            user: req.session.user,
            page: "partials/error",
            message: "Nie udało się pobrać danych do formularza użytkownika.",
        });
    }
};

exports.getUserEdit = async (req, res) => {
    try {
        const editedUser = await userService.findById(req.params.id);

        await renderUserEditForm(req, res, 200, {
            editedUser,
            error: null,
        });
    }
    catch (error) {
        if (error.status === 404) {
            return res.status(404).render("index", {
                user: req.session.user,
                page: "partials/error",
                message: "Nie znaleziono użytkownika.",
            });
        }
        console.error("Błąd pobierania danych do edycji użytkownika:", error);

        res.status(500).render("index", {
            user: req.session.user,
            page: "partials/error",
            message: "Nie udało się pobrać danych użytkownika.",
        });
    }
};

exports.getUserResetPassword = async (req, res) => {
    try {
        const result = await userService.resetPassword(req.params.id);

        return res.render("index", {
            user: req.session.user,
            page: "pages/admin/user-reset-password",
            editedUser: result,
            temporaryPassword: result.temporaryPassword,
        });
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).render("index", {
                user: req.session.user,
                page: "partials/error",
                message: "Nie znaleziono użytkownika.",
            });
        }

        console.error("Błąd resetowania hasła:", error);

        return res.status(500).render("index", {
            user: req.session.user,
            page: "partials/error",
            message: "Nie udało się zresetować hasła użytkownika.",
        });
    }
};

exports.postUserCreate = async (req, res) => {
    try {
        const createdUser = await userService.createUser(req.body);

        return res.render("index", {
            user: req.session.user,
            page: "pages/admin/user-create-success",
            createdUser,
        });
    } catch (error) {
        console.error("Błąd tworzenia użytkownika:", error);

        return await renderUserCreateForm(req, res, 500, {
            formData: req.body,
            error: error.message || "Nie udało się utworzyć użytkownika.",
        });
    }
};

exports.postUserEdit = async (req, res) => {
    try {
        const userId = req.params.id;
        await userService.updateUser(userId, req.body);

        return res.redirect("/users");

    } catch (error) {
        console.error(error.message);

        return await renderUserEditForm(req, res, error.status || 500, {
            error: error.message || "Nie udało się edytować użytkownika.",
            page: error.status === 409 ? "pages/admin/user-edit" : "partials/error",
            editedUser: error.data || null,
            message: error.message || "Nie udało się pobrać danych do formularza edycji użytkownika.",
        });
    }
};

exports.postUserResetPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await userService.resetPassword(userId);

        return await renderUserEditForm(req, res, 200, {
            editedUser: result,
            page: "pages/admin/user-reset-password",
            temporaryPassword: result.temporaryPassword,
        });

    } catch (error) {
        if (error.status === 404) {
            return res.status(404).render("index", {
                user: req.session.user,
                page: "partials/error",
                message: "Nie znaleziono użytkownika.",
            });
        }

        console.error("Błąd resetowania hasła:", error);

        return res.status(500).render("index", {
            user: req.session.user,
            page: "partials/error",
            message: "Nie udało się zresetować hasła użytkownika.",
        });
    }
}

exports.putUserProfile = async (req, res) => {
    try {
        const user = req.session.user;
        const {
            firstName, 
            lastName, 
            email, 
            phone, 
            currentPassword, 
            newPassword, 
            confirmPassword } = req.body;

        if (currentPassword || newPassword || confirmPassword) {
            await userService.updateUserPassword(user.id, currentPassword, newPassword, confirmPassword);
        }

        const updatedUser = await userService.updateUser(user.id, { email, phone, firstName, lastName });

        console.log("Updated user", updatedUser);

        req.session.user.email = updatedUser.email;
        req.session.user.phone = updatedUser.phone;

        res.render("index", {
            user: updatedUser,
            page: "pages/requestor/profile",
            success: "Profil został pomyślnie zaktualizowany.",
        });
    } catch (error) {
        console.error("Błąd aktualizacji profilu użytkownika:", error);
        return res.status(error.status || 500).render("index", {
            user: req.session.user,
            page: "pages/requestor/profile",
            message: error.message || "Nie udało się zaktualizować profilu użytkownika.",
        });
    }
}