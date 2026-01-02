const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3001",
    "https://tubular-nasturtium-304615.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.options("*", cors()); // respond to OPTIONS requests for all routes


/* ======================
   DATABASE
====================== */
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

/* ======================
   HELPERS
====================== */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ======================
   ROUTES (WITH /api)
====================== */

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName)
    return res.status(400).json({ message: "All data required" });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Invalid email" });

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
    if (rows?.length) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (first_name,last_name,email,password) VALUES (?,?,?,?)",
      [firstName, lastName, email, hashed],
      () => res.json({ message: "User registered" })
    );
  });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (!rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login success",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  });
});

// DOCTORS
app.get("/api/doctors", (req, res) => {
  db.query("SELECT * FROM doctors", (err, rows) => res.json(rows));
});

app.post("/api/doctors", (req, res) => {
  const name = req.body.name.startsWith("Dr") ? req.body.name : `Dr. ${req.body.name}`;
  db.query(
    "INSERT INTO doctors (name, role) VALUES (?,?)",
    [name, req.body.role],
    () => res.json({ message: "Doctor added" })
  );
});

// APPOINTMENTS
app.get("/api/appointments", (req, res) => {
  db.query(
    `SELECT a.*, d.name AS doctor_name, d.role AS doctor_role
     FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id`,
    (err, rows) => res.json(rows)
  );
});

app.post("/api/appointments", (req, res) => {
  const { date, time, patient_name, doctor_id } = req.body;
  db.query(
    "INSERT INTO appointments (date,time,patient_name,doctor_id) VALUES (?,?,?,?)",
    [date.split("T")[0], time, patient_name, doctor_id],
    () => res.json({ message: "Appointment added" })
  );
});

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
