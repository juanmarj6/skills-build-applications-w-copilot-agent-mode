import { getJson } from '../api/client.js';
import { useApiList } from '../api/useApiList.js';
import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const { items, hasError } = useApiList<Entry>('/api/leaderboard', 'leaderboard', getJson);

  return (
    <CapabilityCard<Entry>
      title="Leaderboard"
      description="Compare team point totals."
      items={items}
      hasError={hasError}
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
