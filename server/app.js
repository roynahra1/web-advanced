require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json({ limit: "10000" }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://tubular-nasturtium-304615.netlify.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server requests
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

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

// ------------------ GET DOCTORS ------------------
// GET all doctors
app.get("/api/doctors", (req, res) => {
  db.query("SELECT * FROM doctors", (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows);
  });
});

// ADD doctor - with fake email and password
app.post("/api/doctors", (req, res) => {
  let { name, role } = req.body;
  console.log("Creating doctor with:", { name, role });
  
  if (!name || !role) return res.status(400).json({ message: "Name and role required" });

  // Prefix Dr. if missing
  if (!name.toLowerCase().startsWith("dr")) name = "Dr. " + name;

  // Generate fake email (lowercase, remove spaces and special chars)
  const cleanName = name
    .toLowerCase()
    .replace(/^dr\.?\s*/i, '') // Remove Dr. prefix
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
    .substring(0, 20); // Limit length
  
  const fakeEmail = `${cleanName}@hospital.com`;
  const fakePassword = "doctor123"; // Default password
  
  // Hash the fake password
  bcrypt.hash(fakePassword, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error("Password hashing error:", hashErr);
      return res.status(500).json({ message: "Server error" });
    }

    db.query(
      "INSERT INTO doctors (name, role, email, password) VALUES (?, ?, ?, ?)", 
      [name, role, fakeEmail, hashedPassword], 
      (err, result) => {
        if (err) {
          console.error("DB INSERT error:", {
            code: err.code,
            message: err.message,
            sqlMessage: err.sqlMessage
          });
          return res.status(500).json({ 
            message: "Database error",
            details: err.sqlMessage 
          });
        }

        console.log("Doctor created successfully:", {
          id: result.insertId,
          name: name,
          role: role,
          email: fakeEmail
        });
        
        // Return the newly created doctor object (without password)
        res.json({ 
          id: result.insertId, 
          name, 
          role,
          email: fakeEmail,
          message: "Doctor added successfully" 
        });
      }
    );
  });
});




// UPDATE doctor
app.put("/api/doctors", (req, res) => {
  const { doctorId, name, role } = req.body;
  if (!doctorId || !name || !role) return res.status(400).json({ message: "Doctor ID, name, role required" });

  let doctorName = name.trim();
  if (!doctorName.toLowerCase().startsWith("dr")) doctorName = "Dr. " + doctorName;

  db.query("UPDATE doctors SET name=?, role=? WHERE id=?", [doctorName, role, doctorId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Doctor not found" });

    res.json({ id: doctorId, name: doctorName, role }); // return updated doctor
  });
});

// DELETE doctor by ID (simple version)
app.delete("/api/doctors/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM doctors WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully", id });
  });
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

// ------------------ ADD APPOINTMENT ------------------
app.post("/api/appointments", (req, res) => {
  const { date, time, patient_name, doctor_id } = req.body;

  if (!date || !time || !patient_name || !doctor_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const cleanDate = date.split("T")[0];

  db.query(
    "INSERT INTO appointments (date,time,patient_name,doctor_id) VALUES (?,?,?,?)",
    [cleanDate, time, patient_name, doctor_id],
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      // Return the created appointment object with id
      res.json({
        id: result.insertId,
        date: cleanDate,
        time,
        patient_name,
        doctor_id
      });
    }
  );
});
// UPDATE APPOINTMENT
app.put("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { date, time, patient_name, doctor_id } = req.body;
  db.query(
    "UPDATE appointments SET date=?, time=?, patient_name=?, doctor_id=? WHERE id=?",
    [date.split("T")[0], time, patient_name, doctor_id, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Appointment not found" });
      res.json({ message: "Appointment updated successfully" });
    }
  );
});

// DELETE APPOINTMENT
app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM appointments WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  });
});

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
