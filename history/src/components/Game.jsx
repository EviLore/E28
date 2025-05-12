import { useState, useEffect } from "react";
import { getHistoryQuestion } from "../services/openai";

export default function Game({ resetTrigger }) {
  // State variables for managing the game
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [gameStarted, setGameStarted] = useState(false);

  // Load history from localStorage when component mounts
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }, []);

  // Reset game when resetTrigger changes
  useEffect(() => {
    // Reset to difficulty selection screen when Play is clicked
    if (resetTrigger > 0) {
      setGameStarted(false);
      setQuestionData(null);
      setSelectedAnswer(null);
    }
  }, [resetTrigger]);

  // Start the game with the selected difficulty
  const startGame = async () => {
    setGameStarted(true);
    await fetchQuestion();
  };

  // Fetch a new question from the API
  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const question = await getHistoryQuestion(difficulty);
      setQuestionData(question);
      setSelectedAnswer(null);
    } catch (err) {
      setError("Failed to load question. Please try again.");
      console.error("Error fetching question:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle when a user selects an answer
  const handleAnswer = (choice) => {
    if (selectedAnswer) return; // prevent double answering
    setSelectedAnswer(choice);

    // Create a record of this question and answer
    const result = {
      question: questionData.question,
      options: questionData.options,
      userAnswer: choice,
      answer: questionData.answer,
      correct: choice === questionData.answer,
      timestamp: new Date().toISOString(),
      explanation: questionData.explanation || "",
      category: questionData.category || "",
      region: questionData.region || "",
      difficulty: questionData.difficulty || difficulty
    };

    // Add to history and save to localStorage
    const newHistory = [...history, result];
    setHistory(newHistory);
    
    try {
      localStorage.setItem("history", JSON.stringify(newHistory));
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  // Update the selected difficulty
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  // Go back to the difficulty selection screen
  const resetGame = () => {
    setGameStarted(false);
    setQuestionData(null);
    setSelectedAnswer(null);
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
    easy: "Easy (Middle School) - 3 options",
    medium: "Medium (High School) - 4 options",
    hard: "Hard (College) - 5 options",
    extreme: "Extreme (PhD) - 6 options"
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
      
      {/* Show error message if there is one */}
      {error && <div style={{ 
        color: "red", 
        margin: "1rem 0", 
        textAlign: "center",
        padding: "0.5rem",
        backgroundColor: "#ffeeee",
        borderRadius: "4px"
      }}>{error}</div>}
      
      {/* Difficulty selection screen */}
      {!gameStarted ? (
        <div style={{ textAlign: "center" }}>
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
                {label}
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
              margin: "0", 
              color: "#666", 
              fontSize: "0.9rem", 
              lineHeight: "1.4" 
            }}>
              Test your knowledge of history with questions of varying difficulty. 
              Choose your difficulty level, then answer multiple choice questions. 
              Each difficulty adds more answer options, making it harder to guess!
            </p>
          </div>
        </div>
        
      /* Loading spinner */
      ) : !questionData ? (
        <div style={{ textAlign: "center", margin: "2rem" }}>
          <div className="loading-spinner" style={{ 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            animation: "spin 2s linear infinite",
            margin: "0 auto"
          }}></div>
          <p>Loading question...</p>
        </div>
      
      /* Question display */
      ) : (
        <div>
          {/* Difficulty indicator and reset button */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "1.5rem",
            backgroundColor: "#f8f8f8",
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #eee"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span 
                style={{ 
                  backgroundColor: difficultyColors[difficulty.toLowerCase()], 
                  padding: "0.25rem 0.5rem", 
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  color: (difficulty.toLowerCase() === "hard" || difficulty.toLowerCase() === "extreme") ? "#fff" : "#333"
                }}
              >
                {difficultyLabels[difficulty.toLowerCase()]}
              </span>
              
              {/* Add category badge */}
              {questionData.category && (
                <span style={{
                  backgroundColor: "#f0f0f0",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  color: "#555",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <span style={{ marginRight: "5px" }}>📚</span>
                  {questionData.category}
                </span>
              )}
              
              {/* Add region badge if available */}
              {questionData.region && questionData.region !== "World" && (
                <span style={{
                  backgroundColor: "#e8f4ff",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  color: "#0066cc",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <span style={{ marginRight: "5px" }}>🌍</span>
                  {questionData.region}
                </span>
              )}
            </div>
            <button 
              onClick={resetGame}
              style={{ 
                padding: "0.4rem 0.75rem", 
                fontSize: "0.9rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "#fff",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
            >
              Change Difficulty
            </button>
          </div>
          
          {/* Question and choices */}
          <div style={{
            marginBottom: "1.5rem",
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            border: "1px solid #eee"
          }}>
            <h2 style={{ 
              margin: "0 0 1.5rem 0",
              color: "#333",
              lineHeight: "1.4"
            }}>{questionData.question}</h2>
            
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {Object.entries(questionData.options).map(([letter, text]) => (
                <li key={letter} style={{ margin: "0.75rem 0" }}>
                  <button
                    onClick={() => handleAnswer(letter)}
                    disabled={!!selectedAnswer}
                    style={{
                      padding: "0.75rem 1rem",
                      width: "100%",
                      textAlign: "left",
                      fontSize: "1rem",
                      background:
                        selectedAnswer === letter
                          ? letter === questionData.answer
                            ? "linear-gradient(to right, #e6ffe6, #f8fff8)"
                            : "linear-gradient(to right, #ffe6e6, #fff8f8)"
                          : selectedAnswer && letter === questionData.answer
                          ? "linear-gradient(to right, #e6ffe6, #f8fff8)"
                          : "#fff",
                      border: selectedAnswer === letter
                        ? letter === questionData.answer
                          ? "1px solid #4CAF50"
                          : "1px solid #ff6b6b"
                        : selectedAnswer && letter === questionData.answer
                        ? "1px solid #4CAF50"
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      cursor: selectedAnswer ? "default" : "pointer",
                      transition: "all 0.2s ease",
                      position: "relative",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center"
                    }}
                    onMouseEnter={e => {
                      if (!selectedAnswer) {
                        e.currentTarget.style.backgroundColor = "#f9f9f9";
                        e.currentTarget.style.borderColor = "#ccc";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selectedAnswer) {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.borderColor = "#ddd";
                      }
                    }}
                  >
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      backgroundColor: selectedAnswer
                        ? (letter === questionData.answer)
                          ? "#4CAF50"
                          : (selectedAnswer === letter)
                            ? "#ff6b6b"
                            : "#e0e0e0"
                        : "#e0e0e0",
                      color: selectedAnswer
                        ? (letter === questionData.answer || selectedAnswer === letter)
                          ? "white"
                          : "#333"
                        : "#333",
                      borderRadius: "50%",
                      marginRight: "12px",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      flexShrink: 0
                    }}>{letter}</span>
                    <span>{text}</span>
                    {selectedAnswer && letter === questionData.answer && (
                      <span style={{ 
                        marginLeft: "auto", 
                        color: "#4CAF50", 
                        fontSize: "1.2rem"
                      }}>✓</span>
                    )}
                    {selectedAnswer && selectedAnswer === letter && letter !== questionData.answer && (
                      <span style={{ 
                        marginLeft: "auto", 
                        color: "#ff6b6b", 
                        fontSize: "1.2rem"
                      }}>✗</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Answer feedback */}
          {selectedAnswer && (
            <div style={{ 
              margin: "1.5rem 0", 
              padding: "1.25rem", 
              borderRadius: "8px", 
              backgroundColor: selectedAnswer === questionData.answer ? "#f1f8e9" : "#fee8e7",
              border: `1px solid ${selectedAnswer === questionData.answer ? "#aed581" : "#ffab91"}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <p style={{
                fontSize: "1.1rem",
                margin: "0 0 1rem 0",
                color: selectedAnswer === questionData.answer ? "#33691e" : "#c62828"
              }}>
                <strong style={{ 
                  marginRight: "8px", 
                  fontSize: "1.2rem" 
                }}>
                  {selectedAnswer === questionData.answer ? "✓" : "✗"}
                </strong>
                You answered: <strong>{selectedAnswer}</strong> ({questionData.options[selectedAnswer]}) —{" "}
                {selectedAnswer === questionData.answer ? "Correct." : "Wrong. The correct answer was " + questionData.answer}
              </p>
              
              {/* Show explanation if available */}
              {questionData.explanation && (
                <div style={{ 
                  margin: "1rem 0",
                  padding: "1rem",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  borderRadius: "6px",
                  border: "1px solid rgba(0, 0, 0, 0.05)"
                }}>
                  <strong style={{ display: "block", marginBottom: "0.5rem" }}>Explanation:</strong> 
                  <span style={{ lineHeight: "1.4" }}>{questionData.explanation}</span>
                </div>
              )}
              
              {/* Category and region info */}
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#666", 
                marginTop: "1rem",
                display: "flex",
                flexWrap: "wrap", 
                gap: "0.5rem" 
              }}>
                {questionData.category && <span>Category: {questionData.category}</span>}
                {questionData.region && (
                  <span>
                    Region: {questionData.region}
                  </span>
                )}
              </div>
              
              {/* Next question button */}
              <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
                <button 
                  onClick={fetchQuestion}
                  disabled={loading}
                  style={{ 
                    padding: "0.6rem 1.5rem", 
                    fontSize: "1rem",
                    backgroundColor: loading ? "#7a9cc7" : "#4a6fa5",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "default" : "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#3e5d8c";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#4a6fa5";
                      e.currentTarget.style.transform = "none";
                    }
                  }}
                >
                  {loading && (
                    <div className="loading-spinner-small" style={{ 
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      width: "14px",
                      height: "14px",
                      animation: "spin 1s linear infinite"
                    }}></div>
                  )}
                  {loading ? "Loading Question..." : "Next Question"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSS for the loading spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}