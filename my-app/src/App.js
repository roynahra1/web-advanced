import api from "./api";
import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation, // Add this import
} from "react-router-dom";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";

import axios from "axios";

// Create a separate Navbar component that checks the current location
const Navbar = () => {
  const location = useLocation();
  
  // Don't show navbar on login or register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }
  
  return (
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
  );
};

export default function App() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Update this to your Render backend URL
        const result = await api.get("https://web-advanced-3aq6.onrender.com/doctors");
        if (result.status === 200) {
          console.log(result.data);
          setDoctors(result.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <HashRouter>
      <Navbar /> {/* This will only show on non-login/register pages */}
      
      <Routes>
        {/* Always start from login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login + Register (no navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected pages (with navbar) */}
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
    </HashRouter>
  );
}