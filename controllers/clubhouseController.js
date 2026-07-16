const pool = require("../db/pool");
const { body, validationResult } = require("express-validator");

const validateClubhouse = [
    body("name")
        .trim()
        .notEmpty().withMessage("Clubhouse name is required.")
        .isLength({ min: 3, max: 50 }).withMessage("Clubhouse name must be between 3 and 50 characters.")
        .matches(/^[a-zA-Z0-9 -_]+$/).withMessage("Clubhouse name can only contain letters, numbers, spaces, hyphens, or underscores.")
        .custom(async (value) => {
            const { rows } = await pool.query("SELECT * FROM clubhouses WHERE name = $1", [value]);
            if (rows.length > 0) {
                throw new Error("A clubhouse with this name already exists.");
            }
            return true;
        }),
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required.")
        .isLength({ max: 200 }).withMessage("Description must be 200 characters or less."),
    body("is_public")
        .notEmpty().withMessage("Privacy status is required."),
    body("security_code")
        .custom((value, { req }) => {
            if (req.body.is_public === "false" && (!value || value.trim() === "")) {
                throw new Error("Private clubhouses require a security code.");
            }
            return true;
        })
];

function createClubhouseGet(req, res) {
    res.render("create-clubhouse", { errors: null, prevData: {} });
}

// 4. Explore all Clubhouses that user hasn't already joined
async function exploreClubhousesGet(req, res, next) {
    const userId = req.user.id;
    try {
        const queryText = `
            SELECT c.* FROM clubhouses c
            LEFT JOIN club_memberships cm ON c.id = cm.clubhouse_id AND cm.user_id = $1
            WHERE cm.id IS NULL;
        `;
        const { rows: clubs } = await pool.query(queryText, [userId]);
        res.render("explore-clubhouses", { clubs, error: null });
    } catch (err) {
        next(err);
    }
}

// 5. Join a Clubhouse logic
async function joinClubhousePost(req, res, next) {
    const userId = req.user.id;
    const { clubhouse_id, security_code } = req.body;

    try {
        // Fetch the clubhouse details
        const { rows } = await pool.query("SELECT * FROM clubhouses WHERE id = $1", [clubhouse_id]);
        const clubhouse = rows[0];

        if (!clubhouse) {
            return res.status(404).send("Clubhouse not found");
        }

        // If clubhouse is private, verify security code
        if (!clubhouse.is_public) {
            if (clubhouse.security_code !== security_code) {
                // Fetch clubs list again to re-render error state
                const { rows: clubs } = await pool.query(
                    "SELECT c.* FROM clubhouses c LEFT JOIN club_memberships cm ON c.id = cm.clubhouse_id AND cm.user_id = $1 WHERE cm.id IS NULL",
                    [userId]
                );
                return res.render("explore-clubhouses", { 
                    clubs, 
                    error: `Incorrect security code for c/${clubhouse.name}!` 
                });
            }
        }

        // Success - add the user to membership[cite: 9]
        await pool.query(
            "INSERT INTO club_memberships (user_id, clubhouse_id, is_admin) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
            [userId, clubhouse_id, false]
        );

        res.redirect("/dashboard");
    } catch (err) {
        next(err);
    }
}

async function createClubhousePost(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render("create-clubhouse", {
            errors: errors.array(),
            prevData: req.body
        });
    }

    // Start a transaction so both creation and membership succeed or fail together
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        
        const { name, description, is_public, security_code } = req.body;
        const creatorId = req.user.id;
        const isPublicBool = is_public === "true";
        const finalCode = isPublicBool ? null : security_code;

        // 1. Insert the Clubhouse
        const clubhouseInsert = `
            INSERT INTO clubhouses (name, description, created_by, is_public, security_code) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id;
        `;
        const { rows: clubRows } = await client.query(clubhouseInsert, [name, description, creatorId, isPublicBool, finalCode]);
        const clubhouseId = clubRows[0].id;

        // 2. Automatically join the creator as an Administrator[cite: 9]
        const membershipInsert = `
            INSERT INTO club_memberships (user_id, clubhouse_id, is_admin) 
            VALUES ($1, $2, $3);
        `;
        await client.query(membershipInsert, [creatorId, clubhouseId, true]);

        await client.query("COMMIT");
        res.redirect("/dashboard");
    } catch (err) {
        await client.query("ROLLBACK");
        return next(err);
    } finally {
        client.release();
    }
}
module.exports = {
    joinClubhousePost,
    createClubhouseGet,
    exploreClubhousesGet,
    createClubhousePost,
    validateClubhouse
}