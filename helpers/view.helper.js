const Role = require("../models/role");
const Department = require("../models/department");

async function renderUserCreateForm(res, req, status = 200, options = {}) {
    const roles = await Role.findAllActive();
    const departments = await Department.findAllActive();

    return res.status(status).render("index", {
        user: req.session.user,
        page: "pages/admin/user-create",
        roles,
        departments,
        ...options,
    });
}

async function renderUserEditForm(
    req,
    res,
    status = 200,
    {
        editedUser,
        error = null,
    }
) {
    const [roles, departments] = await Promise.all([
        Role.findAllActive(),
        Department.findAllActive()
    ]);

    return res.status(status).render("index", {
        user: req.session.user,
        page: "pages/admin/user-edit",
        editedUser,
        roles,
        departments,
        error
    });
}

exports.renderUserCreateForm = renderUserCreateForm;
exports.renderUserEditForm = renderUserEditForm;