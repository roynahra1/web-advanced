import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "../Auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "#ff4444";
    if (passwordStrength < 75) return "#ffa700";
    return "#00c851";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

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
      const data = await api.post("/register", {
        firstName,
        lastName,
        email,
        password,
      });

      alert("Registration successful! You can now login.");
      
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPasswordStrength(0);
      
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Registration failed. Please try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-hero">
            <div className="auth-icon">🏥</div>
            <h1>Join Our Healthcare Community</h1>
            <p>Start managing your medical practice efficiently with our platform</p>
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>Easy Appointment Management</strong>
                  <p>Schedule and track appointments seamlessly</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>Secure Patient Data</strong>
                  <p>HIPAA compliant data protection</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <div>
                  <strong>24/7 Support</strong>
                  <p>Round-the-clock customer assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Join our healthcare management platform</p>
            </div>
            
            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      required
                      className="auth-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Last Name</label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                      required
                      className="auth-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="auth-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={loading}
                    required
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      ></div>
                    </div>
                    <div className="strength-text">
                      <span>Password strength: </span>
                      <span style={{ color: getStrengthColor() }}>
                        {passwordStrength < 50 ? "Weak" : 
                         passwordStrength < 75 ? "Medium" : "Strong"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <div className="password-mismatch">
                    Passwords do not match
                  </div>
                )}
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>
                    I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and{" "}
                    <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                  </span>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading || passwordStrength < 50 || password !== confirmPassword}
                className="auth-button"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
              
              <div className="auth-divider">
                <span>or sign up with</span>
              </div>
              
              <div className="social-login">
                <button type="button" className="social-button google">
                  <span className="social-icon">G</span>
                  Google
                </button>
                <button type="button" className="social-button microsoft">
                  <span className="social-icon">M</span>
                  Microsoft
                </button>
              </div>
            </form>
            
            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}