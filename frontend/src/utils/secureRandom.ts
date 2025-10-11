/**
 * Secure random utilities using crypto.getRandomValues()
 * This replaces insecure Math.random() usage
 */

/**
 * Generate a cryptographically secure random number between 0 and 1
 * @returns A secure random number between 0 (inclusive) and 1 (exclusive)
 */
export const secureRandom = (): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (2 ** 32);
};

/**
 * Generate a secure random integer between 0 and max (exclusive)
 * @param max - Maximum value (exclusive)
 * @returns Secure random integer
 */
export const secureRandomInt = (max: number): number => {
  return Math.floor(secureRandom() * max);
};

/**
 * Securely shuffle an array using Fisher-Yates algorithm with crypto random
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export const secureArrayShuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Secure compare function for array sorting
 * @returns Random comparison result for shuffling
 */
export const secureRandomComparator = (): number => {
  return secureRandom() - 0.5;
};