/** Database setup for BizTime. */

const { Client } = require("pg");

// const DB_URI = process.env.NODE_ENV === "test"
//     ? "postgresql:///biztime_test"
//     : "postgresql:///biztime";


/* Sad WSL life **/
const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql://meyburdj:meyburdj@localhost/biztime_test"
    : "postgresql://meyburdj:meyburdj@localhost/biztime";

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;
