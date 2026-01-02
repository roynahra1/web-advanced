import api from "../api";
// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Clear any other stored data
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    
    // Optional: Clear all localStorage (use with caution)
    // localStorage.clear();
    
    // Redirect to login page
    navigate("/login");
    
    // Or if not using React Router:
    // window.location.href = "/login";
    
    console.log("Successfully logged out");
  };

  return (
    <div style={{
      textAlign: "center",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "40px",
      background: "linear-gradient(to right, #f0f4f8, #d9e2ec)",
      minHeight: "100vh",
      position: "relative"
    }}>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "600",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#c0392b";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 8px rgba(0,0,0,0.15)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#e74c3c";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
        }}
      >
        Logout
      </button>

      {/* Rest of your content remains the same */}
      <h1 style={{ 
        color: "#2c3e50", 
        fontSize: "2.5rem", 
        marginBottom: "20px",
        textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
        marginTop: "20px"
      }}>
        Welcome to Our Clinic
      </h1>

      <img
        src="https://images.unsplash.com/photo-1506765515384-028b60a970aa"
        alt="clinic"
        style={{
          width: "400px",
          borderRadius: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          marginBottom: "20px",
          transition: "transform 0.3s",
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
      />

      <p style={{ 
        maxWidth: "600px", 
        margin: "0 auto", 
        color: "#555", 
        lineHeight: "1.6", 
        fontSize: "1.1rem"
      }}>
        We provide top-quality healthcare services with a compassionate touch.
        Explore our website to learn more about our doctors, services, and how to book appointments easily.
      </p>
    </div>
  );
}