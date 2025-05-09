import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function Settings() {
  const { settings, setSettings } = useGameContext();

  // Form state for settings values
  const [min, setMin] = useState(settings.min);
  const [max, setMax] = useState(settings.max);
  const [maxGuesses, setMaxGuesses] = useState(settings.maxGuesses);
  const [message, setMessage] = useState('');

  // Styling
  const styles = {
    container: {
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    },
    formGroup: {
      margin: '15px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    label: {
      marginBottom: '5px',
      fontWeight: 'bold'
    },
    input: {
      padding: '8px 12px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      width: '100px'
    },
    button: {
      padding: '8px 20px',
      fontSize: '16px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '15px'
    },
    message: {
      marginTop: '15px',
      padding: '8px',
      borderRadius: '4px',
      fontWeight: 'bold',
      backgroundColor: '#e8f5e9',
      color: '#2e7d32'
    },
    error: {
      backgroundColor: '#ffebee',
      color: '#c62828'
    }
  };

  // Validates and saves settings to context
  const handleSave = () => {
    if (min >= max) {
      setMessage('Minimum must be less than maximum.');
      return;
    }
    if (maxGuesses <= 0) {
      setMessage('Max guesses must be greater than 0.');
      return;
    }
    setSettings({ min, max, maxGuesses });
    setMessage('Settings saved!');
  };

  // Check if current message is an error
  const isError = message && !message.includes('Settings saved');

  // Settings form UI
  return (
    <div style={styles.container}>
      <h2>Game Settings</h2>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Minimum Number:
        </label>
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          style={styles.input}
        />
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Maximum Number:
        </label>
        <input
          type="number"
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          style={styles.input}
        />
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Max Guesses Allowed:
        </label>
        <input
          type="number"
          value={maxGuesses}
          onChange={(e) => setMaxGuesses(Number(e.target.value))}
          style={styles.input}
        />
      </div>
      
      <button onClick={handleSave} style={styles.button}>Save Settings</button>
      
      {message && (
        <p style={{ 
          ...styles.message, 
          ...(isError ? styles.error : {}) 
        }}>
          {message}
        </p>
      )}
    </div>
  );
}