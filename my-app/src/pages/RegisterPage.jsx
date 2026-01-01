import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    // Frontend validation
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      // Send to backend
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error from backend
        if (data.exists) {
          setError("Email already exists. Try another email or login.");
        } else {
          setError(data.message || "Registration failed");
        }
        return;
      }

      // Registration successful
      console.log("Registration successful:", data);
      alert("Registration successful! You can now login.");
      
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login page
      navigate("/login");

    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Register</h2>
      
      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#ffe6e6",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            marginBottom: 10,
            border: "1px solid #ccc"
          }}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            marginBottom: 10,
            border: "1px solid #ccc"
          }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            marginBottom: 10,
            border: "1px solid #ccc"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            marginBottom: 10,
            border: "1px solid #ccc"
          }}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            marginBottom: 10,
            border: "1px solid #ccc"
          }}
        />

        <button 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            backgroundColor: loading ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p style={{ marginTop: 15 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}