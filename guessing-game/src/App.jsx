import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Game from './components/Game';
import Settings from './components/Settings';
import Stats from './components/Stats';
import { GameProvider } from './context/GameContext';

function App() {
  // Get current location to highlight active nav link
  const location = useLocation();
  const path = location.pathname;

  // Styling
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    nav: {
      marginBottom: '1.5em',
      display: 'flex',
      justifyContent: 'center',
      gap: '10px'
    },
    link: {
      padding: '8px 15px',
      textDecoration: 'none',
      color: '#333',
      borderRadius: '4px',
      backgroundColor: '#e0e0e0'
    },
    activeLink: {
      backgroundColor: '#007bff',
      color: 'white',
      fontWeight: 'bold'
    }
  };

  return (
    // Wrap entire app in GameProvider for state management
    <GameProvider>
      <div style={styles.container}>
        <h1 style={{ textAlign: 'center' }}>Guessing Game</h1>
        {/* Navigation links */}
        <nav style={styles.nav}>
          <Link 
            to="/game" 
            style={{
              ...styles.link,
              ...(path === "/game" || path === "/" ? styles.activeLink : {})
            }}
          >
            Game
          </Link>
          <Link 
            to="/settings" 
            style={{
              ...styles.link,
              ...(path === "/settings" ? styles.activeLink : {})
            }}
          >
            Settings
          </Link>
          <Link 
            to="/stats" 
            style={{
              ...styles.link,
              ...(path === "/stats" ? styles.activeLink : {})
            }}
          >
            Stats
          </Link>
        </nav>
        {/* Route configuration */}
        <Routes>
          <Route path="/game" element={<Game />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Game />} />
        </Routes>
      </div>
    </GameProvider>
  );
}

export default App;
