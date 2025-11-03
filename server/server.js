// server/server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let players = {}; // {id: {name, score, speakingTime}}
let host = null;
let currentSpeaker = null;
let timer = null;
let remainingTime = 60;

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join", ({ name, role }) => {
    if (role === "host") {
      host = socket.id;
      io.to(host).emit("playersUpdate", players);
    } else {
      players[socket.id] = { name, score: 0, speakingTime: 0 };
      io.emit("playersUpdate", players);
    }
  });

  socket.on("buzz", () => {
    if (host) io.to(host).emit("buzzed", socket.id);
  });

  socket.on("startSpeaking", (id) => {
    currentSpeaker = id;
    clearInterval(timer);
    timer = setInterval(() => {
      if (remainingTime > 0) {
        remainingTime--;
        players[id].score += 1;
        players[id].speakingTime += 1;
        io.to(host).emit("playersUpdate", players);
      } else {
        clearInterval(timer);
      }
    }, 1000);
  });

  socket.on("stopSpeaking", () => {
    clearInterval(timer);
  });

  socket.on("adjustScore", ({ id, delta }) => {
    players[id].score += delta;
    io.to(host).emit("playersUpdate", players);
  });

  socket.on("reset", () => {
    players = {};
    remainingTime = 60;
    currentSpeaker = null;
    io.emit("resetAll");
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playersUpdate", players);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

