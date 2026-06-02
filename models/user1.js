const Model = require('../config/core/model.js');

class User extends Model {
    static options = {
        tableName: 'users',
        allowedOrderBy: ['id', 'first_name', 'last_name', 'email']
    }

    static schema = {
        id: { required: false },
        first_name: { required: true },
        last_name: { required: true },
        email: { required: true },
        password_hash: { required: true },
        phone: { required: false },
        department_id: { required: false },
        role_id: { required: true },
        is_first_login: { required: false, default: 1 },
        is_active: { required: false, default: 1 },
        last_login_at: { required: false },
        created_at: { required: false },
        updated_at: { required: false }
    }
}

module.exports = User;