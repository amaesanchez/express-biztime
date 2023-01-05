"use strict";

/** Routes for companies of biztime. */

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");
const router = express.Router();

//add order by in sql command
/* Returns list of companies, like {companies: [{code, name}, ...]}**/
router.get("/", async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name
        FROM companies`
    );
    const companies = results.rows;
    return res.json({ companies })
})

// /* Return obj of company: {company: {code, name, description}}

// If the company given cannot be found, this should return a 404 status response. **/
// router.get("/:code", async function (req, res, next) {
//     const code = req.params.code;
//     const results = await db.query(
//         `SELECT code, name, description
//         FROM companies
//         WHERE code = $1`, [code]
//     );

//     const company = results.rows;

//     // add code name
//     if (company.length === 0) {
//         throw new NotFoundError("Company not found.");
//     }
//     return res.json({ company })
// })

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

/** Edit existing company.

Should return 404 if company cannot be found.

Needs to be given JSON like: {name, description}

Returns update company object: {company: {code, name, description}} */
router.put("/:code", async function(req, res) {
    if (req.body === undefined) throw new BadRequestError();


    const { name, description } = req.body;
    const code = req.params.code;
    const result = await db.query(
        `UPDATE companies
            SET name=$1,
                description=$2
            WHERE code=$3
            RETURNING code, name, description`,
            [name, description, code]
    );
    const company = result.rows[0]

    if (company.length === 0) {
        throw new NotFoundError("Company not found.");
    }

    return res.json({ company })
});


/** Deletes company.

Should return 404 if company cannot be found.

Returns {message: "Deleted"} */
router.delete("/:code", async function (req, res) {

    const result = await db.query(
        `DELETE FROM companies WHERE code = $1
        RETURNING code, name, description`,
        [req.params.code],
    );

    if (result.rows.length === 0) {
        throw new NotFoundError("Company not found.");
    }

    return res.json({ message: "Deleted" });
});

/** Return obj of company: {company: {code, name, description,
 *  invoices: [id, ...]}}
 * If the company given cannot be found, this should return
 * a 404 status response. */
 router.get("/:code", async function (req, res) {

    const code = req.params.code;
    const companyResults = await db.query(
        `SELECT code, name, description
        FROM companies
        WHERE code = $1`, [code]
    );

    const company = companyResults.rows[0];
    if (companyResults.length === 0) {
        throw new NotFoundError(`Company code:${code} not found.`);
    }

    const invoiceResults = await db.query(
        `SELECT id
        FROM invoices AS i
        JOIN companies as c
        ON c.code = i.comp_code
        WHERE c.code = $1`, [code]
    );

    const invoicesIds = invoiceResults.rows.map(i => i.id);
    company.invoices = invoicesIds

    return res.json({ company })
})

// end


module.exports = router;
