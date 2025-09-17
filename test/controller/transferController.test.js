const sinon = require('sinon');
const { expect } = require('chai');
const transferController = require('../../src/controllers/transferController');
const jwt = require('jsonwebtoken');

describe('Transfer Controller', () => {
  
  let req, res, sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      headers: { authorization: 'Bearer validtoken' },
      body: { amount: 10 }
    };
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return 401 if no token provided', () => {
    req.headers.authorization = undefined;
    transferController.transfer(req, res);
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'No token provided' })).to.be.true;
  });

  it('should return 401 if token is invalid', () => {
    sandbox.stub(jwt, 'verify').throws();
    transferController.transfer(req, res);
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid token' })).to.be.true;
  });

  it('should return 400 if insufficient funds', () => {
    sandbox.stub(jwt, 'verify').returns({ username: 'user' });
    req.body.amount = 1000;
    transferController.transfer(req, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: 'Insufficient funds' })).to.be.true;
  });

  it('should return new balance on success', () => {
    sandbox.stub(jwt, 'verify').returns({ username: 'user' });
    req.body.amount = 10;
    transferController.transfer(req, res);
    expect(res.json.calledWith({ balance: 90 })).to.be.true;
  });
});
