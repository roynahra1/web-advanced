import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send POST request to backend
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error from backend
        setError(data.message || "Login failed");
        return;
      }

      // Login successful
      console.log("Login successful:", data);
      
      // Save user data to localStorage
      localStorage.setItem("token", "authenticated"); // Simple token
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect to appointments page
      navigate("/Home");

    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      
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
      
      <form onSubmit={handleLogin}>
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

        <button 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 10, 
            marginTop: 10,
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 15 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}