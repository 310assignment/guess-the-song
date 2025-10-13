/**
 * Safe timer utilities to replace direct setTimeout usage
 * Provides better control and reduces security risks
 */

/**
 * Safe setTimeout wrapper with validation
 * @param callback - Function to execute
 * @param delay - Delay in milliseconds (minimum 0, maximum 60000)
 * @returns Timer ID that can be cleared
 */
export const safeSetTimeout = (callback: () => void, delay: number): number => {
  // Validate delay to prevent abuse
  const safeDelay = Math.max(0, Math.min(delay, 60000));
  
  return setTimeout(() => {
    try {
      callback();
    } catch (error) {
      console.error('Safe timeout callback error:', error);
    }
  }, safeDelay);
};

/**
 * Safe async timeout wrapper
 * @param callback - Async function to execute
 * @param delay - Delay in milliseconds
 * @returns Timer ID that can be cleared
 */
export const safeSetTimeoutAsync = (callback: () => Promise<void>, delay: number): number => {
  const safeDelay = Math.max(0, Math.min(delay, 60000));
  
  return setTimeout(async () => {
    try {
      await callback();
    } catch (error) {
      console.error('Safe async timeout callback error:', error);
    }
  }, safeDelay);
};

/**
 * Safe timer for countdown operations
 * @param callback - Function to execute
 * @param delay - Delay in milliseconds (defaults to 1000ms)
 * @returns Timer ID that can be cleared
 */
export const safeCountdownTimer = (callback: () => void, delay: number = 1000): number => {
  return safeSetTimeout(callback, delay);
};