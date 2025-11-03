import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://172.23.6.162:4000");
 // ← change X.X to your laptop's local IP

export default function App() {
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [players, setPlayers] = useState({});
  const [buzzed, setBuzzed] = useState(null);

  useEffect(() => {
    socket.on("playersUpdate", setPlayers);
    socket.on("buzzed", setBuzzed);
    socket.on("resetAll", () => {
      setPlayers({});
      setBuzzed(null);
    });
  }, []);

  const join = (r) => {
    setRole(r);
    socket.emit("join", { name, role: r });
  };

  if (!role)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Join Room</h2>
        <input
          placeholder="Your Name"
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <button onClick={() => join("host")}>Join as Host</button>
        <button onClick={() => join("player")}>Join as Player</button>
      </div>
    );

  if (role === "player")
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Welcome {name}</h2>
        <button
          onClick={() => socket.emit("buzz")}
          style={{ fontSize: 30, padding: 20 }}
        >
          🔔 BUZZ
        </button>
      </div>
    );

  // HOST SCREEN
  return (
    <div style={{ padding: 20 }}>
      <h2>Host Panel</h2>
      <button onClick={() => socket.emit("reset")}>Reset All</button>
      {buzzed && (
        <div
          style={{
            border: "2px solid red",
            padding: 10,
            margin: 10,
            background: "#fee",
          }}
        >
          <h3>Buzzed: {players[buzzed]?.name}</h3>
          <button onClick={() => socket.emit("startSpeaking", buzzed)}>
            Start Speaking
          </button>
          <button onClick={() => socket.emit("stopSpeaking")}>Stop</button>
          <button onClick={() => socket.emit("adjustScore", { id: buzzed, delta: +3 })}>
            +3
          </button>
          <button onClick={() => socket.emit("adjustScore", { id: buzzed, delta: -1 })}>
            -1
          </button>
        </div>
      )}
      <h3>Leaderboard (Host-only)</h3>
      <ul>
        {Object.entries(players).map(([id, p]) => (
          <li key={id}>
            {p.name} — {p.score} pts ({p.speakingTime}s)
          </li>
        ))}
      </ul>
    </div>
  );
}
