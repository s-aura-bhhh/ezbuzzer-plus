import React, { useState } from "react";
import HostView from "./components/HostView";
import PlayerView from "./components/PlayerView";

function App() {
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [name, setName] = useState("");

  const handleJoin = (role) => {
    if (!name) return alert("Enter your name first!");
    setIsHost(role === "host");
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-5xl font-bold">EZ-Buzzer 🎤</h1>
        <input
          type="text"
          placeholder="Enter your name"
          className="p-2 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex gap-4">
          <button
            onClick={() => handleJoin("host")}
            className="bg-green-600 px-4 py-2 rounded-lg text-white text-lg"
          >
            Join as Host
          </button>
          <button
            onClick={() => handleJoin("player")}
            className="bg-blue-600 px-4 py-2 rounded-lg text-white text-lg"
          >
            Join as Player
          </button>
        </div>
      </div>
    );
  }

  return isHost ? <HostView name={name} /> : <PlayerView name={name} />;
}

export default App;
