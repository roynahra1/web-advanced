import React, { useState, useEffect } from "react";
import axios from "axios";

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

  // Common doctor roles
  const roles = [
    "General",
    "Dentist", 
    "Cardiologist",
    "Pediatrician",
    "Dermatologist",
    "Neurologist",
    "Orthopedic"
  ];

  // Load doctors when component mounts
  useEffect(() => {
    getDoctors();
  }, []);

  // Update filtered doctors when doctors, search term, or filter changes
  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filterRole]);

  // Get all doctors from backend
  const getDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:3001/doctors");
      setDoctors(response.data);
    } catch (err) {
      console.log("Error getting doctors:", err);
      alert("Could not load doctors");
    }
  };

  // Filter doctors based on search term and role filter
  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by search term (name)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== "All") {
      filtered = filtered.filter(doctor =>
        doctor.role === filterRole
      );
    }

    setFilteredDoctors(filtered);
  };

  const displayAddForm = () => {
    setDoctorId(0);
    setName("");
    setRole("General");
    setError("");
    setShowAddForm(true);
  };

  const cancelAdd = () => {
    setDoctorId(0);
    setShowAddForm(false);
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
      setError("Please select a role");
      return;
    }

    if (doctorId === 0) {
      addDoctor();
    } else {
      updateDoctor();
    }
  };

  // Add new doctor
  const addDoctor = async () => {
    setLoading(true);

    try {
      // Format name: add Dr. if not already there
      let doctorName = name.trim();
      if (!doctorName.toLowerCase().startsWith("dr") && !doctorName.toLowerCase().startsWith("dr.")) {
        doctorName = "Dr. " + doctorName;
      }

      // Send to backend
      await axios.post("http://localhost:3001/doctors", {
        name: doctorName,
        role: role
      });

      // Refresh doctors list
      getDoctors();
      
      // Close form and reset
      cancelAdd();
      
    } catch (err) {
      console.log("Error adding doctor:", err);
      setError("Failed to add doctor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit doctor
  const editDoctor = (doctor) => {
    setShowAddForm(true);
    // Remove "Dr." from display for editing if present
    let displayName = doctor.name;
    if (displayName.toLowerCase().startsWith("dr. ")) {
      displayName = displayName.substring(4);
    } else if (displayName.toLowerCase().startsWith("dr ")) {
      displayName = displayName.substring(3);
    }
    
    setName(displayName);
    setRole(doctor.role);
    setDoctorId(doctor.id);
    setError("");
  };

  // Update doctor
  const updateDoctor = async () => {
    setLoading(true);

    try {
      // Format name: add Dr. if not already there
      let doctorName = name.trim();
      if (!doctorName.toLowerCase().startsWith("dr") && !doctorName.toLowerCase().startsWith("dr.")) {
        doctorName = "Dr. " + doctorName;
      }

      // Send update to backend
      await axios.put("http://localhost:3001/doctors", {
        doctorId: doctorId,
        name: doctorName,
        role: role
      });

      // Refresh doctors list
      getDoctors();
      
      // Close form and reset
      cancelAdd();
      
    } catch (err) {
      console.log("Error updating doctor:", err);
      setError("Failed to update doctor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete doctor
  const deleteDoctor = async (doctor) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/doctors/${doctor.id}`);
      
      // Update doctors list locally
      const newDoctors = doctors.filter((doc) => doc.id !== doctor.id);
      setDoctors(newDoctors);
      
      alert("Doctor deleted successfully!");
    } catch (err) {
      console.log("Error deleting doctor:", err);
      alert("Could not delete doctor");
    }
  };

  // Handle Enter key in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      save();
    }
  };

  // Handle search input key press
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      filterDoctors();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterRole("All");
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button 
          onClick={displayAddForm}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Add New Doctor
        </button>
      </div>
      
      <h1 align='center'>Doctors Management</h1>
      
      {/* Search and Filter Section */}
      <div style={{ 
        margin: "20px auto", 
        width: "90%", 
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "5px",
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Search & Filter Doctors</h3>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label htmlFor="searchInput" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Search by Name or Specialty:
            </label>
            <input
              id="searchInput"
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              style={{ 
                width: "100%", 
                padding: "8px",
                border: "1px solid #aaa",
                borderRadius: "4px"
              }}
            />
          </div>
          
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label htmlFor="filterRole" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Filter by Specialty:
            </label>
            <select
              id="filterRole"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px",
                border: "1px solid #aaa",
                borderRadius: "4px"
              }}
            >
              <option value="All">All Specialties</option>
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          <div style={{ alignSelf: "flex-end" }}>
            <button
              onClick={clearFilters}
              style={{
                padding: "8px 15px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: "10px", color: "#666" }}>
          Showing {filteredDoctors.length} of {doctors.length} doctors
          {searchTerm && ` matching "${searchTerm}"`}
          {filterRole !== "All" && ` in ${filterRole}`}
        </div>
      </div>
      
      <div className="app">
        <div className="doctors">
          <table border='2' width='90%' style={{ 
            margin: '0 auto', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Specialty</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>
                    {doctors.length === 0 
                      ? "No doctors found. Add your first doctor!" 
                      : "No doctors match your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{doctor.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{doctor.name}</td>
                    <td style={{ padding: '12px' }}>{doctor.role}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "8px"
                        }}
                        onClick={() => editDoctor(doctor)}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                        onClick={() => deleteDoctor(doctor)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {showAddForm && (
            <div style={{ 
              marginTop: "30px", 
              width: "50%", 
              margin: "30px auto",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9"
            }}>
              <h3 style={{ marginTop: 0 }}>
                {doctorId === 0 ? "Add New Doctor" : "Edit Doctor"}
              </h3>
              
              {error && (
                <div style={{
                  color: "red",
                  backgroundColor: "#ffe6e6",
                  padding: "10px",
                  marginBottom: "15px",
                  borderRadius: "5px"
                }}>
                  {error}
                </div>
              )}
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px", textAlign: "right", width: "30%" }}>
                      <label htmlFor="doctorName">Doctor Name:</label>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <input
                        id="doctorName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        style={{ 
                          width: "100%", 
                          padding: "8px",
                          border: "1px solid #aaa",
                          borderRadius: "4px"
                        }}
                        placeholder="Enter doctor name"
                      />
                      <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                        Example: "John Smith" will become "Dr. John Smith"
                      </small>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <label htmlFor="doctorRole">Specialty:</label>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <select
                        id="doctorRole"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                        style={{ 
                          width: "100%", 
                          padding: "8px",
                          border: "1px solid #aaa",
                          borderRadius: "4px"
                        }}
                      >
                        <option value="">-- Select Specialty --</option>
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style={{ padding: "10px" }}>
                      <button 
                        onClick={cancelAdd}
                        disabled={loading}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "10px"
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={save}
                        disabled={loading}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: loading ? "#ccc" : (doctorId === 0 ? "#28a745" : "#007bff"),
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer"
                        }}
                      >
                        {loading ? "Saving..." : (doctorId === 0 ? "Add Doctor" : "Update Doctor")}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}