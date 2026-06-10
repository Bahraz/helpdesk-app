const Model = require("../config/core/model");

class Comment extends Model {
    static options = {
        tableName: "comments",
        allowedOrderBy: ["id", "created_at"]
    }

    static schema = {
        id: { required: false },
        ticket_id: { required: true },
        user_id: { required: true },
        comment: { required: true },
        created_at: { required: false }
    }
}

module.exports = Comment;