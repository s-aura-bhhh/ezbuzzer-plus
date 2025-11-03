import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // local dev
      "https://ezbuzzer-plus.vercel.app" // deployed frontend
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let leaderboard = {};      // { playerId: { name, score } }
let timerRunning = false;
let buzzed = false;
let buzzedPlayer = null;
let currentTime = 60;      // seconds for each round
let timerInterval = null;

// Start timer for all clients
function startTimer() {
  timerRunning = true;
  currentTime = 60;
  io.emit("timer-update", currentTime);

  timerInterval = setInterval(() => {
    if (currentTime > 0 && timerRunning) {
      currentTime -= 1;
      io.emit("timer-update", currentTime);
    } else {
      clearInterval(timerInterval);
      timerRunning = false;
      io.emit("timer-ended");
    }
  }, 1000);
}

// Stop timer
function stopTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  io.emit("stop-timer");
}

// Reset everything for next round
function resetRound() {
  buzzed = false;
  buzzedPlayer = null;
  timerRunning = false;
  clearInterval(timerInterval);
  currentTime = 60;
  io.emit("reset-round");
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Player joins
  socket.on("join-game", ({ name, isHost }) => {
    leaderboard[socket.id] = { name, score: 0, isHost };
    io.emit("leaderboard-update", leaderboard);
    console.log(`${name} joined`);
  });

  // Host starts timer
  socket.on("start-timer", () => {
    if (!timerRunning) {
      console.log("Timer started by host");
      startTimer();
    }
  });

  // Player buzzes
  socket.on("buzz", () => {
    const player = leaderboard[socket.id];
    if (!buzzed && player && !player.isHost) {
      buzzed = true;
      buzzedPlayer = player;

      console.log(`${player.name} buzzed first!`);

      stopTimer();
      io.emit("buzzed-first", { name: player.name });
      io.emit("play-sound");
    }
  });

  // Host updates score (+3 or -1)
  socket.on("update-score", ({ targetName, points }) => {
    for (const id in leaderboard) {
      if (leaderboard[id].name === targetName) {
        leaderboard[id].score += points;
        break;
      }
    }
    io.emit("leaderboard-update", leaderboard);
  });

  // Host resets for next question
  socket.on("reset-round", () => {
    resetRound();
  });

  // Handle disconnects
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete leaderboard[socket.id];
    io.emit("leaderboard-update", leaderboard);
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("EZBuzzer backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
