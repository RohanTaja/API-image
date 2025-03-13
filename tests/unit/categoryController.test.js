// tests/unit/categoryController.test.js
const { createCategory, deleteCategory } = require('../../controllers/categoryController');
const { Category } = require('../../models/associations');

// Mock Sequelize model
jest.mock('../../models/associations', () => ({
  Category: {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('Category Controller Unit Tests', () => {
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

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      req.body = { name: 'Nature' };
      const mockCategory = { id: 1, name: 'Nature', ownerId: 1, isPublic: true };
      Category.create.mockResolvedValue(mockCategory);

      await createCategory(req, res);

      expect(Category.create).toHaveBeenCalledWith({ name: 'Nature', isPublic: true, ownerId: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Category created successfully',
        data: mockCategory
      });
    });

    it('should return 400 if name is missing', async () => {
      await expect(createCategory(req, res)).rejects.toMatchObject({
        message: 'Category name is required',
        status: 400
      });
    });

    it('should return 401 if not authenticated', async () => {
      req.userId = null;
      req.body = { name: 'Nature' };
      await expect(createCategory(req, res)).rejects.toMatchObject({
        message: 'Authentication required',
        status: 401
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      const mockCategory = { id: 1, ownerId: 1, destroy: jest.fn().mockResolvedValue() };
      Category.findByPk.mockResolvedValue(mockCategory);
      req.params.id = '1';

      await deleteCategory(req, res);

      expect(Category.findByPk).toHaveBeenCalledWith(1);
      expect(mockCategory.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Category deleted successfully'
      });
    });

    it('should return 404 if category not found or unauthorized', async () => {
      Category.findByPk.mockResolvedValue(null);
      req.params.id = '1';

      await expect(deleteCategory(req, res)).rejects.toMatchObject({
        message: 'Category not found or unauthorized',
        status: 404
      });
    });
  });
});