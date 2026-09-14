export const TWINFORGE_RUNTIME_SCALE = 0.6

export function getRuntimeModelScale(authoredScale = [1, 1, 1]) {
  return authoredScale.map((value) => value * TWINFORGE_RUNTIME_SCALE)
}