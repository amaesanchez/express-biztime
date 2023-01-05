/** Routes for companies of biztime. */

const express = require("express");
const db = require("../db");
const { BadRequestError } = require("../expressError");
const router = express.Router();

/* Returns list of companies, like {companies: [{code, name}, ...]}**/
router.get("/", async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name
        FROM companies`
    );
    const companies = results.rows;
    return res.json({ companies })
})

/* Return obj of company: {company: {code, name, description}}

If the company given cannot be found, this should return a 404 status response. **/
router.get("/:code", async function (req, res, next) {
    const code = req.params.code;
    const results = await db.query(
        `SELECT code, name, description
        FROM companies
        WHERE code = $1`, [code]
    );

    const company = results.rows;

    if (company.length === 0) {
        throw new BadRequestError();
    }
    return res.json({ company })
})

/* Adds a company.

Needs to be given JSON like: {code, name, description}

Returns obj of new company: {company: {code, name, description}} **/
router.post("/", async function (req, res, next) {
    console.log("*** making POST request, req.body:", req.body);
    if (req.body === undefined) throw new BadRequestError();
    const { code, name, description } = req.body;
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
        [code, name, description],
    );
    const company = result.rows[0];
    return res.status(201).json({ company });
});



// this version has security holes --- you could inject SQL
// because the input isn't sanitized!

/** Search by user type. */

router.get("/search",
    async function (req, res, next) {
        const type = req.query.type;

        const results = await db.query(
            `SELECT id, name, type
        FROM users
        WHERE type = '${type}'`);
        const users = results.rows;
        return res.json({ users });
    });
//end-search

// fixed version that uses parameterized query

// (Fixed) Search by user type. */

router.get("/good-search",
    async function (req, res, next) {
        const type = req.query.type;

        const results = await db.query(
            `SELECT id, name, type
               FROM users
               WHERE type = $1`, [type]);
        const users = results.rows;
        return res.json({ users });
    });


/** Create new user, return user */




/** Update user, returning user */

router.patch("/:id", async function (req, res, next) {
    if (req.body === undefined) throw new BadRequestError();
    const { name, type } = req.body;

    const result = await db.query(
        `UPDATE users
           SET name=$1,
               type=$2
           WHERE id = $3
           RETURNING id, name, type`,
        [name, type, req.params.id],
    );
    const user = result.rows[0];
    return res.json({ user });
});


/** Delete user, returning {message: "Deleted"} */

router.delete("/:id", async function (req, res, next) {
    await db.query(
        "DELETE FROM users WHERE id = $1",
        [req.params.id],
    );
    return res.json({ message: "Deleted" });
});
// end


module.exports = router;