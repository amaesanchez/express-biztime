const request = require("supertest");
const app = require("../app");
const db = require("../db");


beforeEach(async function () {
    await db.query("DELETE FROM companies");
    const companyResults = await db.query(
        `INSERT INTO companies (code, name, description)
         VALUES ('tacos', 'taco_launcher', 'for when you want a taco, but faster')
         RETURNING code`);
    const invoiceResults = await db.query(
        `INSERT INTO invoices (id, comp_code, amt)
        VALUES ('1', 'tacos', '1000')
        RETURNING id`
    )
    companyCode = companyResults.rows[0].code;
    invoiceId = invoiceResults.rows[0].id
});

afterAll(async function () {
    await db.end();
});



describe("GET /companies", function () {

    test("Tests the get request for /companies", async function () {
        const resp = await request(app).get("/companies");
        console.log(resp.body);
        expect(resp.body).toEqual({
            "companies": [{
                "code": "tacos",
                "name": "taco_launcher"
            }]
        });
    });
});

describe("GET /companies/:code", function () {

    test("Tests the GET request for a specific company", async function () {
        const resp = await request(app).get("/companies/tacos");
        expect(resp.body).toEqual({
            "company": {
                "code": "tacos",
                "name": "taco_launcher",
                "description": "for when you want a taco, but faster",
                "invoices": [1]
            }
        })
    })
});

describe("POST /companies", function () {
    test("Adds new company to companies db", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({
                "code": "burrito",
                "name": "Burritos",
                "description": "Not as good as tacos, obviously"
            });
        expect(resp.body).toEqual({
            "company": {
                "code": "burrito",
                "name": "Burritos",
                "description": "Not as good as tacos, obviously",
            },
        });
        const results = await db.query("SELECT COUNT(*) FROM companies");
        expect(results.rows[0].count).toEqual("2");
    });
});

describe("PUT /companies/[code]", function() {
    test("Updates company given company code", async function () {
        const resp = await request(app)
            .put(`/companies/tacos`)
            .send({
                "name": "Crunchwrap",
                "description": "Best item on taco bell"
            });

        expect(resp.body).toEqual({
            "company": {
                "code": "tacos",
                "name": "Crunchwrap",
                "description": "Best item on taco bell"
            },
        });
    });
});

describe("DELETE /companies/:code", function() {
    test("Deletes single company from companies database", async function () {
        const resp = await request(app)
            .delete(`/companies/tacos`);
        expect(resp.body).toEqual({ message: "Deleted" });

        const results = await db.query("SELECT COUNT(*) FROM companies");
        expect(results.rows[0].count).toEqual("0");
    });
});
