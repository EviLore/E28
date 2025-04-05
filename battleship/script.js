let game = {
    ships: [],
    guesses: 0,
    maxGuesses: 20,
  
    buildBoard() {
      const board = document.getElementById("board");
      board.innerHTML = "";
  
      for (let row = 1; row <= 6; row++) {
        for (let col = 1; col <= 6; col++) {
          const cell = document.createElement("div");
          cell.classList.add("cell");
          cell.dataset.row = row;
          cell.dataset.col = col;
  
          cell.addEventListener("click", () => {
            this.makeGuess(row, col, cell);
          });
  
          board.appendChild(cell);
        }
      }
    },
  
    async loadShips() {
      const response = await fetch("battleship.json");
      const data = await response.json();
      this.placeShips(data.ships);
    },
  
    placeShips(shipData) {
      shipData.forEach(ship => {
        const positions = [];
        let [col, row] = ship.coords;
  
        for (let i = 0; i < ship.size; i++) {
          const coord = ship.orientation === "horizontal"
            ? [col + i, row]
            : [col, row + i];
          positions.push(coord.join(","));
        }
  
        this.ships.push({
          ...ship,
          positions,
          hits: []
        });
      });
    },
  
    makeGuess(row, col, cell) {
      if (cell.classList.contains("hit") || cell.classList.contains("miss")) return;
  
      this.guesses++;
      let hitShip = null;
  
      for (let ship of this.ships) {
        for (let pos of ship.positions) {
          if (pos === `${col},${row}` && !ship.hits.includes(pos)) {
            ship.hits.push(pos);
            cell.classList.add("hit");
            hitShip = ship;
            break;
          }
        }
        if (hitShip) break;
      }
  
      if (hitShip) {
        if (hitShip.hits.length === hitShip.size) {
          hitShip.positions.forEach(pos => {
            const [c, r] = pos.split(",").map(Number);
            const sunkCell = document.querySelector(`[data-col="${c}"][data-row="${r}"]`);
            sunkCell.classList.add("sunk");
          });
          this.setStatus("You sunk a ship!");
        } else {
          this.setStatus("Hit!");
        }
      } else {
        cell.classList.add("miss");
        this.setStatus("Miss!");
      }
  
      if (this.isGameOver()) {
        this.revealShips(); // always reveal at end
      }
    },
  
    isGameOver() {
      const allSunk = this.ships.every(ship => ship.hits.length === ship.size);
      if (allSunk) {
        this.setStatus("You win! All ships sunk.");
        return true;
      }
      if (this.guesses >= this.maxGuesses) {
        this.setStatus("Game Over! Out of guesses.");
        return true;
      }
      return false;
    },
  
    revealShips() {
      this.ships.forEach(ship => {
        ship.positions.forEach(pos => {
          const [col, row] = pos.split(",").map(Number);
          const cell = document.querySelector(`[data-col="${col}"][data-row="${row}"]`);
          if (!cell.classList.contains("hit") && !cell.classList.contains("sunk")) {
            cell.classList.add("hit");
          }
        });
      });
    },
  
    setStatus(message) {
      document.getElementById("status").textContent = message;
    }
  };
  
  window.onload = () => {
    game.buildBoard();
    game.loadShips();
  };
  