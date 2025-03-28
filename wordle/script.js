// Global settings
const rows = 6;
const columns = 5;

// DOM references
const debugModeCheckbox = document.getElementById('debug-mode');
const debugAnswerParagraph = document.getElementById('debug-answer');
const gameBoard = document.getElementById('game-board');
const keyboardContainer = document.getElementById('keyboard-container');
const playAgainBtn = document.getElementById('play-again');
const statsContainer = document.getElementById('stats-container');
const gameMessageEl = document.getElementById('game-message');

// Game state
let secretWord = '';
let currentRow = 0;
let currentGuess = '';
let gameEnded = false;
let keyStates = {};

// Prevent guesses until the word finishes loading
let loadingWord = true;

// Stats tracking
let stats = {
  wins: 0,
  losses: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

// Load stats from localStorage
function loadStats() {
  const stored = localStorage.getItem('wordleStats');
  if (stored) stats = JSON.parse(stored);
}

// Save stats to localStorage
function saveStats() {
  localStorage.setItem('wordleStats', JSON.stringify(stats));
}

// Update and display stats at the bottom
function displayStats() {
  statsContainer.innerHTML = `
    <p><strong>Wins:</strong> ${stats.wins}</p>
    <p><strong>Losses:</strong> ${stats.losses}</p>
    <p><strong>Guess Distribution (1st→6th):</strong></p>
    <p>${stats.guessDistribution.join(' | ')}</p>
  `;
}

// Fetch random 5-letter word
async function fetchSecretWord() {
  try {
    const res = await fetch('https://random-word-api.herokuapp.com/word?length=5');
    const data = await res.json();
    if (Array.isArray(data) && data.length) return data[0].toLowerCase();
    return 'apple';
  } catch {
    return 'apple';
  }
}

// Check if guessed word is valid
async function isValidWord(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return res.ok;
  } catch {
    return false;
  }
}

// Create 6×5 board
function createBoard() {
  gameBoard.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('game-row');
    for (let c = 0; c < columns; c++) {
      const tile = document.createElement('div');
      tile.classList.add('game-tile');
      tile.id = `row-${r}-col-${c}`;
      rowDiv.appendChild(tile);
    }
    gameBoard.appendChild(rowDiv);
  }
}

// Create on-screen keyboard
function createKeyboard() {
  keyboardContainer.innerHTML = '';
  const layout = [
    ['q','w','e','r','t','y','u','i','o','p','Del'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m','Enter']
  ];
  layout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('keyboard-row');
    row.forEach(keyVal => {
      const btn = document.createElement('button');
      btn.textContent = keyVal;
      btn.classList.add('key-button');
      btn.dataset.key = keyVal;
      btn.addEventListener('click', () => handleOnscreenKeyPress(keyVal));
      rowDiv.appendChild(btn);
    });
    keyboardContainer.appendChild(rowDiv);
  });
}

// Handle on-screen keyboard presses
function handleOnscreenKeyPress(key) {
  // If word is still loading, block guesses
  if (loadingWord) {
    showMessage('Still loading the secret word, please wait...');
    return;
  }
  if (gameEnded || currentRow >= rows) return;
  if (key === 'Enter') {
    submitGuess();
  } else if (key.toLowerCase() === 'del' || key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);
    updateTiles();
  } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
    currentGuess += key.toLowerCase();
    updateTiles();
  }
}

// Handle real keyboard presses
function handleKeydown(e) {
  // If word is still loading, block guesses
  if (loadingWord) {
    showMessage('Still loading the secret word, please wait...');
    return;
  }
  if (gameEnded || currentRow >= rows) return;

  const key = e.key;
  if (/^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
    currentGuess += key.toLowerCase();
    updateTiles();
  } else if (key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);
    updateTiles();
  } else if (key === 'Enter') {
    submitGuess();
  }
}

// Show a temporary message
function showMessage(msg, duration = 2000) {
  gameMessageEl.textContent = msg;
  gameMessageEl.style.opacity = 1;
  setTimeout(() => {
    gameMessageEl.style.opacity = 0;
    gameMessageEl.textContent = '';
  }, duration);
}

