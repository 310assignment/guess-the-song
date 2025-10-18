import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mocks for deezer/music.js
const mockGetRandomByGenre = jest.fn();
const mockRefreshGenre = jest.fn();
const mockGENRES = ['kpop', 'pop', 'rock'];

jest.unstable_mockModule('../deezer/music.js', () => ({
  GENRES: mockGENRES,
  getRandomByGenre: mockGetRandomByGenre,
  refreshGenre: mockRefreshGenre
}));

const { default: TracksController } = await import('../controllers/TracksController.js');

describe('TracksController Function Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = { query: {} };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('getRandomTracks', () => {
    // Ensure the controller rejects unsupported genres with a 400 and lists allowed genres
    it('should validate genre and return 400 for unsupported genre', async () => {
      mockReq.query.genre = 'unknown';

      await TracksController.getRandomTracks(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unsupported genre', allowed: mockGENRES });
    });

    // Verify that a requested count over the maximum is clamped to 100 before calling the music layer
    it('should parse count and clamp to max 100', async () => {
      mockReq.query.genre = 'pop';
      mockReq.query.count = '150';

      const fakeTracks = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      mockGetRandomByGenre.mockResolvedValue(fakeTracks);

      await TracksController.getRandomTracks(mockReq, mockRes, mockNext);

      expect(mockGetRandomByGenre).toHaveBeenCalledWith('pop', 100);
      expect(mockRes.json).toHaveBeenCalledWith({ genre: 'pop', count: 100, tracks: fakeTracks });
    });

    // When no genre or count provided, the controller should default to 'kpop' and a count of 50
    it('should default genre to kpop and count to 50 when missing', async () => {
      const fakeTracks = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      mockGetRandomByGenre.mockResolvedValue(fakeTracks);

      await TracksController.getRandomTracks(mockReq, mockRes, mockNext);

      expect(mockGetRandomByGenre).toHaveBeenCalledWith('kpop', 50);
      expect(mockRes.json).toHaveBeenCalledWith({ genre: 'kpop', count: 50, tracks: fakeTracks });
    });

    // Any errors from the music layer should be forwarded to Express error-handling via next(err)
    it('should forward errors to next middleware', async () => {
      mockReq.query.genre = 'rock';
      const err = new Error('boom');
      mockGetRandomByGenre.mockRejectedValue(err);

      await TracksController.getRandomTracks(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    // Non-numeric count query should be ignored and the default count used instead
    it('should handle non-numeric count and use default', async () => {
      mockReq.query.genre = 'rock';
      mockReq.query.count = 'abc';
      const fakeTracks = [{ id: 1 }];
      mockGetRandomByGenre.mockResolvedValue(fakeTracks);

      await TracksController.getRandomTracks(mockReq, mockRes, mockNext);

      expect(mockGetRandomByGenre).toHaveBeenCalledWith('rock', 50);
      expect(mockRes.json).toHaveBeenCalledWith({ genre: 'rock', count: 1, tracks: fakeTracks });
    });
  });

  describe('refreshTracks', () => {
    // Reject unsupported genres for refresh with a 400 and allowed list
    it('should validate genre and return 400 for unsupported genre', async () => {
      mockReq.query.genre = 'invalid';

      await TracksController.refreshTracks(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unsupported genre', allowed: mockGENRES });
    });

    // Call refreshGenre for a supported genre and return the refreshed value in JSON
    it('should call refreshGenre and return refreshed result', async () => {
      mockReq.query.genre = 'pop';
      mockRefreshGenre.mockResolvedValue(true);

      await TracksController.refreshTracks(mockReq, mockRes, mockNext);

      expect(mockRefreshGenre).toHaveBeenCalledWith('pop');
      expect(mockRes.json).toHaveBeenCalledWith({ genre: 'pop', refreshed: true });
    });

    // Forward errors thrown by refreshGenre to next(err) so Express can handle them
    it('should forward errors to next middleware', async () => {
      mockReq.query.genre = 'kpop';
      const err = new Error('refresh fail');
      mockRefreshGenre.mockRejectedValue(err);

      await TracksController.refreshTracks(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
