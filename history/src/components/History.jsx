import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function History() {
  // Navigation hook for returning to game
  const navigate = useNavigate();
  
  // State to store question history items from localStorage
  const [historyItems, setHistoryItems] = useState([]);
  // State to store player's total points
  const [totalPoints, setTotalPoints] = useState(0);
  // State to track if there's a game in progress
  const [gameInProgress, setGameInProgress] = useState(false);

  // Load history and points from localStorage when component mounts
  useEffect(() => {
    try {
      // Retrieve and parse saved question history
      const savedHistory = localStorage.getItem("history");
      if (savedHistory) {
        setHistoryItems(JSON.parse(savedHistory));
      }
      
      // Retrieve and parse saved point total
      const savedPoints = localStorage.getItem("points");
      if (savedPoints) {
        setTotalPoints(parseInt(savedPoints, 10));
      }
      
      // Check if there's a game in progress
      const currentGameDifficulty = localStorage.getItem("currentGameDifficulty");
      setGameInProgress(!!currentGameDifficulty);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }, []);

  // Format ISO date string to a user-friendly readable format
  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleString();
    } catch (err) {
      return "";
    }
  };

  // Clear all game history and stats after user confirmation
  const resetHistory = () => {
    if (confirm("Are you sure you want to clear your history? This cannot be undone.")) {
      setHistoryItems([]);
      setTotalPoints(0); // Reset points in state as well
      try {
        // Remove all game-related data from localStorage
        localStorage.removeItem("history");
        localStorage.removeItem("points");
        localStorage.removeItem("streak");
        localStorage.removeItem("currentDifficultyStreak");
        localStorage.removeItem("currentGameDifficulty");
        setGameInProgress(false);
      } catch (err) {
        console.error("Error clearing localStorage:", err);
      }
    }
  };
  
  // Return to the active game
  const returnToGame = () => {
    navigate('/play');
  };

  // Define colors for different difficulty levels (visual feedback)
  const difficultyColors = {
    easy: "#7bc043", // green
    medium: "#ffd166", // yellow
    hard: "#ff9f1c", // orange
    extreme: "#ff595e" // red
  };

  // Define display labels for difficulty levels
  const difficultyLabels = {
    easy: "Easy (3 options)",
    medium: "Medium (4 options)",
    hard: "Hard (5 options)",
    extreme: "Extreme (6 options)"
  };

  // Calculate summary statistics from history data
  const totalQuestions = historyItems.length;
  const correctAnswers = historyItems.filter(item => item.correct).length;
  const correctPercentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;

    return (
    <div style={{ 
      padding: "1rem", 
      boxSizing: "border-box"
    }}>
      {/* Header with title */}
      <h1 style={{ 
        textAlign: "center", 
        marginBottom: "1.5rem",
        fontSize: "2.5rem",
        color: "#333",
        fontWeight: "bold",
        position: "relative"
      }}>
        Your <span style={{ color: "#4a6fa5" }}>Stats</span>
        <div style={{ 
          height: "4px", 
          width: "80px", 
          backgroundColor: "#4CAF50", 
          margin: "0.5rem auto",
          borderRadius: "2px"
        }}></div>
      </h1>
      
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: "1rem",
        marginBottom: "2rem" 
      }}>
        {/* Return to game button - only shown when a game is in progress */}
        {gameInProgress && (
          <button 
            onClick={returnToGame}
            style={{ 
              backgroundColor: "#e6f2ff", 
              padding: "0.5rem 1.5rem", 
              fontSize: "1rem",
              border: "1px solid #99ccff",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#ccdfff";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#e6f2ff";
              e.currentTarget.style.transform = "none";
            }}
          >
            Return to Game
          </button>
        )}
        
        {historyItems.length > 0 && (
          <button 
            onClick={resetHistory}
            style={{ 
              backgroundColor: "#ffcccc", 
              padding: "0.5rem 1.5rem", 
              fontSize: "1rem",
              border: "1px solid #ffb3b3",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#ffb3b3";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#ffcccc";
              e.currentTarget.style.transform = "none";
            }}
          >
            Clear History
          </button>
        )}
      </div>
      
      {/* Show message when no history exists */}
      {historyItems.length === 0 ? (
        <div style={{ 
          padding: "3rem", 
          textAlign: "center", 
          backgroundColor: "#f9f9f9", 
          borderRadius: "8px",
          marginTop: "1rem",
          border: "1px dashed #ddd"
        }}>
          <p style={{ fontSize: "1.2rem", margin: "0", color: "#666" }}>
            No history yet. Play the game to see your results here.
          </p>
        </div>
      ) : (
        <div>
          {/* Summary statistics */}
          <div style={{ 
            backgroundColor: "#f8f8f8", 
            padding: "1.5rem", 
            borderRadius: "8px", 
            marginBottom: "2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            border: "1px solid #eee"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#444" }}>Your Statistics</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <div style={{ 
                  backgroundColor: "#fff", 
                  padding: "1rem", 
                  borderRadius: "6px",
                  border: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>Accuracy</div>
                    <div style={{ 
                      fontSize: "1.5rem", 
                      fontWeight: "bold",
                      color: correctPercentage >= 70 
                        ? "#4CAF50" 
                        : correctPercentage >= 40 
                          ? "#FFA726" 
                          : "#F44336"
                    }}>{correctPercentage}%</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <div style={{ 
                  backgroundColor: "#fff", 
                  padding: "1rem", 
                  borderRadius: "6px",
                  border: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>Questions Answered</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
                      {totalQuestions} <span style={{ fontSize: "1rem", fontWeight: "normal", color: "#666" }}>
                      ({correctAnswers} correct)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <div style={{ 
                  backgroundColor: "#fff", 
                  padding: "1rem", 
                  borderRadius: "6px",
                  border: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>Total Points</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a6fa5" }}>
                      {totalPoints}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* History items list */}
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ 
              borderBottom: "1px solid #eee", 
              paddingBottom: "0.5rem", 
              color: "#444"
            }}>Past Questions</h3>
          </div>
          
          {historyItems.map((item, index) => (
            <div key={index} style={{ 
              margin: "1.5rem 0", 
              padding: "1.5rem", 
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: item.correct ? "#f1f8e9" : "#feefee",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              {/* Question header with difficulty */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h3 style={{ margin: "0", color: "#333", flex: "1", minWidth: "70%" }}>{item.question}</h3>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {item.difficulty && (
                    <span style={{ 
                      backgroundColor: difficultyColors[item.difficulty.toLowerCase()] || "#f0f0f0", 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      color: (item.difficulty.toLowerCase() === "hard" || item.difficulty.toLowerCase() === "extreme") ? "#fff" : "#333"
                    }}>
                      {difficultyLabels[item.difficulty.toLowerCase()] || item.difficulty}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Answer options */}
              <div style={{ 
                margin: "1rem 0",
                backgroundColor: "#fff",
                padding: "1rem",
                borderRadius: "6px",
                border: "1px solid #eee"
              }}>
                <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.75rem" }}>
                  Answer choices:
                </div>
                {item.options && Object.entries(item.options).map(([letter, text]) => (
                  <div key={letter} style={{
                    padding: "0.6rem",
                    margin: "0.4rem 0",
                    backgroundColor: 
                      letter === item.userAnswer 
                        ? (item.correct ? "#e6ffe6" : "#ffe6e6")
                        : letter === item.answer && !item.correct
                          ? "#e6f7ff" 
                          : "#f9f9f9",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      backgroundColor: 
                        letter === item.userAnswer 
                          ? (item.correct ? "#4CAF50" : "#ff6b6b")
                          : letter === item.answer && !item.correct
                            ? "#2196F3" 
                            : "#e0e0e0",
                      color: letter === item.userAnswer || (letter === item.answer && !item.correct)
                        ? "white"
                        : "#333",
                      borderRadius: "50%",
                      marginRight: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold"
                    }}>{letter}</span>
                    <span>{text}</span>
                    {letter === item.userAnswer && 
                      <span style={{ 
                        marginLeft: "auto", 
                        color: item.correct ? "#4CAF50" : "#ff6b6b",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        <span>Your answer</span>
                        <span>{item.correct ? "✓" : "✗"}</span>
                      </span>
                    }
                    {letter === item.answer && !item.correct && 
                      <span style={{ 
                        marginLeft: "auto", 
                        color: "#2196F3",
                        fontWeight: "bold" 
                      }}>
                        Correct answer
                      </span>
                    }
                  </div>
                ))}
              </div>
              
              {/* Result */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1rem",
                margin: "1rem 0"
              }}>
                <p style={{ 
                  fontWeight: "bold", 
                  color: item.correct ? "green" : "red",
                  margin: "0",
                  fontSize: "1.1rem"
                }}>
                  {item.correct ? "✅ Correct!" : "❌ Incorrect"}
                </p>
                
                {/* Points information */}
                {item.pointsEarned !== undefined && (
                  <div style={{
                    backgroundColor: "#fff",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    color: item.pointsEarned >= 0 ? "#4CAF50" : "#ff6b6b",
                    border: `1px solid ${item.pointsEarned >= 0 ? "#d7f3d7" : "#ffe0e0"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: "bold"
                  }}>
                    <span>Points: {item.pointsEarned >= 0 ? "+" : ""}{item.pointsEarned}</span>
                    {item.pointsTotal !== undefined && (
                      <span style={{ 
                        fontSize: "0.8rem", 
                        color: "#666", 
                        fontWeight: "normal" 
                      }}>
                        (Total: {item.pointsTotal})
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Explanation */}
              {item.explanation && (
                <div style={{ 
                  margin: "1rem 0", 
                  padding: "1rem", 
                  backgroundColor: "rgba(255,255,255,0.7)", 
                  borderRadius: "6px",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <strong style={{ display: "block", marginBottom: "0.5rem" }}>Explanation:</strong> 
                  <span style={{ lineHeight: "1.5" }}>{item.explanation}</span>
                </div>
              )}
              
              {/* Metadata */}
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#666", 
                marginTop: "1rem", 
                display: "flex", 
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
                backgroundColor: "rgba(0,0,0,0.025)",
                padding: "0.75rem",
                borderRadius: "4px"
              }}>
                <div>
                  {item.timestamp && formatDate(item.timestamp)}
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {item.category && <span>Category: {item.category}</span>}
                  {item.region && <span>Region: {item.region}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    );
  }