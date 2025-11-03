import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function HostRoom({ room }) {
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [time, setTime] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    socket.emit("joinRoom", { name: "Host", room });

    socket.on("playerList", setPlayers);
    socket.on("buzzWinner", (data) => {
      setWinner(data.name);
      setTimerActive(false);
    });

    const interval = setInterval(() => {
      if (timerActive && time > 0) setTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, time]);

  const startTimer = () => {
    setTime(30);
    setTimerActive(true);
    socket.emit("resetBuzz", room);
  };

  const givePoints = (name, delta) => {
    socket.emit("updateScore", { name, delta, room });
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Host Panel</h1>

      <div className="text-3xl mb-6">⏱️ Timer: {time}s</div>

      {winner ? (
        <div className="text-2xl text-green-400 mb-6">
          🛎️ {winner} buzzed first!
        </div>
      ) : (
        <button
          onClick={startTimer}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xl rounded-lg mb-6"
        >
          Start Round
        </button>
      )}

      <h2 className="text-2xl mb-4">Leaderboard</h2>
      <div className="bg-gray-800 p-4 rounded-lg w-80">
        {players.map((p) => (
          <div
            key={p.name}
            className="flex justify-between items-center border-b border-gray-600 py-2"
          >
            <span>{p.name}</span>
            <div>
              <button
                onClick={() => givePoints(p.name, 3)}
                className="bg-green-500 px-2 py-1 rounded mr-2"
              >
                +3
              </button>
              <button
                onClick={() => givePoints(p.name, -1)}
                className="bg-red-500 px-2 py-1 rounded"
              >
                -1
              </button>
              <span className="ml-2">{p.score ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
