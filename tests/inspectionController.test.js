import { createInspection } from '../controllers/inspectionController.js';
import Inspection from '../models/Inspection.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

jest.mock('../models/Inspection.js');
jest.mock('../models/Group.js');
jest.mock('../models/User.js');

describe('createInspection', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 'user123' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return 400 if required fields are missing', async () => {
    req.body = {}; // missing groupIdentifier, address, date

    await createInspection(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please provide group identifier, address, and date.' });
  });

  it('should return 404 if group creator email not found', async () => {
    req.body = { groupIdentifier: 'nonexistent@example.com', address: '123 Main St', date: '2025-01-01' };

    User.findOne.mockResolvedValue(null);

    await createInspection(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Group creator not found.' });
  });

  // You can add more tests for other logic branches here...
});
