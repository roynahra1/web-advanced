import React, { useState, useEffect } from "react";
import api from "../api";
import "../Doctor.css";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctorId, setDoctorId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  const roles = [
    "General",
    "Dentist",
    "Cardiologist",
    "Pediatrician",
    "Dermatologist",
    "Neurologist",
    "Orthopedic",
  ];

  const specialtyColors = {
    "General": "#4CAF50",
    "Dentist": "#2196F3",
    "Cardiologist": "#F44336",
    "Pediatrician": "#FF9800",
    "Dermatologist": "#9C27B0",
    "Neurologist": "#00BCD4",
    "Orthopedic": "#795548",
  };

  useEffect(() => {
    getDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filterRole]);

  const getDoctors = async () => {
    try {
      const data = await api.get("/doctors");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setDoctors([]);
      setError("Failed to load doctors.");
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== "All") {
      filtered = filtered.filter((d) => d.role === filterRole);
    }

    setFilteredDoctors(filtered);
  };

  const displayAddForm = () => {
    setDoctorId(0);
    setName("");
    setRole("General");
    setError("");
    setSuccess("");
    setShowAddForm(true);
  };

  const cancelAdd = () => {
    setDoctorId(0);
    setShowAddForm(false);
    setName("");
    setRole("General");
    setError("");
  };

  const formatDoctorName = (value) => {
    let n = value.trim();
    if (!n.toLowerCase().startsWith("dr")) n = "Dr. " + n;
    return n;
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Please enter doctor name");
      return;
    }
    if (!role) {
      setError("Please select a specialty");
      return;
    }

    setLoading(true);
    try {
      if (doctorId === 0) {
        const newDoctor = { name: formatDoctorName(name), role };
        const createdDoctor = await api.post("/doctors", newDoctor);
        setDoctors((prev) => [...prev, createdDoctor]);
        setSuccess("Doctor added successfully!");
      } else {
        const updatedDoctor = { doctorId, name: formatDoctorName(name), role };
        await api.put("/doctors", updatedDoctor);
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === doctorId ? { ...d, name: updatedDoctor.name, role } : d
          )
        );
        setSuccess("Doctor updated successfully!");
      }
      
      setTimeout(() => setSuccess(""), 3000);
      cancelAdd();
    } catch (err) {
      console.error("Error saving doctor:", err);
      setError(err.response?.data?.message || "Failed to save doctor");
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (doctor) => {
    if (!window.confirm(`Are you sure you want to delete ${doctor.name}?`)) return;
    try {
      await api.delete(`/doctors/${doctor.id}`);
      setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
      setSuccess("Doctor deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting doctor:", err);
      setError("Failed to delete doctor.");
    }
  };

  return (
    <div className="doctors-container">
      <div className="doctors-header">
        <h1>Doctors Management</h1>
        <p className="subtitle">Manage healthcare professionals and specialties</p>
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
        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="All">All Specialties</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button onClick={displayAddForm} className="btn-primary">
          <span className="btn-icon">+</span> Add New Doctor
        </button>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.length === 0 ? (
          <div className="no-doctors">
            <div className="no-doctors-icon">👨‍⚕️</div>
            <h3>No Doctors Found</h3>
            <p>{doctors.length === 0 
              ? "Start by adding your first doctor!" 
              : "Try adjusting your search criteria"}
            </p>
          </div>
        ) : (
          filteredDoctors.map((d) => (
            <div key={d.id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar">
                  {d.name.charAt(0)}
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">{d.name}</h3>
                  <span 
                    className="specialty-tag"
                    style={{ backgroundColor: `${specialtyColors[d.role]}20`, color: specialtyColors[d.role] }}
                  >
                    {d.role}
                  </span>
                </div>
              </div>
              
              <div className="doctor-card-body">
                <div className="doctor-detail">
                  <span className="detail-label">ID</span>
                  <span className="detail-value">#{d.id}</span>
                </div>
              </div>
              
              <div className="doctor-card-actions">
                <button 
                  onClick={() => {
                    setShowAddForm(true);
                    setDoctorId(d.id);
                    setName(d.name.replace(/^dr\.?\s*/i, ""));
                    setRole(d.role);
                  }} 
                  className="btn-edit"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => deleteDoctor(d)} 
                  className="btn-delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="doctor-form-modal">
            <div className="modal-header">
              <h3>{doctorId === 0 ? "Add New Doctor" : "Edit Doctor"}</h3>
              <button onClick={cancelAdd} className="close-modal">×</button>
            </div>
            
            <div className="form-content">
              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter doctor name"
                  className="form-input"
                />
                <small className="form-hint">We'll add "Dr." prefix automatically</small>
              </div>
              
              <div className="form-group">
                <label>Specialty</label>
                <div className="specialty-grid">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`specialty-option ${role === r ? 'selected' : ''}`}
                      onClick={() => setRole(r)}
                      style={{
                        backgroundColor: role === r ? specialtyColors[r] : `${specialtyColors[r]}20`,
                        color: role === r ? 'white' : specialtyColors[r]
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button onClick={cancelAdd} className="btn-secondary">
                Cancel
              </button>
              <button onClick={save} className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {doctorId === 0 ? "Adding..." : "Updating..."}
                  </>
                ) : (
                  doctorId === 0 ? "Add Doctor" : "Update Doctor"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}