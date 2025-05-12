import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getHistoryQuestion } from "../services/openai";

export default function Game({ setGameInProgress }) {
  // Navigation hook for returning to home
  const navigate = useNavigate();
  // Get search params for difficulty
  const location = useLocation();
  
  // State variables for managing the game
  const [questionData, setQuestionData] = useState(null);  // Current question data
  const [selectedAnswer, setSelectedAnswer] = useState(null);  // User's selected answer
  const [history, setHistory] = useState([]);  // History of answered questions
  const [loading, setLoading] = useState(false);  // Loading state for API calls
  const [error, setError] = useState(null);  // Error messages
  const [difficulty, setDifficulty] = useState("medium");  // Selected difficulty level
  const [points, setPoints] = useState(0);  // Player's total points
  const [streak, setStreak] = useState(0);  // Current streak of correct answers
  const [currentDifficultyStreak, setCurrentDifficultyStreak] = useState("");  // Current difficulty being streaked

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

  // Save the current game state to localStorage
  const saveGameState = () => {
    try {
      localStorage.setItem("currentGameState", JSON.stringify({
        questionData,
        selectedAnswer,
        difficulty
      }));
    } catch (err) {
      console.error("Error saving game state:", err);
    }
  };

  // Effect to save game state when relevant state changes
  useEffect(() => {
    if (questionData) {
      saveGameState();
    }
  }, [questionData, selectedAnswer, difficulty]);

  // Load saved game data and get difficulty from URL when component mounts
  useEffect(() => {
    try {
      // Get current URL parameters
      const params = new URLSearchParams(location.search);
      const difficultyParam = params.get("difficulty");
      
      // First check if there's a difficulty in the URL (this takes precedence)
      if (difficultyParam && ["easy", "medium", "hard", "extreme"].includes(difficultyParam)) {
        // Get previously saved game state
        const savedGameState = localStorage.getItem("currentGameState");
        let previousDifficulty = null;
        
        if (savedGameState) {
          try {
            const parsedState = JSON.parse(savedGameState);
            previousDifficulty = parsedState.difficulty;
          } catch (err) {
            console.error("Error parsing saved game state:", err);
          }
        }
        
        // Set the current difficulty from URL
        setDifficulty(difficultyParam);
        localStorage.setItem("currentGameDifficulty", difficultyParam);
        
        // If there's a difficulty change, fetch a new question
        if (previousDifficulty !== difficultyParam) {
          // Clean up any previous game state
          localStorage.removeItem("currentGameState");
          setQuestionData(null);
          setSelectedAnswer(null);
          // Fetch a new question with the new difficulty
          fetchQuestion(difficultyParam);
        } else {
          // Same difficulty, try to restore game state
          if (savedGameState) {
            try {
              const parsedState = JSON.parse(savedGameState);
              setQuestionData(parsedState.questionData);
              setSelectedAnswer(parsedState.selectedAnswer);
            } catch (err) {
              console.error("Error restoring game state:", err);
              fetchQuestion(difficultyParam);
            }
          } else {
            // No saved state, fetch new question
            fetchQuestion(difficultyParam);
          }
        }
      } else {
        // No difficulty in URL, check localStorage
        const storedDifficulty = localStorage.getItem("currentGameDifficulty");
        const savedGameState = localStorage.getItem("currentGameState");
        
        if (storedDifficulty) {
          setDifficulty(storedDifficulty);
          
          // Try to restore game state if available
          if (savedGameState) {
            try {
              const parsedState = JSON.parse(savedGameState);
              setQuestionData(parsedState.questionData);
              setSelectedAnswer(parsedState.selectedAnswer);
            } catch (err) {
              console.error("Error restoring game state:", err);
              fetchQuestion(storedDifficulty);
            }
          } else {
            // No saved state, fetch new question
            fetchQuestion(storedDifficulty);
          }
        } else {
          // Default to medium if no saved difficulty
          setDifficulty("medium");
          localStorage.setItem("currentGameDifficulty", "medium");
          fetchQuestion("medium");
        }
      }
      
      // Mark game in progress
      if (setGameInProgress) {
        setGameInProgress(true);
      }
      
      // Load other game data
      loadGameData();
    } catch (err) {
      console.error("Error loading game:", err);
      // Fallback to default difficulty
      setDifficulty("medium");
      fetchQuestion("medium");
    }
  }, [location.search, setGameInProgress]);

  // Separate function to load game data from localStorage
  const loadGameData = () => {
    try {
      // Load question history
      const savedHistory = localStorage.getItem("history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      
      // Load accumulated points
      const savedPoints = localStorage.getItem("points");
      if (savedPoints) {
        setPoints(parseInt(savedPoints, 10));
      }
      
      // Load current streak
      const savedStreak = localStorage.getItem("streak");
      if (savedStreak) {
        setStreak(parseInt(savedStreak, 10));
      }
      
      // Load current difficulty streak
      const savedDifficultyStreak = localStorage.getItem("currentDifficultyStreak");
      if (savedDifficultyStreak) {
        setCurrentDifficultyStreak(savedDifficultyStreak);
      }
    } catch (err) {
      console.error("Error loading game data:", err);
    }
  };

  // Fetch a new question from the OpenAI API
  const fetchQuestion = async (difficultyToUse = null) => {
    setLoading(true);
    setError(null);
    
    // Use the provided difficulty or fall back to state
    const actualDifficulty = difficultyToUse || difficulty;
    
    try {
      const question = await getHistoryQuestion(actualDifficulty);
      setQuestionData(question);
      setSelectedAnswer(null);  // Reset selected answer for new question
    } catch (err) {
      setError("Failed to load question. Please try again.");
      console.error("Error fetching question:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle when a user selects an answer
  const handleAnswer = (choice) => {
    if (selectedAnswer) return; // Prevent double answering
    setSelectedAnswer(choice);

    const isCorrect = choice === questionData.answer;
    const pointValue = difficultyPoints[difficulty.toLowerCase()];
    let pointsEarned = 0;
    let newStreak = 0;
    let streakBonus = 0;
    
    if (isCorrect) {
      // Calculate streak bonus - always give +1 bonus after first correct answer
      if (currentDifficultyStreak === difficulty) {
        newStreak = streak + 1;  // Increment streak counter
        streakBonus = newStreak > 1 ? 1 : 0;  // +1 bonus for any consecutive correct answer
      } else {
        // Reset streak if difficulty changed
        newStreak = 1;
        streakBonus = 0;
      }
      
      // Calculate total points earned for this question
      pointsEarned = pointValue + streakBonus;
      setPoints(prevPoints => prevPoints + pointsEarned);
      setStreak(newStreak);
      setCurrentDifficultyStreak(difficulty);
    } else {
      // Reset streak on wrong answer and deduct points
      pointsEarned = -pointValue;
      setPoints(prevPoints => Math.max(0, prevPoints + pointsEarned)); // Prevent negative points
      setStreak(0);
      setCurrentDifficultyStreak("");
    }

    // Create a record of this question and answer for history
    const result = {
      question: questionData.question,
      options: questionData.options,
      userAnswer: choice,
      answer: questionData.answer,
      correct: isCorrect,
      timestamp: new Date().toISOString(),
      explanation: questionData.explanation || "",
      category: questionData.category || "",
      region: questionData.region || "",
      difficulty: questionData.difficulty || difficulty,
      pointsEarned: pointsEarned,
      pointsTotal: Math.max(0, points + pointsEarned),
      streak: isCorrect ? newStreak : 0
    };

    // Add to history and save all game data to localStorage
    const newHistory = [...history, result];
    setHistory(newHistory);
    
    try {
      localStorage.setItem("history", JSON.stringify(newHistory));
      localStorage.setItem("points", String(Math.max(0, points + pointsEarned)));
      localStorage.setItem("streak", String(isCorrect ? newStreak : 0));
      localStorage.setItem("currentDifficultyStreak", isCorrect ? difficulty : "");
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  // Return to home/difficulty selection
  const returnToHome = () => {
    // Clear game in progress status
    try {
      localStorage.removeItem("currentGameDifficulty");
      localStorage.removeItem("currentGameState");
      // Update game in progress state in parent component
      if (setGameInProgress) {
        setGameInProgress(false);
      }
    } catch (err) {
      console.error("Error clearing game state:", err);
    }
    
    navigate('/home');
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
        marginBottom: "1.5rem", 
        backgroundColor: "#f8f8f8",
        padding: "0.75rem",
        borderRadius: "6px",
        border: "1px solid #eee",
        display: "flex",
        justifyContent: "center",
        gap: "2rem"
      }}>
        <div>
          <span style={{ fontWeight: "bold", color: "#333" }}>Points:</span> 
          <span style={{ 
            fontSize: "1.2rem", 
            marginLeft: "0.5rem", 
            color: "#4a6fa5", 
            fontWeight: "bold" 
          }}>{points}</span>
        </div>
        {streak > 0 && (
          <div>
            <span style={{ fontWeight: "bold", color: "#333" }}>Streak:</span> 
            <span style={{ 
              fontSize: "1.2rem", 
              marginLeft: "0.5rem", 
              color: "#4CAF50", 
              fontWeight: "bold" 
            }}>{streak}</span>
            {streak > 1 && (
              <span style={{ 
                color: "#4CAF50", 
                marginLeft: "0.5rem", 
                fontSize: "0.9rem" 
              }}>(+1 bonus)</span>
            )}
          </div>
        )}
      </div>
      
      {/* Show error message if there is one */}
      {error && <div style={{ 
        color: "red", 
        margin: "1rem 0", 
        textAlign: "center",
        padding: "0.5rem",
        backgroundColor: "#ffeeee",
        borderRadius: "4px"
      }}>{error}</div>}
      
      {/* Loading spinner when fetching question */}
      {loading && !questionData ? (
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
      ) : questionData ? (
        <div>
          {/* Difficulty indicator and return to home button */}
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
                  {questionData.region}
                </span>
              )}
            </div>
            <button 
              onClick={returnToHome}
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
              Return to Home
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
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
                
                <div style={{
                  backgroundColor: "#fff",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: selectedAnswer === questionData.answer ? "#4CAF50" : "#ff6b6b",
                  border: `1px solid ${selectedAnswer === questionData.answer ? "#d7f3d7" : "#ffe0e0"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.2rem" }}>Points</span>
                  {selectedAnswer === questionData.answer ? (
                    <span>
                      +{difficultyPoints[difficulty.toLowerCase()]}
                      {streak > 1 && (
                        <span style={{ fontSize: "0.8rem", color: "#4CAF50" }}> +1 bonus</span>
                      )}
                    </span>
                  ) : (
                    <span>-{difficultyPoints[difficulty.toLowerCase()]}</span>
                  )}
                </div>
              </div>
              
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
      ) : (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>No question available. Please return to the home screen and start a new game.</p>
          <button
            onClick={returnToHome}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#4a6fa5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Return to Home
          </button>
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