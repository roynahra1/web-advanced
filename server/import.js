const fs = require("fs");
const mysql = require("mysql2/promise");

const dbConfig = {
  host: "shinkansen.proxy.rlwy.net", // <-- public host from Railway
  user: "root",
  password: "qxtnRFRjuYyRkZMQdVPBiZSwusqRCbpO",
  database: "railway",
  port: 21692
};


async function importSQL() {
  try {
    const sql = fs.readFileSync("webadv.sql", "utf8");
    const queries = sql
      .split(";")
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const connection = await mysql.createConnection(dbConfig);

    for (const query of queries) {
      await connection.query(query);
    }

    console.log("SQL file imported successfully!");
    await connection.end();
  } catch (err) {
    console.error("Error importing SQL:", err);
  }
}

importSQL();
