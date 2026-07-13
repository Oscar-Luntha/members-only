const pool = require("../db/pool");

async function homepageGet(req, res, next) {
    try {
        const queryText = `
            SELECT messages.id, messages.title, messages.text, messages.created_at, clubhouses.name AS clubhouse_name
            FROM messages
            JOIN clubhouses ON messages.clubhouse_id = clubhouses.id
            ORDER BY RANDOM()
            LIMIT 20;
        `;
        
        const { rows: messages } = await pool.query(queryText);

        res.render("index", { 
            user: req.user, 
            messages: messages 
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    homepageGet
};