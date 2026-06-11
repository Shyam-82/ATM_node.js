const db = require("../models/db");

exports.deposit = (req, res) => {

    const amount = Number(req.body.amount);
    const userId = req.session.user.id;

    db.query(
        "UPDATE users SET balance = balance + ? WHERE id = ?",
        [amount, userId],
        (err) => {

            if (err) return res.send("Deposit Failed");

            db.query(
                "INSERT INTO transactions(user_id,type,amount) VALUES(?,?,?)",
                [userId, "Deposit", amount]
            );

            db.query(
                "SELECT * FROM users WHERE id=?",
                [userId],
                (err, result) => {

                    req.session.user = result[0];

                    res.redirect("/dashboard");
                }
            );
        }
    );
};

exports.withdraw = (req, res) => {

    const amount = Number(req.body.amount);
    const userId = req.session.user.id;

    db.query(
        "SELECT * FROM users WHERE id=?",
        [userId],
        (err, result) => {

            const user = result[0];

            if (user.balance < amount) {
                return res.send("Insufficient Balance");
            }

            db.query(
                "UPDATE users SET balance = balance - ? WHERE id=?",
                [amount, userId],
                (err) => {

                    if (err) return res.send("Withdraw Failed");

                    db.query(
                        "INSERT INTO transactions(user_id,type,amount) VALUES(?,?,?)",
                        [userId, "Withdraw", amount]
                    );

                    db.query(
                        "SELECT * FROM users WHERE id=?",
                        [userId],
                        (err, result) => {

                            req.session.user = result[0];

                            res.redirect("/dashboard");
                        }
                    );
                }
            );
        }
    );
};

exports.logout = (req, res) => {

    req.session.destroy(() => {
        res.redirect("/");
    });
};
exports.history = (req, res) => {

    if (!req.session.user) {
        return res.redirect("/");
    }

    const userId = req.session.user.id;

    db.query(
        "SELECT * FROM transactions WHERE user_id=? ORDER BY id DESC",
        [userId],
        (err, result) => {

            if (err) {
                return res.send("Error Loading History");
            }

            res.render("history", {
                transactions: result
            });
        }
    );
};