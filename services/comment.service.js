const commentRepository = require("../repositories/comment.repository");
const { formatDate } = require("../utils/date.util.js");
const { notFoundError } = require("../helpers/error.helper.js");

class CommentService {
    async getCommentsByTicketId(ticketId) {
        const comments = await commentRepository.getCommentsByTicketId(ticketId);
        return comments.map(c => ({
            ...c,
            created_at: formatDate(c.created_at)
        }));
    }

    async addComment(commentData) {
        return await commentRepository.addComment(commentData);
    }
}

module.exports = new CommentService();