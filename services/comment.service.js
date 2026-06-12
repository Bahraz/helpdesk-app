const commentRepository = require("../repositories/comment.repository");
const { formatDate } = require("../utils/date.util.js");
const { notFoundError } = require("../helpers/error.helper.js");
const ticketRepository = require("../repositories/ticket.repository");

class CommentService {
    async getCommentsByTicketId(ticketId) {
        const comments = await commentRepository.getCommentsByTicketId(ticketId);
        return comments.map(c => ({
            ...c,
            created_at: formatDate(c.created_at)
        }));
    }

    async addComment(commentData, user, action) {
        if(user.role === 'admin') {
            await ticketRepository.updateTicket(
                commentData.ticket_id,
                { 
                    status: action === 'close' ? 'resolved' : 'in_progress', 
                    agent_id: user.id 
                }
            )
        }
        
        return await commentRepository.addComment(commentData);
    }
}

module.exports = new CommentService();