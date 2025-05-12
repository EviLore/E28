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
    easy: "#e6ffe6", // light green
    medium: "#fff5e6", // light orange
    hard: "#ffe6e6", // light red
    extreme: "#e6e6ff" // light purple
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
      maxWidth: "1280px", 
      margin: "0 auto",
      boxSizing: "border-box"
    }}>
      <h1 style={{ 
        textAlign: "center", 
        marginBottom: "1.5rem",
        fontSize: "2.5rem"
      }}>History Nerd</h1>
      
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
          <h2 style={{ marginBottom: "1.5rem" }}>Select Difficulty</h2>
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
                  transition: "all 0.2s ease"
                }}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: "2.5rem" }}>
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
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {loading ? "Loading..." : "Start Game"}
            </button>
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
            marginBottom: "1rem"
          }}>
            <div>
              <span 
                style={{ 
                  backgroundColor: difficultyColors[difficulty.toLowerCase()], 
                  padding: "0.25rem 0.5rem", 
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}
              >
                {difficultyLabels[difficulty.toLowerCase()]}
              </span>
            </div>
            <button 
              onClick={resetGame}
              style={{ 
                padding: "0.25rem 0.5rem", 
                fontSize: "0.9rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Change Difficulty
            </button>
          </div>
          
          {/* Question and choices */}
          <h2>{questionData.question}</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {Object.entries(questionData.options).map(([letter, text]) => (
              <li key={letter} style={{ margin: "0.5rem 0" }}>
                <button
                  onClick={() => handleAnswer(letter)}
                  disabled={!!selectedAnswer}
                  style={{
                    padding: "0.5rem 1rem",
                    width: "100%",
                    textAlign: "left",
                    fontSize: "1rem",
                    background:
                      selectedAnswer === letter
                        ? letter === questionData.answer
                          ? "lightgreen"
                          : "salmon"
                        : selectedAnswer && letter === questionData.answer
                        ? "lightgreen"
                        : "",
                    border: "1px solid #ccc",
                    borderRadius: "4px"
                  }}
                >
                  <strong>{letter}:</strong> {text}
                </button>
              </li>
            ))}
          </ul>

          {/* Answer feedback */}
          {selectedAnswer && (
            <div style={{ 
              margin: "1rem 0", 
              padding: "1rem", 
              borderRadius: "8px", 
              backgroundColor: selectedAnswer === questionData.answer ? "#e6ffe6" : "#ffe6e6"
            }}>
              <p>
                You answered: <strong>{selectedAnswer}</strong> ({questionData.options[selectedAnswer]}) —{" "}
                {selectedAnswer === questionData.answer ? "Correct!" : "Wrong! The correct answer was " + questionData.answer}
              </p>
              
              {/* Show explanation if available */}
              {questionData.explanation && (
                <div style={{ margin: "1rem 0" }}>
                  <strong>Explanation:</strong> {questionData.explanation}
                </div>
              )}
              
              {/* Category and region info */}
              <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "1rem" }}>
                {questionData.category && <span>Category: {questionData.category}</span>}
                {questionData.region && (
                  <span style={{ marginLeft: questionData.category ? "1rem" : "0" }}>
                    Region: {questionData.region}
                  </span>
                )}
              </div>
              
              {/* Next question button */}
              <button 
                onClick={fetchQuestion}
                style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
              >
                Next Question
              </button>
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