// Submit guess
async function submitGuess() {
  if (currentGuess.length !== 5) return;
  if (currentGuess === secretWord) {
    evaluateGuess(currentGuess, currentRow);
    return;
  }
  const valid = await isValidWord(currentGuess);
  if (!valid) {
    showMessage(`${currentGuess.toUpperCase()} is not a valid word!`);
    const rowDiv = document.querySelectorAll('.game-row')[currentRow];
    rowDiv.classList.add('shake');
    setTimeout(() => rowDiv.classList.remove('shake'), 500);
    return;
  }
  evaluateGuess(currentGuess, currentRow);
}

// Update tiles with current guess
function updateTiles() {
  for (let col = 0; col < columns; col++) {
    const tile = document.getElementById(`row-${currentRow}-col-${col}`);
    tile.textContent = currentGuess[col] || '';
  }
}

// Evaluate guess and animate
function evaluateGuess(guess, rowIndex) {
  const secretArr = secretWord.split('');
  const guessArr = guess.split('');
  const result = Array(columns).fill('wrong');

  for (let i = 0; i < columns; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i] = 'correct';
      secretArr[i] = null;
    }
  }
  for (let i = 0; i < columns; i++) {
    if (result[i] === 'correct') continue;
    const idx = secretArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = 'close';
      secretArr[idx] = null;
    }
  }
  guessArr.forEach((letter, i) => {
    const tile = document.getElementById(`row-${rowIndex}-col-${i}`);
    setTimeout(() => {
      tile.classList.add('flip', result[i]);
      updateKeyColor(letter, result[i]);
      refreshKeyboardColors();
    }, i * 300);
  });
  setTimeout(() => {
    currentRow++;
    currentGuess = '';
    if (guess === secretWord) {
      endGame(true);
    } else if (rowIndex === rows - 1) {
      endGame(false);
    }
  }, columns * 300 + 100);
}

// Update keyboard color state
function updateKeyColor(letter, newState) {
  const curr = keyStates[letter];
  if (!curr) {
    keyStates[letter] = newState;
  } else {
    if (curr === 'correct') return;
    if (curr === 'close' && newState === 'wrong') return;
    keyStates[letter] = newState;
  }
}

// Refresh on-screen keyboard colors
function refreshKeyboardColors() {
  document.querySelectorAll('.key-button').forEach(btn => {
    const letter = btn.dataset.key.toLowerCase();
    if (keyStates[letter]) {
      btn.classList.remove('correct', 'close', 'wrong');
      btn.classList.add(keyStates[letter]);
    }
  });
}

// End game
function endGame(playerWon) {
  gameEnded = true;
  if (playerWon) {
    stats.wins++;
    stats.guessDistribution[currentRow - 1]++;
    saveStats();
    showMessage('Congratulations! You guessed it!', 3000);
    const finalRow = document.querySelectorAll('.game-row')[currentRow - 1];
    finalRow.classList.add('bounce');
    setTimeout(() => finalRow.classList.remove('bounce'), 1000);
  } else {
    stats.losses++;
    saveStats();
    showMessage(`Out of guesses! The word was: ${secretWord.toUpperCase()}`, 3000);
  }
  displayStats();
  playAgainBtn.style.display = 'inline-block';
}

// Reset game
async function resetGame() {
  currentRow = 0;
  currentGuess = '';
  gameEnded = false;
  secretWord = '';
  keyStates = {};
  loadingWord = true; // block input until new word arrives
  playAgainBtn.style.display = 'none';

  createBoard();
  createKeyboard();
  showMessage('Loading word...');
  secretWord = await fetchSecretWord();
  showMessage('');
  loadingWord = false;

  showOrHideDebugAnswer();
}

// Toggle debug answer display
function showOrHideDebugAnswer() {
  if (debugModeCheckbox.checked) {
    debugAnswerParagraph.textContent = `Answer: ${secretWord.toUpperCase()}`;
    debugAnswerParagraph.style.display = 'block';
  } else {
    debugAnswerParagraph.style.display = 'none';
  }
}

// Init
window.addEventListener('load', async () => {
  loadStats();
  displayStats();
  createBoard();
  createKeyboard();

  // Indicate word is loading
  showMessage('Loading word...');
  secretWord = await fetchSecretWord();
  showMessage('');
  loadingWord = false; // now the word is ready

  // Only now do we allow actual guessing
  document.addEventListener('keydown', handleKeydown);
  debugModeCheckbox.addEventListener('change', showOrHideDebugAnswer);
  playAgainBtn.addEventListener('click', resetGame);
  showOrHideDebugAnswer();
});
