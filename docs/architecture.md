# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep route views responsible for rendering API data and accessible loading, empty, and error states. Use the shared API client for relative `/api` requests; do not put persistence or business rules in React components.
- Logic tier decision: Keep Express routes thin and delegate validation and capability behavior to the service layer. Return deliberate 4xx responses for invalid input, malformed or missing references, and unknown users rather than leaking cast errors or returning 5xx responses.
- Data tier decision: Define required fields, defaults, and references in the Mongoose models. Keep seeding idempotent and non-destructive so existing unrelated records are retained.
- Activity tracking approach: Validate the request fields and both ObjectIds, confirm the referenced user and team exist, then persist the activity with computed points and an occurrence timestamp. Use one deterministic points rule consistently for created and seeded activity records.
- Team management approach: Require a team name, retain the submitted name and mascot, and default omitted members to an empty array. Persist supplied member references without moving presentation concerns into the API.
- Leaderboard approach: Aggregate activity points by team, order totals from highest to lowest, and assign ranks starting at 1.
- Workout suggestions approach: Find the requested user by email, use their goal and recent activity to select a matching workout, and include a reason for the recommendation. Return a deliberate 4xx when no user matches.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend`. The baseline backend suite had four model-validation failures; required fields and defaults are incomplete. The seed idempotency test passed and should continue to pass.
- API: `npm run test:api --prefix octofit-tracker/backend`. The baseline backend suite had four API contract failures: create requests returned `501`, the leaderboard was empty, and workout suggestions did not match the user's activity/goal. Failures here indicate service behavior or HTTP error handling does not meet the API contract.
- Frontend: `npm test --prefix octofit-tracker/frontend`. The baseline had 15 failures across API rendering, user-specific workout requests, and the loading, empty, and accessible error states for all four routes. Failures indicate the presentation tier is not consuming or presenting the API contract correctly.
- Backend build: `npm run build --prefix octofit-tracker/backend`. Not run for the baseline; run after implementation to catch backend TypeScript errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend`. Not run for the baseline; run after implementation to catch frontend TypeScript and Vite production-build errors.
