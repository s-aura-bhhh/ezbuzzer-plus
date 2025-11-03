import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Timer from "./Timer";
import Leaderboard from "./Leaderboard";

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function PlayerView({ name }) {
  const [buzzed, setBuzzed] = useState(false);
  const [buzzedPlayer, setBuzzedPlayer] = useState(null);
  const [leaderboard, setLeaderboard] = useState({});
  const [time, setTime] = useState(60);

  useEffect(() => {
    socket.emit("join-game", { name, isHost: false });

    socket.on("leaderboard-update", setLeaderboard);
    socket.on("timer-update", (t) => setTime(t));
    socket.on("buzzed-first", ({ name }) => {
      setBuzzedPlayer(name);
      setBuzzed(true);
    });
    socket.on("reset-round", () => {
      setBuzzed(false);
      setBuzzedPlayer(null);
      setTime(60);
    });
    socket.on("play-sound", () => new Audio("/ting.mp3").play());

    return () => socket.disconnect();
  }, []);

  const handleBuzz = () => {
    socket.emit("buzz");
    setBuzzed(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 text-center">
      <Timer time={time} />
      {buzzedPlayer && (
        <div className="text-3xl text-green-400 font-semibold">
          {buzzedPlayer} buzzed first!
        </div>
      )}
      <button
        onClick={handleBuzz}
        disabled={buzzed}
        className={`w-full h-[70vh] rounded-2xl text-6xl font-bold shadow-lg ${
          buzzed
            ? "bg-gray-500 text-gray-300"
            : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
        }`}
      >
        BUZZ!
      </button>

      <div className="absolute top-6 right-6">
        <Leaderboard leaderboard={leaderboard} />
      </div>
    </div>
  );
}
