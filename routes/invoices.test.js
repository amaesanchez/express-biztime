// const request = require("supertest");
// const app = require("../app");
// const db = require("../db");

// let testUserId;

// beforeEach(async function () {
//     await db.query("DELETE FROM users");
//     const results = await db.query(
//         `INSERT INTO users (name, type)
//          VALUES ('Joel', 'dev')
//          RETURNING id`);
//     testUserId = results.rows[0].id;
// });

// afterAll(async function () {
//     await db.end();
// });

// test("/users", async function () {
//     const resp = await request(app).get("/users");
//     expect(resp.body).toEqual({
//         users: [{
//             id: expect.any(Number),
//             name: "Joel",
//             type: "dev",
//         }],
//     });
// });

// describe("/users/search", function () {

//     test("good search", async function () {
//         const resp = await request(app)
//             .get("/users/search")
//             .query({ type: "dev" });
//         expect(resp.body).toEqual({
//             users: [{
//                 id: expect.any(Number),
//                 name: "Joel",
//                 type: "dev",
//             }],
//         });
//     });

//     test("bad search", async function () {
//         const resp = await request(app)
//             .get("/users/search")
//             .query({ type: "nope" });
//         expect(resp.body).toEqual({
//             users: [],
//         });
//     });
// });

// describe("/users/good-search", function () {

//     test("good search", async function () {
//         const resp = await request(app)
//             .get("/users/good-search")
//             .query({ type: "dev" });
//         expect(resp.body).toEqual({
//             users: [{
//                 id: expect.any(Number),
//                 name: "Joel",
//                 type: "dev",
//             }],
//         });
//     });

//     test("bad search", async function () {
//         const resp = await request(app)
//             .get("/users/good-search")
//             .query({ type: "nope" });
//         expect(resp.body).toEqual({
//             users: [],
//         });
//     });
// });

// test("POST /", async function () {
//     const resp = await request(app)
//         .post("/users")
//         .send({ name: "Ann", type: "devops" });
//     expect(resp.body).toEqual({
//         user: {
//             id: expect.any(Number),
//             name: "Ann",
//             type: "devops",
//         },
//     });
//     const results = await db.query("SELECT COUNT(*) FROM users");
//     expect(results.rows[0].count).toEqual("2");
// });

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
