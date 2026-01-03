import React from "react";
import { useNavigate } from "react-router-dom";
import "../Home.css";

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
    
    // Redirect to login page
    navigate("/login");
    
    console.log("Successfully logged out");
  };

  const quickActions = [
    { id: 1, title: "Book Appointment", icon: "📅", color: "#4CAF50", path: "/appointments" },
    { id: 2, title: "View Doctors", icon: "👨‍⚕️", color: "#2196F3", path: "/doctors" },
    { id: 3, title: "Patient Records", icon: "📋", color: "#FF9800", path: "/patients" },
    { id: 4, title: "Clinic Calendar", icon: "🗓️", color: "#9C27B0", path: "/calendar" },
  ];

  const stats = [
    { id: 1, label: "Total Appointments", value: "1,234", change: "+12%" },
    { id: 2, label: "Active Patients", value: "892", change: "+8%" },
    { id: 3, label: "Available Doctors", value: "24", change: "+2" },
    { id: 4, label: "Today's Visits", value: "56", change: "Now" },
  ];

  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="welcome-title">
            <span className="welcome-text">Welcome to</span>
            <span className="clinic-name">MediCare Clinic</span>
          </h1>
          <p className="welcome-subtitle">
            Excellence in Healthcare, Compassion in Service
          </p>
        </div>
        
        <button onClick={handleLogout} className="logout-btn">
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Your Health, Our Priority</h2>
            <p>
              Experience world-class healthcare services with our team of 
              certified professionals. We combine advanced technology with 
              compassionate care for your well-being.
            </p>
            <div className="hero-stats">
              {stats.map((stat) => (
                <div key={stat.id} className="stat-card">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-change positive">{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Modern Clinic Interior"
            />
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions-section">
        <h2 className="section-title">Quick Access</h2>
        <p className="section-subtitle">Get started with these quick actions</p>
        
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <button 
              key={action.id} 
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ '--card-color': action.color }}
            >
              <div className="action-icon" style={{ backgroundColor: `${action.color}20` }}>
                <span className="icon" style={{ color: action.color }}>
                  {action.icon}
                </span>
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>Click to access</p>
              </div>
              <div className="action-arrow">→</div>
            </button>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">We're committed to providing exceptional healthcare</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Expert Doctors</h3>
            <p>Board-certified physicians with extensive experience in their fields.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Digital Records</h3>
            <p>Secure, accessible electronic health records for seamless care.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock emergency services and patient support.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">❤️</div>
            <h3>Patient Care</h3>
            <p>Personalized treatment plans tailored to individual needs.</p>
          </div>
        </div>
      </section>

      {/* Upcoming Appointments Section */}
      <section className="appointments-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Today's Schedule</h2>
            <p className="section-subtitle">Upcoming appointments for today</p>
          </div>
          <button className="btn-view-all" onClick={() => navigate("/appointments")}>
            View All →
          </button>
        </div>
        
        <div className="appointments-list">
          <div className="appointment-item">
            <div className="appointment-time">09:00 AM</div>
            <div className="appointment-details">
              <div className="patient-name">John Smith</div>
              <div className="appointment-type">General Checkup</div>
            </div>
            <div className="doctor-info">
              <span className="doctor-badge">Dr. Sarah Wilson</span>
            </div>
          </div>
          
          <div className="appointment-item">
            <div className="appointment-time">11:30 AM</div>
            <div className="appointment-details">
              <div className="patient-name">Emma Johnson</div>
              <div className="appointment-type">Dental Consultation</div>
            </div>
            <div className="doctor-info">
              <span className="doctor-badge">Dr. Michael Chen</span>
            </div>
          </div>
          
          <div className="appointment-item">
            <div className="appointment-time">02:15 PM</div>
            <div className="appointment-details">
              <div className="patient-name">Robert Davis</div>
              <div className="appointment-type">Cardiology Follow-up</div>
            </div>
            <div className="doctor-info">
              <span className="doctor-badge">Dr. Lisa Rodriguez</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">MediCare Clinic</span>
          </div>
          <p className="footer-tagline">
            Caring for you, always. © {new Date().getFullYear()}
          </p>
          <div className="footer-contact">
            <span>📞 (123) 456-7890</span>
            <span>📧 contact@medicareclinic.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}