import { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

export default function Game() {
  const { settings, updateStats } = useGameContext();

  // Game state variables
  const [target, setTarget] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [remaining, setRemaining] = useState(settings.maxGuesses);
  const [gameOver, setGameOver] = useState(false);

  // Styling
  const styles = {
    container: {
      textAlign: 'center'
    },
    inputGroup: {
      margin: '20px 0',
      display: 'flex',
      justifyContent: 'center',
      gap: '10px'
    },
    input: {
      padding: '8px 12px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      width: '120px'
    },
    button: {
      padding: '8px 16px',
      fontSize: '16px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    playAgainButton: {
      padding: '8px 16px',
      fontSize: '16px',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    message: {
      fontSize: '18px',
      margin: '15px 0',
      fontWeight: 'bold'
    },
    remaining: {
      color: '#FF9800',
      fontWeight: 'bold'
    }
  };

  // Start game on mount or when settings change
  useEffect(() => {
    startNewGame();
  }, [settings]);

  // Creates a new game with random target number
  const startNewGame = () => {
    const newTarget = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
    setTarget(newTarget);
    setGuess('');
    setMessage('');
    setRemaining(settings.maxGuesses);
    setGameOver(false);
  };

  // Handles user guess submission and game logic
  const handleGuess = () => {
    const num = parseInt(guess, 10);
    if (isNaN(num)) {
      setMessage('Please enter a valid number.');
      return;
    }

    if (num === target) {
      setMessage(`🎉 Correct! You win in ${settings.maxGuesses - remaining + 1} guess(es)!`);
      updateStats(settings.maxGuesses - remaining + 1, true);
      setGameOver(true);
    } else if (remaining <= 1) {
      setMessage(`You lose! The number was ${target}.`);
      updateStats(settings.maxGuesses, false);
      setGameOver(true);
    } else {
      setMessage(num < target ? 'Too low!' : 'Too high!');
      setRemaining((r) => r - 1);
    }

    setGuess('');
  };

  // UI rendering
  return (
    <div style={styles.container}>
      <h2>Guess the number:</h2>
      {!gameOver && (
        <div style={styles.inputGroup}>
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={`${settings.min} - ${settings.max}`}
            style={styles.input}
          />
          <button onClick={handleGuess} style={styles.button}>Guess</button>
        </div>
      )}
      <p style={styles.message}>{message}</p>
      {!gameOver && (
        <p style={styles.remaining}>Remaining guesses: {remaining}</p>
      )}
      {gameOver && (
        <button onClick={startNewGame} style={styles.playAgainButton}>Play Again</button>
      )}
    </div>
  );
}