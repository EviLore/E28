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
    easy: "#e6ffe6", // light green
    medium: "#fff5e6", // light orange
    hard: "#ffe6e6", // light red
    extreme: "#e6e6ff" // light purple
  };

  // Labels for different difficulty levels
  const difficultyLabels = {
    easy: "Easy (3 options)",
    medium: "Medium (4 options)",
    hard: "Hard (5 options)",
    extreme: "Extreme (6 options)"
  };

  return (
    <div style={{ 
      padding: "1rem", 
      maxWidth: "1280px", 
      margin: "0 auto",
      boxSizing: "border-box"
    }}>
      {/* Header with title and clear button */}
      <h1 style={{ 
        textAlign: "center", 
        marginBottom: "1.5rem",
        fontSize: "2.5rem"
      }}>History Log</h1>
      
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
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Clear History
          </button>
        )}
      </div>
      
      {/* Show message when no history exists */}
      {historyItems.length === 0 ? (
        <div style={{ 
          padding: "2rem", 
          textAlign: "center", 
          backgroundColor: "#f9f9f9", 
          borderRadius: "8px",
          marginTop: "1rem" 
        }}>
          <p style={{ fontSize: "1.2rem", margin: 0 }}>No history yet. Play the game to see your results here.</p>
        </div>
      ) : (
        <div>
          {/* Summary statistics */}
          <div style={{ marginBottom: "1rem" }}>
            <p>You have answered {historyItems.length} questions total, with {historyItems.filter(item => item.correct).length} correct answers.</p>
          </div>
          
          {/* History items list */}
          {historyItems.map((item, index) => (
            <div key={index} style={{ 
              margin: "1rem 0", 
              padding: "1rem", 
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: item.correct ? "#e6ffe6" : "#ffe6e6" 
            }}>
              {/* Question header with difficulty */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0 }}>{item.question}</h3>
                {item.difficulty && (
                  <span style={{ 
                    backgroundColor: difficultyColors[item.difficulty.toLowerCase()] || "#f0f0f0", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    {difficultyLabels[item.difficulty.toLowerCase()] || item.difficulty}
                  </span>
                )}
              </div>
              
              {/* Answer options */}
              <div style={{ margin: "0.5rem 0" }}>
                {item.options && Object.entries(item.options).map(([letter, text]) => (
                  <div key={letter} style={{
                    padding: "0.5rem",
                    margin: "0.25rem 0",
                    backgroundColor: 
                      letter === item.userAnswer 
                        ? (item.correct ? "lightgreen" : "salmon")
                        : letter === item.answer && !item.correct
                          ? "#e6f7ff" 
                          : "transparent",
                    borderRadius: "4px"
                  }}>
                    <strong>{letter}:</strong> {text}
                    {letter === item.userAnswer && 
                      <span style={{ marginLeft: "0.5rem" }}>
                        (Your answer)
                      </span>
                    }
                    {letter === item.answer && !item.correct && 
                      <span style={{ marginLeft: "0.5rem" }}>
                        (Correct answer)
                      </span>
                    }
                  </div>
                ))}
              </div>
              
              {/* Result */}
              <p style={{ fontWeight: "bold", color: item.correct ? "green" : "red" }}>
                {item.correct ? "✅ Correct!" : "❌ Incorrect"}
              </p>
              
              {/* Explanation */}
              {item.explanation && (
                <div style={{ margin: "0.5rem 0", padding: "0.5rem", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
                  <strong>Explanation:</strong> {item.explanation}
                </div>
              )}
              
              {/* Metadata */}
              <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                <div>
                  {item.timestamp && formatDate(item.timestamp)}
                </div>
                <div>
                  {item.category && <span>Category: {item.category}</span>}
                  {item.region && (
                    <span style={{ marginLeft: item.category ? "1rem" : "0" }}>
                      Region: {item.region}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}