import { randomInt } from 'crypto';

/**
 * @param {*} arr takes in an array of songs and shuffles them
 * @returns shuffled array
 */
export function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    // Use crypto.randomInt for secure random generation
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
