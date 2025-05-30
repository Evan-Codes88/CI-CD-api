process.env.JWT_SECRET = 'testsecret';
import User from '../models/User.js';
import { signup } from '../controllers/userController.js';

jest.mock('../models/User.js');

describe('User Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        name: 'Evan',
        email: 'evan@example.com',
        password: 'password123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('signup should signup a new user', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const saveMock = jest.fn().mockResolvedValue();
    User.mockImplementation((userData) => ({
      save: saveMock,
      _id: '1',
      name: userData.name,
      email: userData.email,
      password: userData.password,
    }));

    await signup(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(User).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        email: req.body.email,
        password: expect.any(String),
      })
    );
    expect(saveMock).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          id: '1',
          name: req.body.name,
          email: req.body.email,
        }),
      })
    );
  });

  it('signup should fail if user already exists', async () => {
    User.findOne = jest.fn().mockResolvedValue({ email: req.body.email });

    await signup(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('signup should return 500 if there is a server error', async () => {
    const errorMessage = 'Database failure';
    User.findOne = jest.fn().mockRejectedValue(new Error(errorMessage));

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });

  it('signup should hash the password before saving', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const saveMock = jest.fn().mockResolvedValue();
    User.mockImplementation((userData) => ({
      save: saveMock,
      _id: '1',
      name: userData.name,
      email: userData.email,
      password: userData.password,
    }));

    await signup(req, res);

    expect(User).toHaveBeenCalledWith(
      expect.objectContaining({
        password: expect.not.stringMatching(req.body.password),
      })
    );
  });

  it('signup should return 400 if required fields are missing', async () => {
    req.body = { name: 'Evan', email: '' }; // missing email and password

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.any(String),
    });
  });
});
