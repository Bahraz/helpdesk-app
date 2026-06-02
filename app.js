require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const indexRoutes = require("./routes/indexRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "domyslny-tajny-klucz",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/", indexRoutes);

app.use((req, res) => {
  res
    .status(404)
    .render("partials/error", { message: "Strona nie znaleziona" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .render("partials/error", { message: "Błąd wewnętrzny serwera" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
