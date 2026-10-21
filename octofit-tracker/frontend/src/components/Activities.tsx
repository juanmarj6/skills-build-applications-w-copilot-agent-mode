import { getJson } from '../api/client.js';
import { useApiList } from '../api/useApiList.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const { items, hasError } = useApiList<Activity>('/api/activities', 'activities', getJson);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      items={items}
      hasError={hasError}
      emptyText="No activities yet."
      renderItem={(activity, index) => (
        <li key={`${activity.type}-${index}`} className="list-group-item d-flex justify-content-between">
          <span>{activity.type}</span>
          <span>{activity.minutes} min, {activity.points} points</span>
        </li>
      )}
    />
  );
}
