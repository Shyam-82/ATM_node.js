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
exports.transfer = (req, res) => {

    const senderId = req.session.user.id;
    const { accountNumber, amount } = req.body;

    const transferAmount = Number(amount);

    // Step 1: Find receiver
    db.query(
        "SELECT * FROM users WHERE account_no = ?",
        [accountNumber],
        (err, result) => {

            if (err) return res.send("Error finding receiver");

            if (result.length === 0) {
                return res.send("Receiver not found");
            }

            const receiver = result[0];

            // Step 2: Check sender balance
            db.query(
                "SELECT * FROM users WHERE id = ?",
                [senderId],
                (err, senderResult) => {

                    const sender = senderResult[0];

                    if (sender.balance < transferAmount) {
                        return res.send("Insufficient Balance");
                    }

                    // Step 3: Deduct from sender
                    db.query(
                        "UPDATE users SET balance = balance - ? WHERE id = ?",
                        [transferAmount, senderId]
                    );

                    // Step 4: Add to receiver
                    db.query(
                        "UPDATE users SET balance = balance + ? WHERE id = ?",
                        [transferAmount, receiver.id]
                    );

                    // Step 5: Insert transactions (both sides)
                    db.query(
                        "INSERT INTO transactions(user_id,type,amount) VALUES(?,?,?)",
                        [senderId, "Transfer Sent", transferAmount]
                    );

                    db.query(
                        "INSERT INTO transactions(user_id,type,amount) VALUES(?,?,?)",
                        [receiver.id, "Transfer Received", transferAmount]
                    );

                    // Step 6: Update session
                    db.query(
                        "SELECT * FROM users WHERE id = ?",
                        [senderId],
                        (err, updatedUser) => {

                            req.session.user = updatedUser[0];

                            res.redirect("/dashboard");
                        }
                    );
                }
            );
        }
    );
};