import React, { useState, useEffect } from "react";
import api from "../api";
import "../Appointment.css";

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
  const [success, setSuccess] = useState("");

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
    setSuccess("");
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
      setSuccess("Appointment added successfully!");
      setTimeout(() => setSuccess(""), 3000);
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
    setSuccess("");
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
      setSuccess("Appointment updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update appointment");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Appointment deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete appointment");
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>Appointments Management</h1>
        <p className="subtitle">Manage and schedule patient appointments</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      <div className="controls-section">
        <div className="search-filters">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by patient, doctor, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="date-filter"
            />
            
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="doctor-filter"
            >
              <option value="All">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} - {d.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn-primary"
        >
          <span className="btn-icon">+</span> Add New Appointment
        </button>
      </div>

      <div className="appointments-table-container">
        <table className="appointments-table">
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
                <td colSpan="7" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">📅</span>
                    <p>No appointments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAppointments.map((a) => (
                <tr key={a.id}>
                  <td className="appointment-id">#{a.id}</td>
                  <td className="patient-name">{a.patient_name}</td>
                  <td className="appointment-date">{a.date.split("T")[0]}</td>
                  <td className="appointment-time">{a.time}</td>
                  <td className="doctor-name">{a.doctor_name}</td>
                  <td>
                    <span className="specialty-badge">{a.doctor_role}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => editAppointment(a)} 
                        className="btn-edit"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => deleteAppointment(a.id)} 
                        className="btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="appointment-form-modal">
            <div className="modal-header">
              <h3>{editId ? "Edit Appointment" : "Add New Appointment"}</h3>
              <button onClick={resetForm} className="close-modal">×</button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  placeholder="Enter patient name"
                  value={editId ? editPatient : patient}
                  onChange={(e) =>
                    editId ? setEditPatient(e.target.value) : setPatient(e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={editId ? editDate : date}
                  onChange={(e) =>
                    editId ? setEditDate(e.target.value) : setDate(e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={editId ? editTime : time}
                  onChange={(e) =>
                    editId ? setEditTime(e.target.value) : setTime(e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Doctor</label>
                <select
                  value={editId ? editDoctorId : doctorId}
                  onChange={(e) =>
                    editId
                      ? setEditDoctorId(e.target.value)
                      : setDoctorId(e.target.value)
                  }
                  className="form-select"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} - {d.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button onClick={editId ? updateAppointment : addAppointment} className="btn-primary">
                {editId ? "Update Appointment" : "Add Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;