/**
 * Tic-Tac-Toe AI Engine: Beginner vs Advanced Models
 * Features:
 *  - Beginner Model: Casual, blunder-prone, ideal for beginners to practice and win.
 *  - Advanced Model: Minimax algorithm with depth penalty, mathematically unbeatable.
 *  - Strategic Hint Engine: Explains optimal moves for learning.
 */

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

class TicTacToeAI {
  /**
   * Check for win condition on arbitrary board
   */
  static checkWinner(board) {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo };
      }
    }
    if (board.every(cell => cell !== null && cell !== '')) {
      return { winner: 'tie', combo: null };
    }
    return null;
  }

  /**
   * Get list of empty cell indices
   */
  static getEmptyIndices(board) {
    const indices = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) indices.push(i);
    }
    return indices;
  }

  /* ========================================================================
     BEGINNER MODEL
     Friendly, relaxed playstyle with tactical blunders for casual enjoyment
     ======================================================================== */
  static getBeginnerMove(board, aiPlayer, humanPlayer) {
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0) return null;

    // 75% blunder rate: make a relaxed, random move
    const shouldBlunder = Math.random() < 0.75;
    if (shouldBlunder) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // 25% chance to spot an immediate win
    for (const idx of emptyIndices) {
      const tempBoard = [...board];
      tempBoard[idx] = aiPlayer;
      const winCheck = this.checkWinner(tempBoard);
      if (winCheck && winCheck.winner === aiPlayer) {
        return idx;
      }
    }

    // Otherwise, pick randomly
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  /* ========================================================================
     ADVANCED MODEL (Minimax Algorithm)
     Unbeatable mastermind AI calculating optimal game-tree branches
     ======================================================================== */
  static getAdvancedMove(board, aiPlayer, humanPlayer) {
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0) return null;

    // Opening move optimization for variety:
    // If board is empty, pick randomly between center and corners for diverse play
    if (emptyIndices.length === 9) {
      const bestOpenings = [0, 2, 4, 6, 8];
      return bestOpenings[Math.floor(Math.random() * bestOpenings.length)];
    }

    // If opponent went first and took an edge, taking center is the best counter
    if (emptyIndices.length === 8 && board[4] === null) {
      return 4;
    }

    let bestScore = -Infinity;
    let bestMoves = [];

    for (const idx of emptyIndices) {
      board[idx] = aiPlayer;
      const score = this.minimax(board, 0, false, aiPlayer, humanPlayer, -Infinity, Infinity);
      board[idx] = null; // Backtrack

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [idx];
      } else if (score === bestScore) {
        bestMoves.push(idx);
      }
    }

    // If multiple optimal moves exist, pick randomly among best moves for variety
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  /**
   * Minimax evaluation with depth weighting & alpha-beta pruning
   */
  static minimax(board, depth, isMaximizing, aiPlayer, humanPlayer, alpha, beta) {
    const result = this.checkWinner(board);
    if (result) {
      if (result.winner === aiPlayer) return 10 - depth;
      if (result.winner === humanPlayer) return depth - 10;
      if (result.winner === 'tie') return 0;
    }

    const emptyIndices = this.getEmptyIndices(board);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of emptyIndices) {
        board[idx] = aiPlayer;
        const evaluation = this.minimax(board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta);
        board[idx] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Beta prune
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of emptyIndices) {
        board[idx] = humanPlayer;
        const evaluation = this.minimax(board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta);
        board[idx] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha prune
      }
      return minEval;
    }
  }

  /* ========================================================================
     STRATEGIC HINT ENGINE
     Finds the best move for the human player and explains why
     ======================================================================== */
  static getStrategicHint(board, player) {
    const opponent = player === 'X' ? 'O' : 'X';
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0) return null;

    // 1. Check for immediate winning move
    for (const idx of emptyIndices) {
      board[idx] = player;
      const winCheck = this.checkWinner(board);
      board[idx] = null;
      if (winCheck && winCheck.winner === player) {
        return {
          index: idx,
          reason: 'Winning move! Complete 3-in-a-row right now!'
        };
      }
    }

    // 2. Check for immediate defensive block
    for (const idx of emptyIndices) {
      board[idx] = opponent;
      const winCheck = this.checkWinner(board);
      board[idx] = null;
      if (winCheck && winCheck.winner === opponent) {
        return {
          index: idx,
          reason: 'Defensive block! Prevent your opponent from winning.'
        };
      }
    }

    // 3. Center square control
    if (board[4] === null) {
      return {
        index: 4,
        reason: 'Center control! The middle square offers the most combinations.'
      };
    }

    // 4. Optimal Minimax move
    let bestScore = -Infinity;
    let bestMove = emptyIndices[0];

    for (const idx of emptyIndices) {
      board[idx] = player;
      const score = this.minimax(board, 0, false, player, opponent, -Infinity, Infinity);
      board[idx] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    const corners = [0, 2, 6, 8];
    if (corners.includes(bestMove)) {
      return {
        index: bestMove,
        reason: 'Claim a corner to set up multi-directional forks.'
      };
    }

    return {
      index: bestMove,
      reason: 'Best positional move based on game-tree analysis.'
    };
  }
}

window.TicTacToeAI = TicTacToeAI;
