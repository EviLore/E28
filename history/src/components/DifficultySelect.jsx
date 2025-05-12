import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DifficultySelect({ setGameInProgress }) {
  // State for managing difficulty selection
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  
  // Navigation hook for redirecting to game
  const navigate = useNavigate();

  // Points awarded for each difficulty level
  const difficultyPoints = {
    easy: 1,
    medium: 2,
    hard: 3,
    extreme: 5
  };

  // Colors for different difficulty levels (visual feedback)
  const difficultyColors = {
    easy: "#7bc043", // green
    medium: "#ffd166", // yellow
    hard: "#ff9f1c", // orange
    extreme: "#ff595e" // red
  };

  // Labels for different difficulty levels with description
  const difficultyLabels = {
    easy: "Easy (Middle School) - 3 options",
    medium: "Medium (High School) - 4 options",
    hard: "Hard (College) - 5 options",
    extreme: "Extreme (PhD) - 6 options"
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  // Start the game with selected difficulty
  const startGame = () => {
    setLoading(true);
    
    try {
      // Save current game difficulty to localStorage
      localStorage.setItem("currentGameDifficulty", difficulty);
      
      // Update game in progress state in the parent component
      if (setGameInProgress) {
        setGameInProgress(true);
      }
      
      // Navigate to the play route with the selected difficulty
      navigate(`/play?difficulty=${difficulty}`);
    } catch (err) {
      console.error("Error saving game state:", err);
      // Navigate anyway, even if localStorage fails
      navigate(`/play?difficulty=${difficulty}`);
    }
  };

  return (
    <div style={{ 
      padding: "1rem",
      boxSizing: "border-box"
    }}>
      <h1 style={{ 
        textAlign: "center", 
        marginBottom: "1.5rem",
        fontSize: "2.5rem",
        color: "#333",
        fontWeight: "bold",
        position: "relative"
      }}>
        <span style={{ color: "#4a6fa5" }}>History</span> Nerd
        <div style={{ 
          height: "4px", 
          width: "80px", 
          backgroundColor: "#4CAF50", 
          margin: "0.5rem auto",
          borderRadius: "2px"
        }}></div>
      </h1>
      
      {/* Points display */}
      <div style={{ 
        textAlign: "center",
        marginBottom: "1.5rem" 
      }}>
        <h2 style={{ 
          marginBottom: "1.5rem",
          color: "#444",
          fontSize: "1.8rem"
        }}>Select Difficulty</h2>
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.75rem", 
          maxWidth: "500px", 
          margin: "0 auto" 
        }}>
          {Object.entries(difficultyLabels).map(([key, label]) => (
            <button 
              key={key}
              onClick={() => handleDifficultyChange(key)}
              style={{
                padding: "1rem",
                fontSize: "1rem",
                backgroundColor: difficulty === key ? difficultyColors[key] : "#f5f5f5",
                border: difficulty === key ? "2px solid #333" : "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: difficulty === key ? "bold" : "normal",
                transition: "all 0.2s ease",
                boxShadow: difficulty === key ? "0 2px 4px rgba(0,0,0,0.15)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: difficulty === key && (key === "hard" || key === "extreme") ? "#fff" : "#333"
              }}
            >
              {label} <span style={{ marginLeft: "auto", fontWeight: "bold" }}>{difficultyPoints[key]} pt{difficultyPoints[key] > 1 ? "s" : ""}</span>
            </button>
          ))}
        </div>
        
        <div style={{ 
          marginTop: "2.5rem",
          position: "relative",
          display: "inline-block" 
        }}>
          <button 
            onClick={startGame} 
            disabled={loading}
            style={{ 
              padding: "0.75rem 2.5rem", 
              fontSize: "1.2rem", 
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#45a049";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#4CAF50";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Loading..." : "Start Game"}
          </button>
        </div>
        
        <div style={{ 
          marginTop: "3rem", 
          padding: "1rem", 
          backgroundColor: "#f8f8f8", 
          borderRadius: "8px",
          maxWidth: "600px",
          margin: "3rem auto 0",
          border: "1px solid #eee"
        }}>
          <h3 style={{ 
            margin: "0 0 0.5rem 0", 
            color: "#555", 
            fontSize: "1.1rem" 
          }}>How to Play</h3>
          <p style={{ 
            margin: "0 0 1rem 0", 
            color: "#666", 
            fontSize: "0.9rem", 
            lineHeight: "1.4" 
          }}>
            Test your knowledge of history with questions of varying difficulty. 
            Choose your difficulty level, then answer multiple choice questions. 
            Each difficulty adds more answer options, making it harder to guess!
          </p>
          <h4 style={{ margin: "0.5rem 0", color: "#555", fontSize: "1rem" }}>Point System:</h4>
          <div style={{ 
            margin: "0", 
            fontSize: "0.9rem", 
            color: "#666", 
            lineHeight: "1.4"
          }}>
            <div style={{ marginBottom: "0.3rem" }}>Easy: +1 for correct, -1 for incorrect</div>
            <div style={{ marginBottom: "0.3rem" }}>Medium: +2 for correct, -2 for incorrect</div>
            <div style={{ marginBottom: "0.3rem" }}>Hard: +3 for correct, -3 for incorrect</div>
            <div style={{ marginBottom: "0.3rem" }}>Extreme: +5 for correct, -5 for incorrect</div>
            <div>Streak Bonus: +1 point for each consecutive correct answer on the same difficulty</div>
          </div>
        </div>
      </div>
    </div>
  );
} 