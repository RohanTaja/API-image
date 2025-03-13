// tests/unit/socialController.test.js
const { addComment, deleteComment } = require('../../controllers/socialController');
const { Comment } = require('../../models/associations');

jest.mock('../../models/associations', () => ({
  Comment: {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('Social Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { userId: 1, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    it('should add a comment successfully', async () => {
      req.params.id = '1';
      req.body = { content: 'Great image!' };
      const mockComment = { id: 1, content: 'Great image!', ImageId: 1, UserId: 1 };
      Comment.create.mockResolvedValue(mockComment);

      await addComment(req, res);

      expect(Comment.create).toHaveBeenCalledWith({
        content: 'Great image!',
        ImageId: 1,
        UserId: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment added successfully',
        data: mockComment
      });
    });

    it('should return 400 if content is missing', async () => {
      req.params.id = '1';

      await expect(addComment(req, res)).rejects.toMatchObject({
        message: 'Comment content is required',
        status: 400
      });
    });

    it('should return 401 if not authenticated', async () => {
      req.userId = null;
      req.params.id = '1';
      req.body = { content: 'Great image!' };

      await expect(addComment(req, res)).rejects.toMatchObject({
        message: 'Authentication required',
        status: 401
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const mockComment = { id: 1, UserId: 1, destroy: jest.fn().mockResolvedValue() };
      Comment.findByPk.mockResolvedValue(mockComment);
      req.params.commentId = '1';

      await deleteComment(req, res);

      expect(Comment.findByPk).toHaveBeenCalledWith(1);
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment deleted successfully'
      });
    });

    it('should return 404 if comment not found or unauthorized', async () => {
      Comment.findByPk.mockResolvedValue(null);
      req.params.commentId = '1';

      await expect(deleteComment(req, res)).rejects.toMatchObject({
        message: 'Comment not found or unauthorized',
        status: 404
      });
    });
  });
});