const request = require('supertest');
const startServer = require('../src/graphql');
const { expect } = require('chai');

let app;

describe('GraphQL Auth & Transfer API', () => {
  let token;
  before(async () => {
    app = await startServer();
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: 'mutation { login(username: "user", password: "pass") }'
      });
    expect(res.status).to.equal(200);
    expect(res.body.data.login).to.exist;
    token = res.body.data.login;
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: 'mutation { login(username: "user", password: "wrong") }'
      });
    expect(res.body.errors).to.exist;
  });

  it('should transfer with valid token and funds', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'mutation { transfer(amount: 10) }'
      });
    expect(res.status).to.equal(200);
    expect(res.body.data.transfer).to.equal(90);
  });

  it('should fail transfer with insufficient funds', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'mutation { transfer(amount: 1000) }'
      });
    expect(res.body.errors).to.exist;
  });

  it('should fail transfer without token', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: 'mutation { transfer(amount: 10) }'
      });
    expect(res.body.errors).to.exist;
  });
});
