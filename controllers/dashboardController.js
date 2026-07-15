const pool = require("../db/pool");

async function getDashboard(req, res, next) {
    const userId = req.user.id;

    try {
        // 1. Fetch ALL clubhouses created by this user
        const createdClubsQuery = `
            SELECT * FROM clubhouses 
            WHERE created_by = $1
            ORDER BY created_at DESC;
        `;
        const { rows: createdClubhouses } = await pool.query(createdClubsQuery, [userId]);

        // 2. Fetch ALL clubhouses the user has joined
        const joinedClubsQuery = `
            SELECT c.id, c.name, c.description 
            FROM clubhouses c
            JOIN club_memberships cm ON c.id = cm.clubhouse_id
            WHERE cm.user_id = $1;
        `;
        const { rows: joinedClubhouses } = await pool.query(joinedClubsQuery, [userId]);

        // 3. Fetch messages created by the user
        const userMessagesQuery = `
            SELECT m.id, m.title, m.text, m.created_at, c.name AS clubhouse_name
            FROM messages m
            JOIN clubhouses c ON m.clubhouse_id = c.id
            WHERE m.user_id = $1
            ORDER BY m.created_at DESC;
        `;
        const { rows: messages } = await pool.query(userMessagesQuery, [userId]);

        res.render("dashboard", {
            user: req.user,
            createdClubhouses, // Now an array of clubhouses
            joinedClubhouses,
            messages
        });

    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getDashboard
};