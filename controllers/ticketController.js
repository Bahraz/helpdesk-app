exports.getIndex = (req, res) => {
  res.render("index", {
    user: {
      role: "admin",
      name: req.session.userName || "Admin IT",
    },
  });
};

exports.getTicketDetail = (req, res) => {
  const user = getLoggedUser(req);

  const page =
    user.role === "admin"
      ? "pages/admin/ticket-detail"
      : "pages/user/ticket-detail";

  res.render("index", {
    user,
    page,
  });
};

exports.postTicketReply = (req, res) => {
  const user = getLoggedUser(req);
  const action = req.body.action;

  if (user.role === "requestor") {
    // Requestor może tylko odpowiedzieć, nie zamknąć ticketa jako admin.
    if (action !== "reply") {
      return res.status(403).render("index", {
        user,
        page: "partials/error",
        message: "Brak dostępu do tej akcji.",
      });
    }

    // tutaj później zapis komentarza do comments
    return res.redirect("/tickets/detail");
  }

  if (user.role === "admin") {
    if (action === "close") {
      return res.render("index", {
        user,
        page: "pages/admin/ticket-close-success",
      });
    }

    // tutaj później zapis komentarza admina
    return res.redirect("/tickets/detail");
  }

  return res.status(403).render("index", {
    user,
    page: "partials/error",
    message: "Brak dostępu.",
  });
};

exports.getPending = (req, res) => {
  // Tutaj docelowo będzie np.: const tickets = await Ticket.find({ status: 'Nowe' });
  const mockTickets = [
    {
      id: 101,
      tytul: "Brak dostępu do serwera plików",
      opis: "Po aktualizacji systemu Windows nie mogę połączyć się z dyskiem Z.",
      priorytet: "Wysoki",
      tworca_nazwa: "Anna Kowalska",
      czas_zalozenia: "09:15, Dziś",
    },
    {
      id: 102,
      tytul: "Wymiana tonera w drukarce",
      opis: "Drukarka na 2 piętrze zgłasza niski poziom czarnego tonera.",
      priorytet: "Niski",
      tworca_nazwa: "Piotr Nowak",
      czas_zalozenia: "08:30, Dziś",
    },
    {
      id: 100,
      tytul: "Niedziałający monitor",
      opis: "Brak zasilania w jednym z monitorów co utrudnia i spowalnia pracę.",
      priorytet: "Średni",
      tworca_nazwa: "Kamil Wiśniewski",
      czas_zalozenia: "Wczoraj",
    },
  ];

  res.render("index", {
    user: { role: "admin", name: "Admin IT" },
    page: "pages/admin/tickets-pending",
    tickets: mockTickets,
  });
};
