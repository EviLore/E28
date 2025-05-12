import { Routes, Route, Link, Navigate } from "react-router-dom";  // React Router for navigation
import Game from "./components/Game";  // Game component for quiz functionality
import History from "./components/History";  // History component for stats display
import DifficultySelect from "./components/DifficultySelect";  // New component for difficulty selection
import { useState, useEffect } from "react";  // React state hook for component state

export default function App() {
  // State to track if a game is in progress
  const [gameInProgress, setGameInProgress] = useState(false);
  
  // Check localStorage for game in progress on component mount
  useEffect(() => {
    const checkGameInProgress = () => {
      try {
        // Check if there's a current difficulty stored
        const currentDifficulty = localStorage.getItem("currentGameDifficulty");
        setGameInProgress(!!currentDifficulty);
      } catch (err) {
        console.error("Error checking game status:", err);
      }
    };
    
    // Initial check
    checkGameInProgress();
    
    // Listen for storage events to update nav bar when game status changes
    window.addEventListener('storage', checkGameInProgress);
    
    return () => {
      window.removeEventListener('storage', checkGameInProgress);
    };
  }, []);

  // Common styles for consistent width and layout across all sections
  const containerStyles = {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box"
  };

  return (
    <div style={{ 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(to bottom, #f9f9f9, #e9e9e9)",
      minHeight: "100vh",
      paddingBottom: "2rem"
    }}>
      {/* Navigation bar with Play and Stats links */}
      <nav style={{ 
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        display: "flex",
        justifyContent: "center"
      }}>
        <div style={{ 
          ...containerStyles,
          display: "flex", 
          justifyContent: "center"
        }}>
          <div style={{ 
            display: "flex", 
            gap: "2rem", 
            justifyContent: "center",
            width: "100%"
          }}>
            {/* Home link - shows difficulty selection */}
            <Link 
              to="/home" 
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
            >Home</Link>
            
            {/* Game link - only shown when a game is in progress */}
            {gameInProgress && (
              <Link 
                to="/play" 
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
              >Game</Link>
            )}
            
            {/* Stats link - shows game history and statistics */}
            <Link to="/stats" 
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
            >Stats</Link>
          </div>
        </div>
      </nav>
      {/* Main content container */}
      <div style={{ ...containerStyles, padding: "1.5rem 0" }}>
        <main style={{ 
          backgroundColor: "#fff", 
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
          borderRadius: "8px", 
          width: "100%",
          padding: "1.5rem",
          boxSizing: "border-box"
        }}>
          {/* Route configuration for the application */}
          <Routes>
            {/* Default route - redirects to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Home route - shows difficulty selection screen */}
            <Route path="/home" element={<DifficultySelect setGameInProgress={setGameInProgress} />} />
            {/* Play route - shows the active gameplay */}
            <Route path="/play" element={<Game setGameInProgress={setGameInProgress} />} />
            {/* Stats route - shows history/statistics component */}
            <Route path="/stats" element={<History />} />
            {/* Redirect for legacy '/history' route for backward compatibility */}
            <Route path="/history" element={<Navigate to="/stats" replace />} />
          </Routes>
        </main>
      </div>
      {/* Footer with attribution */}
      <footer style={{ 
        textAlign: "center", 
        padding: "1rem", 
        color: "#666", 
        fontSize: "0.9rem"
      }}>
        <div style={containerStyles}>
          <p>History Nerd by Tyler M.</p>
        </div>
      </footer>
    </div>
  );
}