/** Hold Now for the last tenth of the scene before sticky releases to Contact. */
export const JOURNEY_ARRIVAL = 0.9;
export function journeyState(progress: number, milestoneCount: number) {
  const last = Math.max(0, milestoneCount - 1);
  const position = Math.min(1, Math.max(0, progress / JOURNEY_ARRIVAL)) * last;
  return { turn: -position * 90, index: Math.min(last, Math.round(position)) };
}
/** Text shares the wheel's position: below on arrival, below again on departure. */
export function storyPose(turn: number, index: number) {
  const angle = index * 90 + turn;
  const distance = Math.min(1, Math.abs(angle) / 42);
  const eased = distance * distance * (3 - 2 * distance);
  return { angle, opacity: 1 - eased, y: eased * 90 };
}
export function milestoneProgress(index: number, milestoneCount: number) {
  const last = Math.max(1, milestoneCount - 1);
  return index === last ? 0.94 : index / last * JOURNEY_ARRIVAL;
}
