import { useGameContext } from '../context/GameContext';

export default function Stats() {
  // Get game statistics from context
  const { stats } = useGameContext();

  // Calculate average guesses per win
  const averageGuesses = stats.gamesWon
    ? (stats.totalGuesses / stats.gamesWon).toFixed(2)
    : 'N/A';

  // Calculate win percentage
  const winPercentage = stats.gamesPlayed
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : 'N/A';

  // Styling
  const styles = {
    container: {
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    },
    statsCard: {
      marginTop: '20px',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#e3f2fd',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    statItem: {
      fontSize: '18px',
      margin: '15px 0',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px dashed #90caf9'
    },
    label: {
      fontWeight: 'bold'
    },
    value: {
      fontSize: '20px',
      color: '#0d47a1'
    }
  };

  // Display player statistics
  return (
    <div style={styles.container}>
      <h2>Player Stats</h2>
      
      <div style={styles.statsCard}>
        <div style={styles.statItem}>
          <span style={styles.label}>Games Won:</span>
          <span style={styles.value}>{stats.gamesWon}</span>
        </div>
        
        <div style={styles.statItem}>
          <span style={styles.label}>Games Lost:</span>
          <span style={styles.value}>{stats.gamesLost}</span>
        </div>
        
        <div style={styles.statItem}>
          <span style={styles.label}>Win Percentage:</span>
          <span style={styles.value}>{winPercentage}%</span>
        </div>
        
        <div style={styles.statItem}>
          <span style={styles.label}>Average Guesses (on Wins):</span>
          <span style={styles.value}>{averageGuesses}</span>
        </div>
      </div>
    </div>
  );
}