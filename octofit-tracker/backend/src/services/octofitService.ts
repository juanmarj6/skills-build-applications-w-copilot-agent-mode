import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !mongoose.isObjectIdOrHexString(userId) ||
    typeof teamId !== 'string' || !mongoose.isObjectIdOrHexString(teamId) ||
    typeof type !== 'string' || type.trim().length === 0 ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' || name.trim().length === 0 ||
    typeof mascot !== 'string' || mascot.trim().length === 0 ||
    !Array.isArray(members)
  ) {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  if (!members.every((member) => typeof member === 'string' && mongoose.isObjectIdOrHexString(member))) {
    throw Object.assign(new Error('Invalid team members'), { status: 400 });
  }

  const memberIds = [...new Set(members as string[])];
  if (memberIds.length > 0 && await User.countDocuments({ _id: { $in: memberIds } }) !== memberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const [teams, activityTotals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);

  const totalsByTeam = new Map<string, number>();
  for (const { _id, totalPoints } of activityTotals) {
    totalsByTeam.set(_id.toString(), totalPoints);
  }

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: totalsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);

  const goal = user.fitnessGoal.toLowerCase();
  const activityType = recentActivity?.type.toLowerCase();
  const activityFocus = activityType === 'run' || activityType === 'cycle' || activityType === 'walk'
    ? 'endurance'
    : activityType;
  const hasGoalWorkout = workouts.some((workout) => workout.focus.toLowerCase() === goal);
  const preferredFocus = hasGoalWorkout ? goal : activityFocus;

  return [...workouts]
    .sort((left, right) => Number(right.focus.toLowerCase() === preferredFocus) - Number(left.focus.toLowerCase() === preferredFocus))
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      const reason = focus === goal
        ? `Matches your ${user.fitnessGoal} fitness goal.`
        : recentActivity && focus === activityFocus
          ? `Based on your recent ${recentActivity.type} activity.`
          : `A ${workout.focus} workout to support your fitness routine.`;
      return { ...workout, reason };
    });
}

export { User };
