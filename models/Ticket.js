const Model = require("../config/core/model");

class Ticket extends Model {
    static options = {
        tableName: "tickets",
        allowedOrderBy: ["id", "created_at", "updated_at"]
    }

    static schema = {
        id: { required: false },
        title: { required: true },
        description: { required: false, default: null },
        status: { required: true, default: "new" },
        priority: { required: true, default: "medium" },
        requestor_id: { required: true },
        agent_id: { required: false, default: null },
    }
}

module.exports = Ticket;