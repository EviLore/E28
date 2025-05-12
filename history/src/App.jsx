import { Routes, Route, Link } from "react-router-dom";
import Game from "./components/Game";
import History from "./components/History";
import { useState } from "react";

export default function App() {
  // State to track if game should reset
  const [resetTrigger, setResetTrigger] = useState(0);
  
  // Handle navigation to play route
  const handlePlayNavClick = () => {
    // Increment reset trigger to force Game component to reset
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div style={{ 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(to bottom, #f9f9f9, #e9e9e9)",
      minHeight: "100vh",
      paddingBottom: "2rem"
    }}>
      <nav style={{ 
        padding: "1rem", 
        maxWidth: "1280px", 
        margin: "0 auto",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center"
      }}>
        <div style={{ 
          display: "flex", 
          gap: "2rem", 
          justifyContent: "center",
          width: "100%"
        }}>
          <Link 
            to="/play" 
            onClick={handlePlayNavClick}
            style={{ 
              textDecoration: "none", 
              color: "#333",
              fontWeight: "bold",
              fontSize: "1.1rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >Play</Link>
          <Link to="/history" 
            style={{ 
              textDecoration: "none", 
              color: "#333",
              fontWeight: "bold",
              fontSize: "1.1rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >History</Link>
        </div>
      </nav>
      <main style={{ 
        backgroundColor: "#fff", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
        borderRadius: "8px", 
        margin: "1.5rem auto",
        maxWidth: "1280px",
        padding: "1.5rem"
      }}>
        <Routes>
          <Route path="/" element={<Game resetTrigger={resetTrigger} />} />
          <Route path="/play" element={<Game resetTrigger={resetTrigger} />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
      <footer style={{ 
        textAlign: "center", 
        padding: "1rem", 
        color: "#666", 
        fontSize: "0.9rem",
        maxWidth: "1280px",
        margin: "0 auto"
      }}>
        <p>History Nerd by Tyler M.</p>
      </footer>
    </div>
  );
}