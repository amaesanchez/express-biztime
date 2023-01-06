const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testUserId;

beforeEach(async function () {
    await db.query("DELETE FROM companies");
    const companyResults = await db.query(
        `INSERT INTO companies (code, name, description)
         VALUES ('tacos', 'taco_launcher', 'for when you want a taco, but faster')
         RETURNING code`);
    const invoiceResults = await db.query(
        `INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date)
        VALUES ('1', 'tacos', '1000', 'False', 'timeStamp', 'timeStamp')
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
        expect(resp.body).toEqual({
            "companies": [{
                "code": "tacos",
                "name": "taco_launcher",
                "description": 'for when you want a taco, but faster'
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

test("POST /companies", async function () {
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

// test("POST / returns 400 if empty request body", async function () {
//     const resp = await request(app)
//         .post("/users")
//         .send();
//     expect(resp.statusCode).toEqual(400);
// });

// test("PATCH /users/:id", async function () {
//     const resp = await request(app)
//         .patch(`/users/${testUserId}`)
//         .send({ name: "Joel2", type: "dev2" });
//     expect(resp.body).toEqual({
//         user: {
//             id: expect.any(Number),
//             name: "Joel2",
//             type: "dev2",
//         },
//     });
//     const results = await db.query("SELECT COUNT(*) FROM users");
//     expect(results.rows[0].count).toEqual("1");
// });

// test("PATCH /users/:id returns 400 if empty request body", async function () {
//     const resp = await request(app)
//         .patch(`/users/${testUserId}`)
//         .send();
//     expect(resp.statusCode).toEqual(400);
// });

// test("DELETE /users/:id", async function () {
//     const resp = await request(app)
//         .delete(`/users/${testUserId}`);
//     expect(resp.body).toEqual({ message: "Deleted" });
//     const results = await db.query("SELECT COUNT(*) FROM users");
//     expect(results.rows[0].count).toEqual("0");
// });
