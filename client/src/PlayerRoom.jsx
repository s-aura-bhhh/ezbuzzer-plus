import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import tingSound from "../assets/ting.mp3"; // Add a ting.mp3 file in /src/assets

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function PlayerRoom({ name, room }) {
  const [buzzed, setBuzzed] = useState(false);
  const [winner, setWinner] = useState(null);
  const audio = new Audio(tingSound);

  const handleBuzz = () => {
    if (!buzzed) {
      setBuzzed(true);
      audio.play();
      socket.emit("buzz", { name, room });
    }
  };

  useEffect(() => {
    socket.emit("joinRoom", { name, room });

    socket.on("buzzWinner", (data) => {
      setWinner(data.name);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <h1 className="text-5xl font-bold mb-8">EzBuzzer+</h1>

      {winner ? (
        <div className="text-center">
          <p className="text-2xl mb-4">🛎️ {winner} buzzed first!</p>
        </div>
      ) : (
        <button
          onClick={handleBuzz}
          disabled={buzzed}
          className={`w-full h-full text-6xl font-bold rounded-3xl transition-all duration-200 ${
            buzzed ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {buzzed ? "BUZZED!" : "BUZZ!"}
        </button>
      )}
    </div>
  );
}
