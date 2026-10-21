import { useState, type FormEvent } from 'react';
import { getJson } from '../api/client.js';
import { useApiList } from '../api/useApiList.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };

const defaultUserEmail = 'mona@example.com';

export default function Workouts() {
  const [email, setEmail] = useState(defaultUserEmail);
  const [requestedEmail, setRequestedEmail] = useState(defaultUserEmail);
  const endpoint = `/api/workouts/suggestions/${encodeURIComponent(requestedEmail)}`;
  const { items, hasError } = useApiList<Workout>(endpoint, 'suggestions', getJson);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestedEmail(email.trim());
  }

  return (
    <>
      <form className="mb-3" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="workout-user-email">User email</label>
        <div className="d-flex gap-2">
          <input
            id="workout-user-email"
            className="form-control"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="btn btn-primary text-nowrap" type="submit">Get suggestions</button>
        </div>
      </form>
      <CapabilityCard<Workout>
        title="Workout suggestions"
        description="Recommend workouts from activity patterns."
        items={items}
        hasError={hasError}
        emptyText="No workout suggestions yet."
        renderItem={(workout, index) => (
          <li key={`${workout.title}-${index}`} className="list-group-item">
            <strong>{workout.title}</strong>
            {workout.focus ? <span> - {workout.focus}</span> : null}
            {workout.minutes ? <span> ({workout.minutes} min)</span> : null}
            {workout.difficulty ? <span>, {workout.difficulty}</span> : null}
            {workout.reason ? <div>{workout.reason}</div> : null}
          </li>
        )}
      />
    </>
  );
}
