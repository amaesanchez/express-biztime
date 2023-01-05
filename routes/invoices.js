/** Routes for invoices of biztime. */

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");
const router = express.Router();

//add order by in sql command
/* Returns list of invoices, like {invoices: [{id, comp_code}, ...]}**/
router.get("/", async function (req, res, next) {

    const results = await db.query(
        `SELECT id, comp_code
        FROM invoices
        ORDER BY id`
    );
    const invoices = results.rows;
    return res.json({ invoices })
})

/* Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}} **/
router.get("/:id", async function (req, res, next) {

    const invoiceId = req.params.id;
    const invoiceResults = await db.query(
        `SELECT id, amt, paid, add_date, paid_date
        FROM invoices
        WHERE id = $1`, [invoiceId]
    );

    const invoice = invoiceResults.rows[0];
    if (invoiceResults.length === 0) {
        throw new NotFoundError("Company not found.");
    }
    const companyResults = await db.query(
        `SELECT code, name, description 
        FROM invoices AS i 
        JOIN companies as c 
        ON c.code = i.comp_code 
        WHERE i.id = $1`, [invoiceId]
    )

    const company = companyResults.rows[0]
    invoice.company = company;

    return res.json({ invoice })
})

/* Adds a invoice.

Needs to be given JSON like: {code, name, description}

Returns obj of new invoice: {invoice: {code, name, description}} **/
router.post("/", async function (req, res, next) {
    console.log("*** making POST request, req.body:", req.body);
    if (req.body === undefined) throw new BadRequestError();
    const { code, name, description } = req.body;
    const result = await db.query(
        `INSERT INTO invoices (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
        [code, name, description],
    );
    const invoice = result.rows[0];
    return res.status(201).json({ invoice });
});

/** Edit existing invoice.

Should return 404 if invoice cannot be found.

Needs to be given JSON like: {name, description}

Returns update invoice object: {invoice: {code, name, description}} */
router.put("/:code", async function (req, res) {
    if (req.body === undefined) throw new BadRequestError();


    const { name, description } = req.body;
    const code = req.params.code;
    const result = await db.query(
        `UPDATE invoices
            SET name=$1,
                description=$2
            WHERE code=$3
            RETURNING code, name, description`,
        [name, description, code]
    );
    const invoice = result.rows[0]

    if (invoice.length === 0) {
        throw new NotFoundError("Company not found.");
    }

    return res.json({ invoice })
});


/** Deletes company.

Should return 404 if company cannot be found.

Returns {message: "Deleted"} */
router.delete("/:code", async function (req, res) {

    const result = await db.query(
        `DELETE FROM invoices WHERE code = $1
        RETURNING code, name, description`,
        [req.params.code],
    );

    if (result.rows.length === 0) {
        throw new NotFoundError("Company not found.");
    }

    return res.json({ message: "Deleted" });
});
// end


module.exports = router;
