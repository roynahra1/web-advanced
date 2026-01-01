const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();

app.use(express.json({ limit: "10000" }));
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});



function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName)
    return res.status(400).json({ message: "All Data Required" });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Wrong Email Format" });

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length > 0)
      return res
        .status(400)
        .json({ exists: true, message: "Email already exists" });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: "Hashing error" });

      const sql =
        "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
      db.query(
        sql,
        [firstName, lastName, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Database error" });
          res.json({
            message: "User added successfully",
            userId: result.insertId,
          });
        }
      );
    });
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ message: "Invalid Email or Password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid Email or Password" });

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

// UPDATE APPOINTMENT
app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { date, time, patient_name, doctor_id } = req.body;
  
  if (!date || !time || !patient_name || !doctor_id)
    return res.status(400).json({ message: "All fields are required" });

  const cleanDate = date.split('T')[0];

  const checkSql = `
    SELECT id FROM appointments 
    WHERE date = ? AND time = ? AND doctor_id = ? AND id != ?
  `;
  
  db.query(checkSql, [cleanDate, time, doctor_id, id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    
    if (results.length > 0) {
      return res.status(400).json({ 
        message: "Time slot already booked for this doctor" 
      });
    }

    const updateSql = "UPDATE appointments SET date = ?, time = ?, patient_name = ?, doctor_id = ? WHERE id = ?";
    db.query(updateSql, [cleanDate, time, patient_name, doctor_id, id], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Appointment not found" });
      res.json({ message: "Appointment updated successfully" });
    });
  });
});

// ADD DOCTOR
app.post("/doctors", (req, res) => {
  const { name, role } = req.body;
  if (!name || !role)
    return res.status(400).json({ message: "Name and role are required" });

  // Format name: add Dr. if not already there
  let doctorName = name.trim();
  if (!doctorName.toLowerCase().startsWith("dr") && !doctorName.toLowerCase().startsWith("dr.")) {
    doctorName = "Dr. " + doctorName;
  }

  const sql = "INSERT INTO doctors (name, role) VALUES (?, ?)";
  db.query(sql, [doctorName, role], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({
      message: "Doctor added successfully",
      doctorId: result.insertId,
    });
  });
});

// GET DOCTORS
app.get("/doctors", (req, res) => {
  db.query("SELECT * FROM doctors", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// DELETE DOCTOR (with appointment check)
app.delete("/doctors/:id", (req, res) => {
  const { id } = req.params;
  
  const checkSql = "SELECT id FROM appointments WHERE doctor_id = ?";
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    
    if (results.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete doctor with existing appointments" 
      });
    }
    
    const deleteSql = "DELETE FROM doctors WHERE id = ?";
    db.query(deleteSql, [id], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Doctor not found" });
      res.json({ message: "Doctor deleted successfully" });
    });
  });
});

// UPDATE DOCTOR
app.put("/doctors", (req, res) => {
  const { doctorId, name, role } = req.body;
  
  if (!doctorId || !name || !role)
    return res.status(400).json({ message: "Doctor ID, name and role are required" });

  // Format name: add Dr. if not already there
  let doctorName = name.trim();
  if (!doctorName.toLowerCase().startsWith("dr") && !doctorName.toLowerCase().startsWith("dr.")) {
    doctorName = "Dr. " + doctorName;
  }

  const sql = "UPDATE doctors SET name = ?, role = ? WHERE id = ?";
  db.query(sql, [doctorName, role, doctorId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor updated successfully" });
  });
});

// ADD APPOINTMENT
app.post("/appointments", (req, res) => {
  const { date, time, patient_name, doctor_id } = req.body;
  if (!date || !time || !patient_name || !doctor_id)
    return res.status(400).json({ message: "All fields are required" });

  const cleanDate = date.split('T')[0];

  const checkSql = `
    SELECT id FROM appointments 
    WHERE date = ? AND time = ? AND doctor_id = ?
  `;
  
  db.query(checkSql, [cleanDate, time, doctor_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    
    if (results.length > 0) {
      return res.status(400).json({ 
        message: "Time slot already booked for this doctor" 
      });
    }

    const insertSql = "INSERT INTO appointments (date, time, patient_name, doctor_id) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [cleanDate, time, patient_name, doctor_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({
        message: "Appointment added successfully",
        appointmentId: result.insertId,
      });
    });
  });
});

// GET APPOINTMENTS
app.get("/appointments", (req, res) => {
  const sql = `
    SELECT 
      appointments.id,
      DATE_FORMAT(appointments.date, '%Y-%m-%d') as date,
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

// DELETE APPOINTMENT
app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM appointments WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  });
});

// START SERVER
db.connect((err) => {
  if (err) console.log("Database connection failed:", err);
  else console.log("Connected to MySQL database");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
