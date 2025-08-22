// tests/kpopController.real.test.js
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the playlist module BEFORE importing the controller
const mockGetKpopRandom = jest.fn();
const mockRefreshKpopCache = jest.fn();

// Mock the entire playlist module
jest.unstable_mockModule('../deezer/playlist.js', () => ({
  getKpopRandom: mockGetKpopRandom,
  refreshKpopCache: mockRefreshKpopCache
}));

// Import controller functions AFTER mocking
const { getRandomFromKpop, refreshKpop } = await import('../controllers/kpopController.js');

describe('K-Pop Controller Function Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request, response, next
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('getRandomFromKpop', () => {
    it('should always request exactly 79 tracks (hardcoded count)', async () => {
      // Arrange
      const mockTracks = [
        { id: '1', name: 'Song 1', artists: ['Artist 1'] },
        { id: '2', name: 'Song 2', artists: ['Artist 2'] }
      ];
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      // Act - call the function
      await getRandomFromKpop(mockReq, mockRes, mockNext);

      // Assert - should always call with 79, regardless of any parameters
      expect(mockGetKpopRandom).toHaveBeenCalledWith(79);
      expect(mockGetKpopRandom).toHaveBeenCalledTimes(1);
    });

    it('should return response with actual track count and tracks array', async () => {
      // Arrange - mock 3 tracks returned
      const mockTracks = [
        { id: '1', name: 'Dynamite', artists: ['BTS'] },
        { id: '2', name: 'How You Like That', artists: ['BLACKPINK'] },
        { id: '3', name: 'Next Level', artists: ['aespa'] }
      ];
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      // Act
      await getRandomFromKpop(mockReq, mockRes, mockNext);

      // Assert - count should be actual length (3), not requested (79)
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 3,
        tracks: mockTracks
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle when less than 79 tracks are available', async () => {
      // Arrange - only 45 tracks available
      const mockTracks = Array.from({ length: 45 }, (_, i) => ({
        id: `track${i}`,
        name: `Song ${i}`,
        artists: [`Artist ${i}`]
      }));
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      // Act
      await getRandomFromKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockGetKpopRandom).toHaveBeenCalledWith(79); // Still requests 79
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 45, // But returns actual count
        tracks: mockTracks
      });
    });

    it('should handle empty tracks array', async () => {
      // Arrange
      mockGetKpopRandom.mockResolvedValue([]);

      // Act
      await getRandomFromKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 0,
        tracks: []
      });
    });

    it('should ignore request parameters (req is unused)', async () => {
      // Arrange - add query parameters to request
      mockReq.query = { count: 25, limit: 100, foo: 'bar' };
      const mockTracks = [{ id: '1', name: 'Test Song' }];
      mockGetKpopRandom.mockResolvedValue(mockTracks);

      // Act
      await getRandomFromKpop(mockReq, mockRes, mockNext);

      // Assert - should still call with hardcoded 79, ignoring query params
      expect(mockGetKpopRandom).toHaveBeenCalledWith(79);
      expect(mockRes.json).toHaveBeenCalledWith({
        count: 1,
        tracks: mockTracks
      });
    });

    it('should pass errors to next() middleware', async () => {
      // Arrange
      const mockError = new Error('Deezer API failed');
      mockGetKpopRandom.mockRejectedValue(mockError);

      // Act
      await getRandomFromKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('refreshKpop', () => {
    it('should call refreshKpopCache function', async () => {
      // Arrange
      const mockCacheSize = 142;
      mockRefreshKpopCache.mockResolvedValue(mockCacheSize);

      // Act
      await refreshKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRefreshKpopCache).toHaveBeenCalledWith();
      expect(mockRefreshKpopCache).toHaveBeenCalledTimes(1);
    });

    it('should return success response with cache size', async () => {
      // Arrange
      const mockCacheSize = 87;
      mockRefreshKpopCache.mockResolvedValue(mockCacheSize);

      // Act
      await refreshKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        cacheSize: 87
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle zero cache size after refresh', async () => {
      // Arrange
      mockRefreshKpopCache.mockResolvedValue(0);

      // Act
      await refreshKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        cacheSize: 0
      });
    });

    it('should ignore request parameters (req is unused)', async () => {
      // Arrange - add request body/params
      mockReq.body = { force: true, timeout: 5000 };
      mockReq.params = { id: 123 };
      const mockCacheSize = 99;
      mockRefreshKpopCache.mockResolvedValue(mockCacheSize);

      // Act
      await refreshKpop(mockReq, mockRes, mockNext);

      // Assert - should call refreshKpopCache with no parameters
      expect(mockRefreshKpopCache).toHaveBeenCalledWith();
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        cacheSize: 99
      });
    });

    it('should pass errors to next() middleware', async () => {
      // Arrange
      const mockError = new Error('Cache refresh failed');
      mockRefreshKpopCache.mockRejectedValue(mockError);

      // Act
      await refreshKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle API errors with response details', async () => {
      // Arrange
      const apiError = new Error('Rate limit exceeded');
      apiError.response = { 
        status: 429, 
        data: { error: { message: 'Too many requests' } }
      };
      mockRefreshKpopCache.mockRejectedValue(apiError);

      // Act
      await refreshKpop(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(apiError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

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
});