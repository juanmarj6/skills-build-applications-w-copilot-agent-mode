import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      responseKey="activities"
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
