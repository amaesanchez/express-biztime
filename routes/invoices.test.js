"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { ExpressError } = require("../expressError");

let invoiceId;

beforeEach(async function () {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    const companyResults = await db.query(
      `INSERT INTO companies (code, name, description)
       VALUES ('tacos', 'taco_launcher', 'for when you want a taco, but faster')
       RETURNING code`);
    const invoiceResults = await db.query(
        `INSERT INTO invoices (comp_code, amt)
        VALUES ('tacos', '1000')
        RETURNING id`
    )
    invoiceId = invoiceResults.rows[0].id;
});

afterAll(async function () {
    await db.end();
});


describe(`GET /invoices id`, function () {
  test("Tests the get request for /invoices", async function () {
    console.log(invoiceId);
      const resp = await request(app).get("/invoices");
      expect(resp.body).toEqual({
          "invoices": [{
              "id": invoiceId,
              "comp_code": "tacos"
          }]
      });
  });
});

describe("GET /invoices/:id", function () {
  test("Tests the GET request for a specific company", async function () {
      const resp = await request(app).get(`/invoices/${invoiceId}`);
      expect(resp.body).toEqual({
          "invoice": {
              "id": invoiceId,
              "amt": "1000.00",
              "paid": false,
              "add_date": expect.any(String),
              "paid_date": null,
              "company": {
                "code" : "tacos",
                "name" : "taco_launcher",
                "description" : "for when you want a taco, but faster"
              }
          }
      })
  })
});

describe("POST /invoices", function () {
  test("Adds new invoice to invoices db", async function () {
      const resp = await request(app)
          .post("/invoices")
          .send({
              "comp_code": "tacos",
              "amt": "30"
          });
      expect(resp.body).toEqual({
          "invoice": {
              "id": invoiceId + 1,
              "comp_code": "tacos",
              "amt": "30.00",
              "paid": false,
              "add_date": expect.any(String),
              "paid_date": null
          }
      });
      const results = await db.query("SELECT COUNT(*) FROM invoices");
      expect(results.rows[0].count).toEqual("2");
  });
});

describe("PUT /invoices/[id]", function() {
  test("Updates invoice given invoice id", async function () {
      const resp = await request(app)
          .put(`/invoices/${invoiceId}`)
          .send({
              "amt": "10.00"
          });

      expect(resp.body).toEqual({
          "invoice": {
              "id": invoiceId,
              "comp_code": "tacos",
              "amt": "10.00",
              "paid": false,
              "add_date": expect.any(String),
              "paid_date": null
          }
      });
  });
});

describe("DELETE /invoices/:id", function() {
  test("Deletes single invoice from invoices database", async function () {

      const resp = await request(app)
          .delete(`/invoices/${invoiceId}`);
      expect(resp.body).toEqual({ message: "Deleted" });

      const results = await db.query("SELECT COUNT(*) FROM invoices");
      expect(results.rows[0].count).toEqual("0");
  });
});
