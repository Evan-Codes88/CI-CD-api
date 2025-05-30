import Group from '../models/Group.js';
import * as groupController from '../controllers/groupController.js';

describe('Group Controller - createGroup', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { name: 'New Group' },
      user: { id: 'user123' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Optional: restore original implementations after each test
    jest.restoreAllMocks();
  });

  it('should return 201 and the created group on success', async () => {
    // Mock the instance save method on Group prototype
    jest.spyOn(Group.prototype, 'save').mockResolvedValue({
      _id: 'group123',
      name: 'New Group',
      createdBy: 'user123',
    });

    // Mock the static findById method with chained populate calls
    const mockPopulatedGroup = {
      _id: 'group123',
      name: 'New Group',
      members: [],
      createdBy: {},
      joinRequests: [],
    };

    // Chain mocks for populate
    const populateMock3 = jest.fn().mockResolvedValue(mockPopulatedGroup);
    const populateMock2 = jest.fn().mockReturnValue({ populate: populateMock3 });
    const populateMock1 = jest.fn().mockReturnValue({ populate: populateMock2 });

    jest.spyOn(Group, 'findById').mockReturnValue({
      populate: populateMock1,
    });

    await groupController.createGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Group "New Group" created successfully!',
      group: expect.objectContaining({
        id: 'group123', // your controller should map _id to id here
        name: 'New Group',
        members: expect.any(Array),
        createdBy: expect.any(Object),
        joinRequests: expect.any(Array),
      }),
    });
  });
});
