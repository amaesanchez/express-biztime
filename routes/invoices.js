"use strict";
/** Routes for invoices of biztime. */

const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const router = express.Router();


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
    if (!invoice) {
        throw new NotFoundError(`Invoice id:${invoiceId} not found.`);
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

/* Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} **/
router.post("/", async function (req, res, next) {
    console.log("*** making POST request, req.body:", req.body);

    if (req.body === undefined) throw new BadRequestError();

    const { comp_code, amt } = req.body;
    const result = await db.query(
        `INSERT INTO invoices (comp_code, amt)
           VALUES ($1, $2)
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]
    );
    const invoice = result.rows[0];

    return res.status(201).json({ invoice });
});

/** Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.put("/:id", async function (req, res) {
    if (req.body === undefined) throw new BadRequestError();

    const { amt } = req.body;
    const invoiceId = req.params.id;
    const result = await db.query(
        `UPDATE invoices
            SET amt=$1
            WHERE id=$2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, invoiceId]
    );
    const invoice = result.rows[0]

    if (!invoice) {
        throw new NotFoundError(`Invoice id:${invoiceId} not found.`);
    }

    return res.json({ invoice })
});


/** Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: { message: "Deleted" } */
router.delete("/:id", async function (req, res) {
    const id = req.params.id;

    const result = await db.query(
        `DELETE FROM invoices
            WHERE id = $1
            RETURNING id, comp_code`,
        [id],
    );

    const deleted = result.rows[0];
    if (!deleted) {
        throw new NotFoundError("Nothing was deleted from database.");
    }

    return res.json({ message: "Deleted" });
});
// end


module.exports = router;
