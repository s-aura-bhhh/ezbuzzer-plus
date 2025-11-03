import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Timer from "./Timer";
import Leaderboard from "./Leaderboard";

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function HostView({ name }) {
  const [leaderboard, setLeaderboard] = useState({});
  const [time, setTime] = useState(60);
  const [buzzedPlayer, setBuzzedPlayer] = useState(null);

  useEffect(() => {
    socket.emit("join-game", { name, isHost: true });

    socket.on("leaderboard-update", setLeaderboard);
    socket.on("timer-update", (t) => setTime(t));
    socket.on("buzzed-first", ({ name }) => setBuzzedPlayer(name));
    socket.on("play-sound", () => new Audio("/ting.mp3").play());
    socket.on("reset-round", () => {
      setBuzzedPlayer(null);
      setTime(60);
    });

    return () => socket.disconnect();
  }, []);

  const handleStartTimer = () => socket.emit("start-timer");
  const handleReset = () => socket.emit("reset-round");
  const updateScore = (targetName, points) =>
    socket.emit("update-score", { targetName, points });

  return (
    <div className="flex flex-col items-center mt-10 gap-4">
      <h1 className="text-4xl font-bold">Host Panel 🎙️</h1>
      <Timer time={time} />

      {buzzedPlayer && (
        <div className="text-3xl text-green-400 font-semibold">
          {buzzedPlayer} buzzed first!
        </div>
      )}

      {buzzedPlayer && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => updateScore(buzzedPlayer, 3)}
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            +3
          </button>
          <button
            onClick={() => updateScore(buzzedPlayer, -1)}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            -1
          </button>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleStartTimer}
          className="bg-yellow-500 px-6 py-2 rounded-lg font-semibold"
        >
          Start Timer
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-600 px-6 py-2 rounded-lg font-semibold"
        >
          Reset Round
        </button>
      </div>

      <div className="absolute top-6 right-6">
        <Leaderboard leaderboard={leaderboard} />
      </div>
    </div>
  );
}
