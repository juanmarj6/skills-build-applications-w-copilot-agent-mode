import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<Entry>
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      responseKey="leaderboard"
      emptyText="No rankings yet."
      renderItem={(entry) => (
        <li key={entry.rank} className="list-group-item d-flex justify-content-between">
          <span>{entry.rank}. {entry.teamName}</span>
          <strong>{entry.totalPoints} points</strong>
        </li>
      )}
    />
  );
}
