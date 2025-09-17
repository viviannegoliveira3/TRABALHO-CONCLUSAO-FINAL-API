const request = require('supertest');
const app = require('../src/app');
const { expect } = require('chai');

describe('Auth & Transfer API', () => {
  let token;
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'user', password: 'pass' });
    expect(res.status).to.equal(200);
    expect(res.body.token).to.exist;
    token = res.body.token;
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'user', password: 'wrong' });
    expect(res.status).to.equal(401);
  });

  it('should transfer with valid token and funds', async () => {
    const res = await request(app)
      .post('/api/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 10 });
    expect(res.status).to.equal(200);
    expect(res.body.balance).to.equal(90);
  });

  it('should fail transfer with insufficient funds', async () => {
    const res = await request(app)
      .post('/api/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000 });
    expect(res.status).to.equal(400);
  });

  it('should fail transfer without token', async () => {
    const res = await request(app)
      .post('/api/transfer')
      .send({ amount: 10 });
    expect(res.status).to.equal(401);
  });
});
