const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "shinkansen.proxy.rlwy.net",
  user: "root",
  password: "qxtnRFRjuYyRkZMQdVPBiZSwusqRCbpO",
  database: "railway",
  port: 21692
});

db.connect(err => {
  if (err) {
    console.error("DB connection error:", err);
    return;
  }
  console.log("Connected to Railway MySQL!");
  
  // Check tables
  db.query("SHOW TABLES;", (err, results) => {
    if (err) console.error("Error showing tables:", err);
    else console.log("Tables in DB:", results);

    // Optional: check a specific table
    db.query("SELECT * FROM appointments LIMIT 5;", (err, rows) => {
  if (err) console.error("Error querying appointments:", err);
  else console.log("Sample data from appointments:", rows);

  db.end();
});

  });
});
