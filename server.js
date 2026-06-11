const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const db = require("./models/db");

const authRoutes = require("./routes/authRoutes");
const atmRoutes = require("./routes/atmRoutes");

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", authRoutes);
app.use("/", atmRoutes);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/dashboard", (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("dashboard", {
    user: req.session.user,
  });
});

app.get("/deposit", (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("deposit");
});

app.get("/withdraw", (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("withdraw");
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});