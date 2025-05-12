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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
    }}>
      <nav style={{ 
        padding: "1rem", 
        maxWidth: "1280px", 
        margin: "0 auto",
        borderBottom: "1px solid #eee",
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
              padding: "0.5rem 1rem"
            }}>Play</Link>
          <Link to="/history" style={{ 
            textDecoration: "none", 
            color: "#333",
            fontWeight: "bold",
            fontSize: "1.1rem",
            padding: "0.5rem 1rem"
          }}>History</Link>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Game resetTrigger={resetTrigger} />} />
          <Route path="/play" element={<Game resetTrigger={resetTrigger} />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}