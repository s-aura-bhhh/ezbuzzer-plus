import { useEffect, useState } from "react";
import "./App.css";

import { io } from "socket.io-client";

const socket = io("https://ezbuzzer-back.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [buzzedName, setBuzzedName] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    socket.on("updatePlayers", (data) => setPlayers(data));
    socket.on("updateScores", (data) => setScores(data));
    socket.on("updateTimer", (data) => {
      setTimeLeft(data);
      setTimerRunning(true);
    });
    socket.on("pauseTimer", (data) => {
      setTimeLeft(data);
      setTimerRunning(false);
    });
    socket.on("timerEnded", () => {
      setTimerRunning(false);
      setTimeLeft(0);
    });
    socket.on("buzzed", ({ name }) => {
      setBuzzedName(name);
      const audio = new Audio("/buzz.mp3");
      audio.play();
    });
  }, []);

  const joinGame = () => {
    if (!name) return alert("Enter your name!");
    socket.emit("joinGame", name);
    setJoined(true);
  };

  const handleBuzz = () => {
    socket.emit("buzz");
  };

  const startTimer = () => {
    socket.emit("startTimer", 60);
    setTimerRunning(true);
    setBuzzedName(null);
  };

  const resumeTimer = () => {
    socket.emit("resumeTimer");
    setTimerRunning(true);
    setBuzzedName(null);
  };

  const awardPoints = (id, points) => {
    socket.emit("awardPoints", { id, points });
  };

  return (
    <div className="container">
      {!joined ? (
        <div className="join-box">
          <h1>🎤 EZ Buzzer</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={joinGame}>Join Game</button>
          <button onClick={() => { setName("Host"); setIsHost(true); setJoined(true); }}>
            Join as Host
          </button>
        </div>
      ) : (
        <div className="game">
          <h1>⏱️ Timer: {timeLeft}s</h1>

          {buzzedName && (
            <div className="buzzed-display">
              🛎️ {buzzedName} buzzed first!
            </div>
          )}

          {isHost ? (
            <div className="host-controls">
              <button onClick={startTimer}>Start Timer</button>
              <button onClick={resumeTimer}>Resume Timer</button>
              <h2>Leaderboard</h2>
              <ul>
                {players.map((p) => (
                  <li key={p.id}>
                    {p.name}: {scores[p.id] || 0} pts
                    <button onClick={() => awardPoints(p.id, 3)}>+3</button>
                    <button onClick={() => awardPoints(p.id, -1)}>-1</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <button
              className="buzz-button"
              onClick={handleBuzz}
              disabled={!timerRunning}
            >
              BUZZ
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
