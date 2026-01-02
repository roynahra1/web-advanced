import React, { useState, useEffect } from "react";
import api from "../api";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  // Load doctors
  useEffect(() => {
    getDoctors();
  }, []);

  // Filter doctors
  useEffect(() => {
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
  }, [doctors, searchTerm, filterRole]);

  // Get doctors
  const getDoctors = async () => {
    try {
      const data = await api.get("/doctors");
      setDoctors(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load doctors.");
    }
  };

  const displayAddForm = () => {
    setDoctorId(0);
    setName("");
    setRole("General");
    setError("");
    setShowAddForm(true);
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setDoctorId(0);
    setName("");
    setRole("General");
    setError("");
  };

  const save = () => {
    if (!name.trim()) {
      setError("Please enter doctor name");
      return;
    }
    if (!role) {
      setError("Please select a specialty");
      return;
    }

    doctorId === 0 ? addDoctor() : updateDoctor();
  };

  const formatDoctorName = (value) => {
    let n = value.trim();
    if (!n.toLowerCase().startsWith("dr")) {
      n = "Dr. " + n;
    }
    return n;
  };

  // Add doctor
  const addDoctor = async () => {
    setLoading(true);
    try {
      await api.post("/doctors", {
        name: formatDoctorName(name),
        role,
      });
      await getDoctors();
      cancelAdd();
    } catch (err) {
      console.error(err);
      setError("Failed to add doctor.");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const editDoctor = (doctor) => {
    setShowAddForm(true);
    setDoctorId(doctor.id);
    setRole(doctor.role);
    setName(doctor.name.replace(/^dr\.?\s*/i, ""));
    setError("");
  };

  // Update
  const updateDoctor = async () => {
    setLoading(true);
    try {
      await api.put("/doctors", {
        doctorId,
        name: formatDoctorName(name),
        role,
      });
      await getDoctors();
      cancelAdd();
    } catch (err) {
      console.error(err);
      setError("Failed to update doctor.");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteDoctor = async (doctor) => {
    if (!window.confirm("Delete this doctor?")) return;

    try {
      await api.delete(`/doctors/${doctor.id}`);
      setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete doctor.");
    }
  };

  return (
    <div>
      <h1 align="center">Doctors Management</h1>

      {error && (
        <div style={{ color: "red", textAlign: "center", marginBottom: 15 }}>
          {error}
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={displayAddForm}>Add New Doctor</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <table border="1" width="80%" align="center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Specialty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.length === 0 ? (
            <tr>
              <td colSpan="4" align="center">
                No doctors found
              </td>
            </tr>
          ) : (
            filteredDoctors.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.role}</td>
                <td>
                  <button onClick={() => editDoctor(d)}>Edit</button>
                  <button onClick={() => deleteDoctor(d)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showAddForm && (
        <div style={{ marginTop: 30, textAlign: "center" }}>
          <h3>{doctorId === 0 ? "Add Doctor" : "Edit Doctor"}</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Doctor name"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <br />
          <button onClick={cancelAdd}>Cancel</button>
          <button onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
