const db = require("../models/db");

exports.login = (req, res) => {
    const { account_no, pin } = req.body;

    const sql = "SELECT * FROM users WHERE account_no = ? AND pin = ?";

    db.query(sql, [account_no, pin], (err, result) => {
        if (err) {
            return res.send("Database Error");
        }

        if (result.length > 0) {
            req.session.user = result[0];
            res.redirect("/dashboard");
        } else {
            res.send("Invalid Account Number or PIN");
        }
    });
};