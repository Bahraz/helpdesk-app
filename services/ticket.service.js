const ticketRepository = require("../repositories/ticket.repository");
const { formatDate } = require("../utils/date.util.js");
const { notFoundError } = require("../helpers/error.helper.js");
const { priorityMap, statusMap } = require("../helpers/data.helper.js");

class TicketService {
    async getTickets(filters) {
        const tickets = await ticketRepository.getTickets(filters);
        
        return tickets.map(t => ({
            ...t,
            created_at: formatDate(t.created_at),
            priority: priorityMap[t.priority],
            status: statusMap[t.status]
        }));
    }

    async getTicketById(id) {
        const ticket = await ticketRepository.getTicketById(id);
        if (!ticket) notFoundError("Ticket not found");

        return {
            ...ticket,
            created_at: formatDate(ticket.created_at),
            priority: priorityMap[ticket.priority],
            status: statusMap[ticket.status]
        };
    }

    async createTicket(data) {
        const newTicket = await ticketRepository.createTicket(data);
        return newTicket;
    }
}

module.exports = new TicketService();