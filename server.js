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

// SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || "atm_secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

app.use("/", authRoutes);
app.use("/", atmRoutes);

// LOGIN PAGE
app.get("/", (req, res) => {
  res.render("login");
});

// PIN PAGE
app.get("/pin", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("pin");
});

// VERIFY PIN
app.post("/verify-pin", (req, res) => {
  const enteredPin = req.body.pin;

  if (enteredPin === req.session.user.pin) {
    req.session.isVerified = true;
    return res.redirect("/dashboard");
  }

  res.send("❌ Incorrect PIN");
});

// DASHBOARD (PROTECTED)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  if (!req.session.isVerified) return res.redirect("/pin");

  res.render("dashboard", {
    user: req.session.user,
  });
});

// DEPOSIT
app.get("/deposit", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  if (!req.session.isVerified) return res.redirect("/pin");

  res.render("deposit");
});

// WITHDRAW
app.get("/withdraw", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  if (!req.session.isVerified) return res.redirect("/pin");

  res.render("withdraw");
});

// TRANSFER
app.get("/transfer", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  if (!req.session.isVerified) return res.redirect("/pin");

  res.render("transfer");
});

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});