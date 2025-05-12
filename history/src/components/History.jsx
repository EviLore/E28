import { useState, useEffect } from "react";

export default function History() {
  // State to store history items
  const [historyItems, setHistoryItems] = useState([]);

  // Load history from localStorage when component mounts
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("history");
      if (savedHistory) {
        setHistoryItems(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }, []);

  // Format date to a readable string
  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleString();
    } catch (err) {
      return "";
    }
  };

  // Clear history after confirmation
  const resetHistory = () => {
    if (confirm("Are you sure you want to clear your history? This cannot be undone.")) {
      setHistoryItems([]);
      try {
        localStorage.removeItem("history");
      } catch (err) {
        console.error("Error clearing localStorage:", err);
      }
    }
  };

  // Colors for different difficulty levels
  const difficultyColors = {
    easy: "#7bc043", // green
    medium: "#ffd166", // yellow
    hard: "#ff9f1c", // orange
    extreme: "#ff595e" // red
  };

  // Labels for different difficulty levels
  const difficultyLabels = {
    easy: "Easy (3 options)",
    medium: "Medium (4 options)",
    hard: "Hard (5 options)",
    extreme: "Extreme (6 options)"
  };

  // Calculate stats
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
        marginBottom: "2rem" 
      }}>
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
              <p style={{ 
                fontWeight: "bold", 
                color: item.correct ? "green" : "red",
                margin: "1rem 0",
                fontSize: "1.1rem"
              }}>
                {item.correct ? "✅ Correct!" : "❌ Incorrect"}
              </p>
              
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