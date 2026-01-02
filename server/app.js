require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(express.json({ limit: "10000" }));
app.use(cors());

// ======================
// DATABASE CONNECTION
// ======================

const db = mysql.createConnection({ 
  host: process.env.MYSQLHOST,
   user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
     database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
    
    });

db.connect((err) => {
  if (err) console.log("❌ Database connection failed:", err);
  else console.log("✅ Connected to MySQL database");
});

// ======================
// HELPERS
// ======================
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

// ======================
// USER ROUTES
// ======================

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName)
    return res.status(400).json({ message: "All data required" });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Invalid email format" });

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: "Hashing error" });

      const sql =
        "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
      db.query(sql, [firstName, lastName, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "User registered", userId: result.insertId });
      });
    });
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });
  });
});

// ======================
// DOCTOR ROUTES
// ======================

// GET ALL DOCTORS
app.get("/doctors", (req, res) => {
  db.query("SELECT * FROM doctors", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// ADD DOCTOR
app.post("/doctors", (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) return res.status(400).json({ message: "Name and role required" });

  let doctorName = name.trim();
  if (!doctorName.toLowerCase().startsWith("dr"))
    doctorName = "Dr. " + doctorName;

  db.query("INSERT INTO doctors (name, role) VALUES (?, ?)", [doctorName, role], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Doctor added", doctorId: result.insertId });
  });
});

// UPDATE DOCTOR
app.put("/doctors", (req, res) => {
  const { doctorId, name, role } = req.body;
  if (!doctorId || !name || !role)
    return res.status(400).json({ message: "Doctor ID, name, and role required" });

  let doctorName = name.trim();
  if (!doctorName.toLowerCase().startsWith("dr"))
    doctorName = "Dr. " + doctorName;

  db.query(
    "UPDATE doctors SET name = ?, role = ? WHERE id = ?",
    [doctorName, role, doctorId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Doctor not found" });
      res.json({ message: "Doctor updated successfully" });
    }
  );
});

// DELETE DOCTOR
app.delete("/doctors/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT id FROM appointments WHERE doctor_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length > 0)
      return res.status(400).json({ message: "Cannot delete doctor with appointments" });

    db.query("DELETE FROM doctors WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Doctor not found" });
      res.json({ message: "Doctor deleted successfully" });
    });
  });
});

// ======================
// APPOINTMENT ROUTES
// ======================

// GET ALL APPOINTMENTS
app.get("/appointments", (req, res) => {
  const sql = `
    SELECT 
      appointments.id,
      DATE_FORMAT(appointments.date, '%Y-%m-%d') AS date,
      appointments.time,
      appointments.patient_name,
      doctors.name AS doctor_name,
      doctors.role AS doctor_role,
      appointments.doctor_id
    FROM appointments
    JOIN doctors ON appointments.doctor_id = doctors.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// ADD APPOINTMENT
app.post("/appointments", (req, res) => {
  const { date, time, patient_name, doctor_id } = req.body;
  if (!date || !time || !patient_name || !doctor_id)
    return res.status(400).json({ message: "All fields are required" });

  const cleanDate = date.split("T")[0];

  db.query(
    "SELECT id FROM appointments WHERE date = ? AND time = ? AND doctor_id = ?",
    [cleanDate, time, doctor_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0)
        return res.status(400).json({ message: "Time slot already booked for this doctor" });

      db.query(
        "INSERT INTO appointments (date, time, patient_name, doctor_id) VALUES (?, ?, ?, ?)",
        [cleanDate, time, patient_name, doctor_id],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Database error" });
          res.json({ message: "Appointment added", appointmentId: result.insertId });
        }
      );
    }
  );
});

// UPDATE APPOINTMENT
app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { date, time, patient_name, doctor_id } = req.body;
  if (!date || !time || !patient_name || !doctor_id)
    return res.status(400).json({ message: "All fields are required" });

  const cleanDate = date.split("T")[0];

  db.query(
    "SELECT id FROM appointments WHERE date = ? AND time = ? AND doctor_id = ? AND id != ?",
    [cleanDate, time, doctor_id, id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0)
        return res.status(400).json({ message: "Time slot already booked for this doctor" });

      db.query(
        "UPDATE appointments SET date = ?, time = ?, patient_name = ?, doctor_id = ? WHERE id = ?",
        [cleanDate, time, patient_name, doctor_id, id],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Database error" });
          if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found" });
          res.json({ message: "Appointment updated successfully" });
        }
      );
    }
  );
});

// DELETE APPOINTMENT
app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM appointments WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));
