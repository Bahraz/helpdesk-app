const ticketService = require("../services/ticket.service");
const commentService = require("../services/comment.service");

function getLoggedUser(req) {
  return req.session.user || null;
}


exports.getTicketDetails = async (req, res) => {
  const user = getLoggedUser(req);

  if (!user) {
    return res.redirect("/auth/login");
  }

  const ticket = await ticketService.getTicketById(req.params.id);
  const comments = await commentService.getCommentsByTicketId(req.params.id);

  console.log(comments, "Komentarze z bazy");
  const page = `pages/admin/ticket-detail`;

  res.render("index", {
    user,
    page,
    ticket,
    comments,
  });
};

exports.getTickets = async (req, res) => {
  const status = req.query.status;
  const user = getLoggedUser(req);

  if (!user) {
    return res.redirect("/auth/login");
  }

  const filter = {};
  if (status) filter.status = status;
  if (user.role === "requestor") filter.requestor_id = user.id;
  if (user.role === "admin" && status !== "new") filter.agent_id = user.id;

  const tickets = await ticketService.getTickets(filter);

  const componentName = user.role === "requestor" ? "list" : 
    status === "new" ? "tickets-pending" : 
    status === "in_progress" ? "tickets-active" : 
    "tickets-closed";
  const page = `pages/${user.role}/${componentName}`;

  res.render("index", {
    user,
    page,
    tickets,
  });
}

exports.getCreateTicketForm = (req, res) => {
  const user = getLoggedUser(req);

  if (!user) {
    return res.redirect("/auth/login");
  }

  res.render("index", {
    user,
    page: "pages/requestor/ticket-create",
  });
};

exports.postTicketReply = async (req, res) => {
  const user = getLoggedUser(req);

  if (!user) {
    return res.status(403).render("index", {
      user,
      page: "partials/error",
      message: "Brak dostępu.",
    });
  }

  const { action, comment } = req.body;
  const ticketId = req.params.id;

  if (user.role === "admin" && action === "close") {
    return res.render("index", {
      user,
      page: "pages/admin/ticket-close-success",
    });
  }

  const allowed =
    action === "reply" ||
    (user.role === "admin" && action === "close");

  if (!allowed) {
    return res.status(403).render("index", {
      user,
      page: "partials/error",
      message: "Brak dostępu do tej akcji.",
    });
  }

  await commentService.addComment({
    ticket_id: ticketId,
    user_id: user.id,
    comment,
  });

  return res.redirect(`/tickets/${ticketId}`);
};

exports.createTicket = async (req, res) => {
  try {
    const user = getLoggedUser(req);

    if (!user) {
      return res.status(403).render("index", {
        user,
        page: "partials/error",
        message: "Brak dostępu.",
      });
    }

    const { title, description, priority } = req.body;

    await ticketService.createTicket({
      title,
      description,
      priority,
      requestor_id: user.id,
    });

    return res.redirect("/tickets"); // ??
  } catch (error) {

    console.error(error);
    return res.status(500).render("index", {
      user: getLoggedUser(req),
      page: "partials/error",
      message: "Wystąpił błąd podczas tworzenia zgłoszenia.",
    });
  }

};
