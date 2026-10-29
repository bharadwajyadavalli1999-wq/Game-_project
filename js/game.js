/**
 * Main Game Controller for Tic-Tac-Toe Deluxe
 * Manages game loop, player turns, UI updates, winning lines, undo, and symbols.
 */

const SYMBOL_SETS = {
  classic: { X: '✕', O: '◯' },
  cosmic: { X: '🚀', O: '🛸' },
  elements: { X: '⚡', O: '🔥' },
  royalty: { X: '👑', O: '💎' },
  pets: { X: '🐱', O: '🐶' }
};

class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.startingPlayer = 'X';
    this.gameMode = 'beginner'; // 'beginner' | 'advanced' | 'pvp'
    this.isGameOver = false;
    this.isAiThinking = false;
    this.symbolPack = localStorage.getItem('tictactoe_symbols') || 'classic';
    this.moveHistory = []; // Stack for undo functionality

    this.scores = this.loadScores();

    this.dom = {
      cells: document.querySelectorAll('.cell'),
      board: document.getElementById('board'),
      winLineSvg: document.getElementById('win-line-svg'),
      winLine: document.getElementById('win-line'),
      statusBanner: document.getElementById('status-banner'),
      statusText: document.getElementById('status-text'),
      statusIcon: document.getElementById('status-icon'),
      scoreX: document.getElementById('score-x'),
      scoreO: document.getElementById('score-o'),
      scoreTies: document.getElementById('score-ties'),
      cardX: document.getElementById('score-card-x'),
      cardO: document.getElementById('score-card-o'),
      turnX: document.getElementById('turn-x'),
      turnO: document.getElementById('turn-o'),
      labelX: document.getElementById('label-x'),
      labelO: document.getElementById('label-o'),
      avatarO: document.getElementById('avatar-o'),
      modeTabs: document.querySelectorAll('.mode-tab'),
      hintBtn: document.getElementById('hint-btn'),
      undoBtn: document.getElementById('undo-btn'),
      restartBtn: document.getElementById('restart-btn'),
      firstTurnBtn: document.getElementById('first-turn-btn'),
      firstTurnLabel: document.getElementById('first-turn-label'),
      symbolSelect: document.getElementById('symbol-pack'),
      resetScoreBtn: document.getElementById('reset-score-btn'),
      soundBtn: document.getElementById('sound-btn'),
      soundOnIcon: document.querySelector('.sound-on-icon'),
      soundOffIcon: document.querySelector('.sound-off-icon'),
      howToPlayBtn: document.getElementById('how-to-play-btn'),
      helpModal: document.getElementById('help-modal'),
      closeModalBtn: document.getElementById('close-modal-btn'),
      modalOkBtn: document.getElementById('modal-ok-btn'),
      aiInsight: document.getElementById('ai-insight'),
      insightBadge: document.getElementById('insight-badge'),
      insightDesc: document.getElementById('insight-desc')
    };

    this.init();
  }

  loadScores() {
    const saved = localStorage.getItem('tictactoe_scores_deluxe');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return { X: 0, O: 0, ties: 0 };
  }

  saveScores() {
    localStorage.setItem('tictactoe_scores_deluxe', JSON.stringify(this.scores));
  }

  init() {
    this.bindEvents();
    this.updateScoreboardDisplay();
    this.syncSoundIcon();
    this.applySymbolPack(this.symbolPack, false);
    this.resetMatch(false);
  }

  bindEvents() {
    // Cell clicks
    this.dom.cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const index = parseInt(cell.dataset.index, 10);
        this.handleCellClick(index);
      });
    });

    // Game Mode Tabs
    this.dom.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        this.setGameMode(mode);
        window.soundEngine.playClickSound();
      });
    });

    // Action buttons
    this.dom.restartBtn.addEventListener('click', () => {
      window.soundEngine.playClickSound();
      this.resetMatch();
    });

    this.dom.hintBtn.addEventListener('click', () => {
      this.handleHint();
    });

    this.dom.undoBtn.addEventListener('click', () => {
      this.handleUndo();
    });

    this.dom.firstTurnBtn.addEventListener('click', () => {
      window.soundEngine.playClickSound();
      this.startingPlayer = this.startingPlayer === 'X' ? 'O' : 'X';
      this.dom.firstTurnLabel.textContent = `${this.startingPlayer} Starts`;
      this.resetMatch();
    });

    // Symbol Pack Selector
    this.dom.symbolSelect.value = this.symbolPack;
    this.dom.symbolSelect.addEventListener('change', (e) => {
      this.applySymbolPack(e.target.value);
    });

    // Reset Scores
    this.dom.resetScoreBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all game scores to 0?')) {
        this.scores = { X: 0, O: 0, ties: 0 };
        this.saveScores();
        this.updateScoreboardDisplay();
        window.soundEngine.playClickSound();
      }
    });

    // Sound toggle
    this.dom.soundBtn.addEventListener('click', () => {
      window.soundEngine.toggleMute();
      this.syncSoundIcon();
    });

    // Modal dialog
    const openModal = () => {
      this.dom.helpModal.classList.remove('hidden');
      window.soundEngine.playClickSound();
    };
    const closeModal = () => {
      this.dom.helpModal.classList.add('hidden');
      window.soundEngine.playClickSound();
    };

    this.dom.howToPlayBtn.addEventListener('click', openModal);
    this.dom.closeModalBtn.addEventListener('click', closeModal);
    this.dom.modalOkBtn.addEventListener('click', closeModal);
    this.dom.helpModal.addEventListener('click', (e) => {
      if (e.target === this.dom.helpModal) closeModal();
    });
  }

  syncSoundIcon() {
    const isMuted = window.soundEngine.isMuted();
    if (isMuted) {
      this.dom.soundOnIcon.classList.add('hidden');
      this.dom.soundOffIcon.classList.remove('hidden');
    } else {
      this.dom.soundOnIcon.classList.remove('hidden');
      this.dom.soundOffIcon.classList.add('hidden');
    }
  }

  applySymbolPack(packKey, reRender = true) {
    if (SYMBOL_SETS[packKey]) {
      this.symbolPack = packKey;
      localStorage.setItem('tictactoe_symbols', packKey);
      if (reRender) {
        this.renderBoard();
        window.soundEngine.playClickSound();
      }
    }
  }

  setGameMode(mode) {
    this.gameMode = mode;

    this.dom.modeTabs.forEach(t => {
      const active = t.dataset.mode === mode;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });

    if (mode === 'beginner') {
      this.dom.labelO.textContent = 'Novice AI (O)';
      this.dom.avatarO.textContent = '🤖';
      this.dom.insightBadge.textContent = '🌱 Beginner Mode Active';
      this.dom.insightDesc.textContent =
        'The AI plays friendly, relaxed moves with frequent mistakes. Perfect for learning winning combinations!';
    } else if (mode === 'advanced') {
      this.dom.labelO.textContent = 'Master AI (O)';
      this.dom.avatarO.textContent = '⚡';
      this.dom.insightBadge.textContent = '⚡ Advanced Minimax AI Active';
      this.dom.insightDesc.textContent =
        'Mastermind AI evaluating all move paths in real-time. Mathematically unbeatable—can you hold it to a draw?';
    } else {
      this.dom.labelO.textContent = 'Player 2 (O)';
      this.dom.avatarO.textContent = '👤';
      this.dom.insightBadge.textContent = '👥 2-Player Local Pass & Play';
      this.dom.insightDesc.textContent =
        'Pass & play on the same screen with a friend or colleague. Best of luck to both!';
    }

    this.resetMatch();
  }

  resetMatch(notify = true) {
    this.board = Array(9).fill(null);
    this.currentPlayer = this.startingPlayer;
    this.isGameOver = false;
    this.isAiThinking = false;
    this.moveHistory = [];

    // Reset UI
    this.clearWinningLine();
    this.clearHints();
    this.renderBoard();
    this.updateTurnIndicators();
    this.dom.undoBtn.disabled = true;
    this.dom.hintBtn.disabled = false;

    this.dom.statusBanner.className = 'status-banner';

    if (this.gameMode !== 'pvp' && this.currentPlayer === 'O') {
      this.dom.statusIcon.textContent = '🤖';
      this.dom.statusText.textContent = 'AI is playing first...';
      this.triggerAiTurn();
    } else {
      this.dom.statusIcon.textContent = '🎮';
      this.dom.statusText.textContent =
        this.gameMode === 'pvp'
          ? `Player ${this.currentPlayer}'s turn to start!`
          : 'Your turn! Tap any open cell.';
    }
  }

  handleCellClick(index) {
    if (this.isGameOver || this.isAiThinking || this.board[index] !== null) {
      return;
    }

    // Save state for undo
    this.saveHistorySnapshot();

    // Make player move
    this.makeMove(index, this.currentPlayer);

    const winResult = TicTacToeAI.checkWinner(this.board);

    if (winResult) {
      this.handleGameOver(winResult);
      return;
    }

    // Switch turn
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    this.updateTurnIndicators();

    // Check if AI needs to move
    if (this.gameMode !== 'pvp' && this.currentPlayer === 'O') {
      this.triggerAiTurn();
    } else {
      this.dom.statusIcon.textContent = '🎯';
      this.dom.statusText.textContent = `Player ${this.currentPlayer}'s turn!`;
    }
  }

  triggerAiTurn() {
    this.isAiThinking = true;
    this.dom.hintBtn.disabled = true;
    this.dom.statusIcon.textContent = '⏳';
    this.dom.statusText.textContent =
      this.gameMode === 'advanced'
        ? 'Advanced AI is calculating optimal move...'
        : 'Beginner AI is thinking...';

    // Natural delay so move doesn't feel instantaneous/jarring
    const delay = this.gameMode === 'advanced' ? 450 : 380;

    setTimeout(() => {
      if (this.isGameOver) {
        this.isAiThinking = false;
        return;
      }

      let move = null;
      if (this.gameMode === 'beginner') {
        move = TicTacToeAI.getBeginnerMove(this.board, 'O', 'X');
      } else {
        move = TicTacToeAI.getAdvancedMove(this.board, 'O', 'X');
      }

      if (move !== null) {
        this.makeMove(move, 'O');

        const winResult = TicTacToeAI.checkWinner(this.board);
        if (winResult) {
          this.handleGameOver(winResult);
        } else {
          this.currentPlayer = 'X';
          this.updateTurnIndicators();
          this.dom.statusIcon.textContent = '🎮';
          this.dom.statusText.textContent = 'Your turn! Place your symbol.';
          this.dom.hintBtn.disabled = false;
        }
      }

      this.isAiThinking = false;
    }, delay);
  }

  makeMove(index, player) {
    this.board[index] = player;
    this.clearHints();
    this.renderBoard();
    this.dom.undoBtn.disabled = false;

    window.soundEngine.playMoveSound(player);
  }

  handleGameOver(result) {
    this.isGameOver = true;
    this.dom.hintBtn.disabled = true;

    if (result.winner === 'tie') {
      this.scores.ties++;
      this.dom.statusBanner.className = 'status-banner draw-state';
      this.dom.statusIcon.textContent = '🤝';
      this.dom.statusText.textContent = "It's a Draw! Both sides played resiliently.";
      window.soundEngine.playTieSound();
    } else {
      const winner = result.winner;
      this.scores[winner]++;
      this.highlightWinningCombo(result.combo);

      if (winner === 'X') {
        this.dom.statusBanner.className = 'status-banner win-state';
        this.dom.statusIcon.textContent = '🏆';
        this.dom.statusText.textContent =
          this.gameMode === 'pvp'
            ? 'Player X Wins the Match! 🎉'
            : 'Victorious! You outsmarted the AI! 🏆';
        window.confettiManager.burst(90);
        window.soundEngine.playWinSound();
      } else {
        this.dom.statusBanner.className = 'status-banner ai-win-state';
        this.dom.statusIcon.textContent = '🤖';
        this.dom.statusText.textContent =
          this.gameMode === 'pvp'
            ? 'Player O Wins the Match! 🎉'
            : this.gameMode === 'advanced'
            ? 'Advanced AI wins! Minimax remains undefeated.'
            : 'AI won this round! Tap restart to try again.';
        window.soundEngine.playWinSound();
      }
    }

    this.saveScores();
    this.updateScoreboardDisplay();
    this.updateTurnIndicators(true);
  }

  highlightWinningCombo(combo) {
    if (!combo) return;

    combo.forEach(idx => {
      this.dom.cells[idx].classList.add('winning-cell');
    });

    this.drawWinningSvgLine(combo);
  }

  drawWinningSvgLine(combo) {
    const c1 = this.dom.cells[combo[0]];
    const c3 = this.dom.cells[combo[2]];
    const boardRect = this.dom.board.getBoundingClientRect();
    const r1 = c1.getBoundingClientRect();
    const r3 = c3.getBoundingClientRect();

    // Map to 300x300 viewBox coordinate space
    const x1 = ((r1.left + r1.width / 2 - boardRect.left) / boardRect.width) * 300;
    const y1 = ((r1.top + r1.height / 2 - boardRect.top) / boardRect.height) * 300;
    const x2 = ((r3.left + r3.width / 2 - boardRect.left) / boardRect.width) * 300;
    const y2 = ((r3.top + r3.height / 2 - boardRect.top) / boardRect.height) * 300;

    this.dom.winLine.setAttribute('x1', x1);
    this.dom.winLine.setAttribute('y1', y1);
    this.dom.winLine.setAttribute('x2', x2);
    this.dom.winLine.setAttribute('y2', y2);

    this.dom.winLineSvg.classList.add('active');
  }

  clearWinningLine() {
    this.dom.winLineSvg.classList.remove('active');
    this.dom.cells.forEach(cell => cell.classList.remove('winning-cell'));
  }

  handleHint() {
    if (this.isGameOver || this.isAiThinking) return;

    const hint = TicTacToeAI.getStrategicHint(this.board, this.currentPlayer);
    if (hint) {
      this.clearHints();
      const targetCell = this.dom.cells[hint.index];
      targetCell.classList.add('hint-suggested');

      this.dom.statusIcon.textContent = '💡';
      this.dom.statusText.textContent = `Hint: ${hint.reason}`;
      window.soundEngine.playHintSound();
    }
  }

  clearHints() {
    this.dom.cells.forEach(cell => cell.classList.remove('hint-suggested'));
  }

  saveHistorySnapshot() {
    this.moveHistory.push({
      board: [...this.board],
      player: this.currentPlayer
    });
  }

  handleUndo() {
    if (this.moveHistory.length === 0 || this.isAiThinking) return;

    // In Vs AI mode, undo back 2 moves (both AI and Human) unless game was already over after AI move
    let stepsToRevert = this.gameMode === 'pvp' ? 1 : 2;

    if (this.gameMode !== 'pvp') {
      if (this.isGameOver && this.currentPlayer === 'O') {
        stepsToRevert = 1;
      } else if (this.moveHistory.length === 1) {
        stepsToRevert = 1;
      }
    }

    let snapshot = null;
    while (stepsToRevert > 0 && this.moveHistory.length > 0) {
      snapshot = this.moveHistory.pop();
      stepsToRevert--;
    }

    if (snapshot) {
      this.board = [...snapshot.board];
      this.currentPlayer = snapshot.player;
      this.isGameOver = false;

      this.clearWinningLine();
      this.clearHints();
      this.renderBoard();
      this.updateTurnIndicators();

      this.dom.statusBanner.className = 'status-banner';
      this.dom.statusIcon.textContent = '↩️';
      this.dom.statusText.textContent = 'Move reverted. Plan your next turn!';
      this.dom.hintBtn.disabled = false;

      window.soundEngine.playClickSound();
    }

    if (this.moveHistory.length === 0) {
      this.dom.undoBtn.disabled = true;
    }
  }

  renderBoard() {
    const pack = SYMBOL_SETS[this.symbolPack] || SYMBOL_SETS.classic;

    this.dom.cells.forEach((cell, idx) => {
      const val = this.board[idx];
      cell.innerHTML = '';
      if (val) {
        cell.classList.add('taken');
        const span = document.createElement('span');
        span.className = `cell-symbol symbol-${val.toLowerCase()}`;
        span.textContent = pack[val];
        cell.appendChild(span);
      } else {
        cell.classList.remove('taken');
      }
    });
  }

  updateTurnIndicators(ended = false) {
    if (ended) {
      this.dom.cardX.classList.remove('active');
      this.dom.cardO.classList.remove('active');
      this.dom.turnX.textContent = 'FINAL';
      this.dom.turnO.textContent = 'FINAL';
      return;
    }

    const isX = this.currentPlayer === 'X';
    this.dom.cardX.classList.toggle('active', isX);
    this.dom.cardO.classList.toggle('active', !isX);

    this.dom.turnX.textContent = isX ? 'YOUR TURN' : 'WAITING';
    this.dom.turnO.textContent = !isX ? 'PLAYING' : 'WAITING';
  }

  updateScoreboardDisplay() {
    this.dom.scoreX.textContent = this.scores.X;
    this.dom.scoreO.textContent = this.scores.O;
    this.dom.scoreTies.textContent = this.scores.ties;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.ticTacToeGame = new TicTacToeGame();
});
