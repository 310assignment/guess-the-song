import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockGetKpopRandom = jest.fn();
const mockRefreshKpopCache = jest.fn();

jest.unstable_mockModule('../deezer/playlist.js', () => ({
  getKpopRandom: mockGetKpopRandom,
  refreshKpopCache: mockRefreshKpopCache
}));

const { getRandomFromKpop, refreshKpop } = await import('../controllers/kpopController.js');

describe('K-Pop Controller Function Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  // Verify that both controller functions exist and are properly defined as async
  describe('Function Properties', () => {
    it('should verify both functions are async and callable', () => {
      expect(getRandomFromKpop).toBeDefined();
      expect(typeof getRandomFromKpop).toBe('function');
      expect(getRandomFromKpop.constructor.name).toBe('AsyncFunction');

      expect(refreshKpop).toBeDefined();
      expect(typeof refreshKpop).toBe('function');
      expect(refreshKpop.constructor.name).toBe('AsyncFunction');
    });
  });

  // Test for getRandomFromKpop
  describe('getRandomFromKpop', () => {
    // Test that the function always requests exactly 79 tracks regardless of input
    it('should always request exactly 79 tracks (hardcoded count)', async () => {
      const mockTracks = [
        { id: '1', name: 'Song 1', artists: ['Artist 1'] },
        { id: '2', name: 'Song 2', artists: ['Artist 2'] }
      ];
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      await getRandomFromKpop(mockReq, mockRes, mockNext);

      expect(mockGetKpopRandom).toHaveBeenCalledWith(79);
      expect(mockGetKpopRandom).toHaveBeenCalledTimes(1);
    });

    // Test that the response format matches expected structure with correct count
    it('should return response with actual track count and tracks array', async () => {
      const mockTracks = [
        { id: '1', name: 'Dynamite', artists: ['BTS'] },
        { id: '2', name: 'How You Like That', artists: ['BLACKPINK'] },
        { id: '3', name: 'Next Level', artists: ['aespa'] }
      ];
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      await getRandomFromKpop(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        count: 3,
        tracks: mockTracks
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    // Test behavior when fewer tracks are available than requested
    it('should handle when less than 79 tracks are available', async () => {
      const mockTracks = Array.from({ length: 45 }, (_, i) => ({
        id: `track${i}`,
        name: `Song ${i}`,
        artists: [`Artist ${i}`]
      }));
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      await getRandomFromKpop(mockReq, mockRes, mockNext);

      expect(mockGetKpopRandom).toHaveBeenCalledWith(79);
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 45,
        tracks: mockTracks
      });
    });

    // Test edge case when no tracks are available
    it('should handle empty tracks array', async () => {
      mockGetKpopRandom.mockResolvedValue([]);

      await getRandomFromKpop(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        count: 0,
        tracks: []
      });
    });

    // Test that query parameters don't affect the hardcoded request count
    it('should ignore request parameters (req is unused)', async () => {
      mockReq.query = { count: 25, limit: 100, foo: 'bar' };
      const mockTracks = [{ id: '1', name: 'Test Song' }];
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      await getRandomFromKpop(mockReq, mockRes, mockNext);

      expect(mockGetKpopRandom).toHaveBeenCalledWith(79);
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 1,
        tracks: mockTracks
      });
    });

    // Test that errors are properly forwarded to Express error handling
    it('should pass errors to next() middleware', async () => {
      const mockError = new Error('Deezer API failed');
      mockGetKpopRandom.mockRejectedValue(mockError);

      await getRandomFromKpop(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // Test for refreshKpop
  describe('refreshKpop', () => {
    // Test that the refresh function is called correctly without parameters
    it('should call refreshKpopCache function', async () => {
      const mockCacheSize = 142;
      mockRefreshKpopCache.mockResolvedValue(mockCacheSize);

      await refreshKpop(mockReq, mockRes, mockNext);

      expect(mockRefreshKpopCache).toHaveBeenCalledWith();
      expect(mockRefreshKpopCache).toHaveBeenCalledTimes(1);
    });

    // Test that successful refresh returns proper response format
    it('should return success response with cache size', async () => {
      const mockCacheSize = 87;
      mockRefreshKpopCache.mockResolvedValue(mockCacheSize);

      await refreshKpop(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        cacheSize: 87
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    // Test edge case when cache refresh results in empty cache
    it('should handle zero cache size after refresh', async () => {
      mockRefreshKpopCache.mockResolvedValue(0);

      await refreshKpop(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        cacheSize: 0
      });
    });

    // Test that request data doesn't affect the refresh operation
    it('should ignore request parameters (req is unused)', async () => {
      mockReq.body = { force: true, timeout: 5000 };
      mockReq.params = { id: 123 };
      const mockCacheSize = 99;
      mockRefreshKpopCache.mockResolvedValue(mockCacheSize);

      await refreshKpop(mockReq, mockRes, mockNext);

      expect(mockRefreshKpopCache).toHaveBeenCalledWith();
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        cacheSize: 99
      });
    });

    // Test basic error handling during cache refresh
    it('should pass errors to next() middleware', async () => {
      const mockError = new Error('Cache refresh failed');
      mockRefreshKpopCache.mockRejectedValue(mockError);

      await refreshKpop(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    // Test handling of API-specific errors with detailed response data
    it('should handle API errors with response details', async () => {
      const apiError = new Error('Rate limit exceeded');
      apiError.response = {
        status: 429,
        data: { error: { message: 'Too many requests' } }
      };
      mockRefreshKpopCache.mockRejectedValue(apiError);

      await refreshKpop(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(apiError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});