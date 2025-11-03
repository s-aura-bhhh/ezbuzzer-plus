export default function Leaderboard({ leaderboard }) {
  return (
    <div className="bg-gray-900 bg-opacity-60 rounded-xl p-4 w-64 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">🏆 Leaderboard</h2>
      {Object.values(leaderboard).length === 0 && (
        <p className="text-sm text-gray-400">No players yet</p>
      )}
      {Object.values(leaderboard)
        .sort((a, b) => b.score - a.score)
        .map((p) => (
          <div key={p.name} className="flex justify-between py-1">
            <span>{p.name}</span>
            <span>{p.score}</span>
          </div>
        ))}
    </div>
  );
}
