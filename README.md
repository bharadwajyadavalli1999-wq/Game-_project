# ✨ Tic-Tac-Toe Deluxe Edition

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/bharadwajyadavalli1999-wq/Game-_project)

A modern, responsive, and visually stunning Tic-Tac-Toe web game featuring **Beginner & Advanced AI models**, **7 beautiful animated background color palettes**, procedural sound effects, interactive hints, undo functionality, and customizable symbol packs.

---

## 🌟 Key Features

### 1. 🤖 Two AI Models + Local 2-Player Mode
* **🌱 Beginner Model (Novice AI)**:
  * Designed for beginners, children, and casual players.
  * Makes relaxed moves with intentional tactical blunders (~75% blunder rate).
  * Ideal for practicing winning combinations and building confidence.
* **⚡ Advanced Model (Mastermind Minimax AI)**:
  * Powered by the **Minimax Decision Tree Algorithm** with depth evaluation and alpha-beta pruning.
  * Calculates optimal moves across all game-tree permutations.
  * **Mathematically unbeatable**: the best possible outcome against optimal play is a Draw!
* **👥 2-Player Mode (Pass & Play)**:
  * Local multiplayer mode to play with friends or family on the same device.

### 2. 🎨 7 Beautiful Background Themes
Select from hand-crafted themes using the **Themes** button in the top navigation:
1. **Aurora Borealis** (Default): Ethereal teal, emerald, and deep cyan glow.
2. **Sunset Glow**: Radiant magenta, hot coral, and golden twilight.
3. **Cyberpunk Neon**: Electric cyan, laser pink, and synthwave violet.
4. **Cosmic Nebula**: Deep space indigo, starry violet, and starlight blue.
5. **Emerald Lush**: Deep jade green, golden mint, and rich forest tones.
6. **Pastel Bliss**: Dreamy soft lavender, blush peach, and spring mint.
7. **Royal Gold**: Luxurious obsidian black and champagne gold.

> Each theme features an **animated background canvas** with floating luminous gradient orbs that drift smoothly behind the frosted glass interface.

### 3. 💡 Beginner-Friendly Learning Tools
* **💡 Hint Engine**: Analyzes the board in real time and highlights the optimal square in a glowing golden pulse, with clear strategic explanations (e.g., *"Defensive block! Prevent opponent from winning"* or *"Control the center square"*).
* **↩️ Move Undo**: Test out different ideas! Quickly take back your last move without having to restart the entire match.
* **🔁 Turn Toggle**: Choose who takes the first turn: Player X or AI/Player O.

### 4. 🎵 Procedural Web Audio API Sound Effects
* Zero external audio files required! 100% offline-ready.
* Pleasant plucks and chimes for moves, win fanfare, tie tones, and tactile clicks.
* One-click Mute / Unmute button.

### 5. 🎭 Customizable Symbol Packs
Switch between different piece styles via the bottom dropdown:
* **Neon**: ✕ vs ◯
* **Cosmic**: 🚀 vs 🛸
* **Elements**: ⚡ vs 🔥
* **Royalty**: 👑 vs 💎
* **Pets**: 🐱 vs 🐶

---

## 🚀 How to Run the Game

### Method 1: Open Directly in Any Browser (Zero Setup)
Simply double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Firefox, Safari).

### Method 2: Run with Local Python Server
Run the included python launcher in your terminal:
```bash
python server.py
```
This automatically starts a local server on `http://localhost:8000` and opens your browser.

---

## 📁 Project Structure

```
antigravity_project/
├── index.html        # Clean semantic markup with glassmorphism layout
├── css/
│   └── style.css     # CSS custom properties for 7 themes, animations & responsive grid
├── js/
│   ├── ai.js         # Beginner & Minimax AI engine + strategic hint logic
│   ├── audio.js      # Procedural Web Audio API sound synthesizer
│   ├── confetti.js   # Canvas particle celebration effect
│   ├── game.js       # Core game controller, history undo, scoreboard
│   └── themes.js     # Theme switcher & animated background orbs
├── server.py         # Lightweight Python HTTP server launcher
└── README.md         # Documentation
```

---

## 🧠 How the AI Works

### Beginner AI
```javascript
// Sample beginner logic:
const shouldBlunder = Math.random() < 0.75;
if (shouldBlunder) {
  // Makes a random, forgiving move
  return emptyIndices[random];
}
```

### Advanced Minimax AI
```javascript
// Evaluates all recursive branch states:
minimax(board, depth, isMaximizing, aiPlayer, humanPlayer)
// Score = +10 - depth for fast AI wins
// Score = -10 + depth for defending human wins
```
The algorithm explores every remaining branch of the $3 \times 3$ grid, picking the move with the highest guaranteed payoff.
