const Comment = require("../models/Comment.js");

class CommentRepository {
    async getCommentsByTicketId(ticketId) {
        const comments = await Comment.find(
            { where: { ticket_id: ticketId }, order: [["created_at", "ASC"]] },
            "v_comments"
        );
        return comments || [];
    }

    async addComment(commentData) {
        const comment = new Comment(commentData);
        return await comment.create();
    }
}

module.exports = new CommentRepository();