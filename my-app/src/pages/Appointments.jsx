import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [editError, setEditError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("All");

  // get data when page loads
  useEffect(() => {
    getAppointments();
    getDoctors();
  }, []);

  // Update filtered appointments when appointments, search term, or filters change
  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterDate, filterDoctor]);

  // get appointments
  const getAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:3001/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.log("error getting appointments", err);
      alert("Error loading appointments");
    }
  };

  // get doctors
  const getDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:3001/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.log("error getting doctors", err);
    }
  };

  // Filter appointments based on search term and filters
  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term (patient name or doctor name)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(app =>
        app.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.doctor_role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (filterDate !== "") {
      filtered = filtered.filter(app => 
        app.date.includes(filterDate)
      );
    }

    // Filter by doctor
    if (filterDoctor !== "All") {
      filtered = filtered.filter(app => 
        app.doctor_id.toString() === filterDoctor
      );
    }

    setFilteredAppointments(filtered);
  };

  // show add form
  const displayAddForm = () => {
    setEditId(null);
    setPatient("");
    setDate("");
    setTime("");
    setDoctorId("");
    setError("");
    setShowAddForm(true);
  };

  // cancel adding
  const cancelAdd = () => {
    setShowAddForm(false);
    setEditId(null);
    setPatient("");
    setDate("");
    setTime("");
    setDoctorId("");
    setError("");
  };

  // add new appointment
  const addAppointment = async () => {
    setError("");
    
    // check if all fields are filled
    if (!patient || !date || !time || !doctorId) {
      setError("Please fill all fields");
      return;
    }

    try {
      // send to backend
      await axios.post("http://localhost:3001/appointments", {
        patient_name: patient,
        date: date,
        time: time,
        doctor_id: doctorId,
      });

      // refresh list
      getAppointments();
      
      // close form
      cancelAdd();
      
      alert("Appointment added successfully!");
    } catch (err) {
      console.log("add error", err);
      // show error from server
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to add appointment");
      }
    }
  };

  // start editing
  const editAppointment = (app) => {
    setShowAddForm(true);
    setEditId(app.id);
    setEditPatient(app.patient_name);
    setEditDate(app.date);
    setEditTime(app.time);
    setEditDoctorId(app.doctor_id);
    setEditError("");
  };

  // cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditPatient("");
    setEditDate("");
    setEditTime("");
    setEditDoctorId("");
    setEditError("");
    setShowAddForm(false);
  };

  // update appointment
  const updateAppointment = async () => {
    setEditError("");
    
    if (!editPatient || !editDate || !editTime || !editDoctorId) {
      setEditError("Please fill all fields");
      return;
    }

    try {
      await axios.put(`http://localhost:3001/appointments/${editId}`, {
        patient_name: editPatient,
        date: editDate,
        time: editTime,
        doctor_id: editDoctorId,
      });

      getAppointments();
      cancelEdit();
      alert("Appointment updated!");
    } catch (err) {
      console.log("update error", err);
      if (err.response && err.response.data && err.response.data.message) {
        setEditError(err.response.data.message);
      } else {
        setEditError("Failed to update");
      }
    }
  };

  // delete appointment
  const deleteAppointment = async (app) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    
    try {
      await axios.delete(`http://localhost:3001/appointments/${app.id}`);
      
      // update local state
      const newAppointments = appointments.filter(apt => apt.id !== app.id);
      setAppointments(newAppointments);
      
      alert("Appointment deleted successfully!");
    } catch (err) {
      console.log("delete error", err);
      alert("Failed to delete appointment");
    }
  };

  // fix date display (removes time part)
  const fixDate = (d) => {
    if (!d) return "";
    if (d.includes('T')) {
      return d.split('T')[0];
    }
    return d;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setFilterDoctor("All");
  };

  // Handle search input key press
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      filterAppointments();
    }
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
          Add New Appointment
        </button>
      </div>
      
      <h1 align='center'>Appointments Management</h1>
      
      {/* Search and Filter Section */}
      <div style={{ 
        margin: "20px auto", 
        width: "90%", 
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "5px",
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Search & Filter Appointments</h3>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label htmlFor="searchInput" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Search Patient or Doctor:
            </label>
            <input
              id="searchInput"
              type="text"
              placeholder="Search by patient, doctor, or specialty..."
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
          
          <div style={{ flex: "1", minWidth: "150px" }}>
            <label htmlFor="filterDate" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Filter by Date:
            </label>
            <input
              id="filterDate"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px",
                border: "1px solid #aaa",
                borderRadius: "4px"
              }}
            />
          </div>
          
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label htmlFor="filterDoctor" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Filter by Doctor:
            </label>
            <select
              id="filterDoctor"
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px",
                border: "1px solid #aaa",
                borderRadius: "4px"
              }}
            >
              <option value="All">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} - {doc.role}
                </option>
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
          Showing {filteredAppointments.length} of {appointments.length} appointments
          {searchTerm && ` matching "${searchTerm}"`}
          {filterDate && ` on ${filterDate}`}
          {filterDoctor !== "All" && ` with selected doctor`}
        </div>
      </div>
      
      <div className="app">
        <div className="appointments">
          <table border='2' width='90%' style={{ 
            margin: '0 auto', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Patient Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Doctor</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Specialty</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                    {appointments.length === 0 
                      ? "No appointments found. Schedule your first appointment!" 
                      : "No appointments match your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{app.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{app.patient_name}</td>
                    <td style={{ padding: '12px' }}>{fixDate(app.date)}</td>
                    <td style={{ padding: '12px' }}>{app.time}</td>
                    <td style={{ padding: '12px' }}>{app.doctor_name}</td>
                    <td style={{ padding: '12px' }}>{app.doctor_role}</td>
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
                        onClick={() => editAppointment(app)}
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
                        onClick={() => deleteAppointment(app)}
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
                {editId === null ? "Add New Appointment" : "Edit Appointment"}
              </h3>
              
              {(error || editError) && (
                <div style={{
                  color: "red",
                  backgroundColor: "#ffe6e6",
                  padding: "10px",
                  marginBottom: "15px",
                  borderRadius: "5px"
                }}>
                  {error || editError}
                </div>
              )}
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px", textAlign: "right", width: "30%" }}>
                      <label htmlFor="patientName">Patient Name:</label>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <input
                        id="patientName"
                        type="text"
                        value={editId === null ? patient : editPatient}
                        onChange={(e) => editId === null ? setPatient(e.target.value) : setEditPatient(e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px",
                          border: "1px solid #aaa",
                          borderRadius: "4px"
                        }}
                        placeholder="Enter patient name"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <label htmlFor="appointmentDate">Date:</label>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <input
                        id="appointmentDate"
                        type="date"
                        value={editId === null ? date : editDate}
                        onChange={(e) => editId === null ? setDate(e.target.value) : setEditDate(e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px",
                          border: "1px solid #aaa",
                          borderRadius: "4px"
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <label htmlFor="appointmentTime">Time:</label>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <input
                        id="appointmentTime"
                        type="time"
                        value={editId === null ? time : editTime}
                        onChange={(e) => editId === null ? setTime(e.target.value) : setEditTime(e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px",
                          border: "1px solid #aaa",
                          borderRadius: "4px"
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <label htmlFor="appointmentDoctor">Doctor:</label>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <select
                        id="appointmentDoctor"
                        value={editId === null ? doctorId : editDoctorId}
                        onChange={(e) => editId === null ? setDoctorId(e.target.value) : setEditDoctorId(e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "8px",
                          border: "1px solid #aaa",
                          borderRadius: "4px"
                        }}
                      >
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} - {doc.role}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style={{ padding: "10px" }}>
                      <button 
                        onClick={editId === null ? cancelAdd : cancelEdit}
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
                        onClick={editId === null ? addAppointment : updateAppointment}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: editId === null ? "#28a745" : "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        {editId === null ? "Add Appointment" : "Update Appointment"}
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

export default Appointments;