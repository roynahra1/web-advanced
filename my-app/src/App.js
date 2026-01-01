import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";

import axios from "axios";

export default function App() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const result = await axios.get("http://localhost:3001/doctors");
      if (result.status === 200) {
        console.log(result.data);
        setDoctors(result.data);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <BrowserRouter>
      <nav
        style={{
          display: "flex",
          gap: "20px",
          padding: "15px",
          justifyContent: "center",
          background: "#f2f2f2",
        }}
      >
        <NavLink
          to="/home"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#3498db" : "#2c3e50",
            fontWeight: isActive ? "bold" : "normal",
          })}
        >
          Home
        </NavLink>

        <NavLink
          to="/doctors"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#3498db" : "#2c3e50",
            fontWeight: isActive ? "bold" : "normal",
          })}
        >
          Doctors
        </NavLink>

        <NavLink
          to="/appointments"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#3498db" : "#2c3e50",
            fontWeight: isActive ? "bold" : "normal",
          })}
        >
          Appointments
        </NavLink>
      </nav>

      <Routes>
        {/* Always start from login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login + Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/home" element={<Home />} />

        <Route
          path="/doctors"
          element={<Doctors doctors={doctors} setDoctors={setDoctors} />}
        />
        <Route
          path="/appointments"
          element={<Appointments doctors={doctors} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
