import React, { useState, useEffect } from "react";
import api from "../api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [patient, setPatient] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctorId, setDoctorId] = useState("");

  const [editId, setEditId] = useState(null);
  const [editPatient, setEditPatient] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDoctorId, setEditDoctorId] = useState("");

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterDate, filterDoctor]);

  const loadData = async () => {
    try {
      const apps = await api.get("/appointments");
      const docs = await api.get("/doctors");
      setAppointments(apps);
      setDoctors(docs);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments");
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (a) =>
          a.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.doctor_role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter((a) => a.date.startsWith(filterDate));
    }

    if (filterDoctor !== "All") {
      filtered = filtered.filter(
        (a) => a.doctor_id.toString() === filterDoctor
      );
    }

    setFilteredAppointments(filtered);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditId(null);
    setPatient("");
    setDate("");
    setTime("");
    setDoctorId("");
    setEditPatient("");
    setEditDate("");
    setEditTime("");
    setEditDoctorId("");
    setError("");
  };

  const addAppointment = async () => {
    if (!patient || !date || !time || !doctorId) {
      setError("Please fill all fields");
      return;
    }

    try {
      await api.post("/appointments", {
        patient_name: patient,
        date,
        time,
        doctor_id: doctorId,
      });
      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add appointment");
    }
  };

  const editAppointment = (a) => {
    setShowAddForm(true);
    setEditId(a.id);
    setEditPatient(a.patient_name);
    setEditDate(a.date.split("T")[0]);
    setEditTime(a.time);
    setEditDoctorId(a.doctor_id);
    setError("");
  };

  const updateAppointment = async () => {
    if (!editPatient || !editDate || !editTime || !editDoctorId) {
      setError("Please fill all fields");
      return;
    }

    try {
      await api.put(`/appointments/${editId}`, {
        patient_name: editPatient,
        date: editDate,
        time: editTime,
        doctor_id: editDoctorId,
      });
      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update appointment");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete appointment");
    }
  };

  return (
    <div>
      <h1 align="center">Appointments Management</h1>

      {error && (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      )}

      <div style={{ textAlign: "center", marginBottom: 15 }}>
        <button onClick={() => setShowAddForm(true)}>
          Add New Appointment
        </button>
      </div>

      <table border="1" width="90%" align="center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Specialty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.length === 0 ? (
            <tr>
              <td colSpan="7" align="center">
                No appointments found
              </td>
            </tr>
          ) : (
            filteredAppointments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.patient_name}</td>
                <td>{a.date.split("T")[0]}</td>
                <td>{a.time}</td>
                <td>{a.doctor_name}</td>
                <td>{a.doctor_role}</td>
                <td>
                  <button onClick={() => editAppointment(a)}>Edit</button>
                  <button onClick={() => deleteAppointment(a.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showAddForm && (
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <h3>{editId ? "Edit Appointment" : "Add Appointment"}</h3>

          <input
            placeholder="Patient name"
            value={editId ? editPatient : patient}
            onChange={(e) =>
              editId ? setEditPatient(e.target.value) : setPatient(e.target.value)
            }
          />

          <input
            type="date"
            value={editId ? editDate : date}
            onChange={(e) =>
              editId ? setEditDate(e.target.value) : setDate(e.target.value)
            }
          />

          <input
            type="time"
            value={editId ? editTime : time}
            onChange={(e) =>
              editId ? setEditTime(e.target.value) : setTime(e.target.value)
            }
          />

          <select
            value={editId ? editDoctorId : doctorId}
            onChange={(e) =>
              editId
                ? setEditDoctorId(e.target.value)
                : setDoctorId(e.target.value)
            }
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} - {d.role}
              </option>
            ))}
          </select>

          <br />
          <button onClick={resetForm}>Cancel</button>
          <button onClick={editId ? updateAppointment : addAppointment}>
            {editId ? "Update" : "Add"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Appointments;
