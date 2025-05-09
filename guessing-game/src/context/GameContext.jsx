import { createContext, useContext, useState } from 'react';

// Create a context for sharing game state across components
const GameContext = createContext();

export function GameProvider({ children }) {
  // Game settings state with default values
  const [settings, setSettings] = useState({
    min: 1,
    max: 100,
    maxGuesses: 5,
  });

  // Game statistics state
  const [stats, setStats] = useState({
    gamesWon: 0,
    gamesLost: 0,
    totalGuesses: 0,
    gamesPlayed: 0,
  });

  // Update stats when a game ends (win or lose)
  const updateStats = (guessesUsed, won = true) => {
    setStats((prev) => ({
      gamesWon: prev.gamesWon + (won ? 1 : 0),
      gamesLost: prev.gamesLost + (won ? 0 : 1),
      totalGuesses: prev.totalGuesses + guessesUsed,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  };

  // Provide context values to all child components
  return (
    <GameContext.Provider value={{ settings, setSettings, stats, updateStats }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to access game context in any component
export function useGameContext() {
  return useContext(GameContext);
}