import { getJson } from '../api/client.js';
import { useApiList } from '../api/useApiList.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: string[] };

export default function Teams() {
  const { items, hasError } = useApiList<Team>('/api/teams', 'teams', getJson);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      items={items}
      hasError={hasError}
      emptyText="No teams yet."
      renderItem={(team, index) => (
        <li key={`${team.name}-${index}`} className="list-group-item">
          <strong>{team.name}</strong>
          {team.mascot ? <span> - {team.mascot}</span> : null}
          <div className="small text-body-secondary">Members: {team.members?.join(', ') || 'None'}</div>
        </li>
      )}
    />
  );
}
