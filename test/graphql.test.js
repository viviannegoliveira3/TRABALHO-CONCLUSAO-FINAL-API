const request = require('supertest');
const startServer = require('../src/graphql');
const { expect } = require('chai');

let app;

describe('GraphQL Auth & Checkout API', () => {
  let token;
  const userCredentials = {
    name: 'GraphQL Test User',
    email: `graphql-test-${Date.now()}@example.com`,
    password: 'password123'
  };

  before(async () => {
    // Inicia o servidor GraphQL antes dos testes
    app = await startServer();
    // Registra um novo usuário para os testes
    await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation Register($name: String!, $email: String!, $password: String!) {
            register(name: $name, email: $email, password: $password) { email }
          }`,
        variables: userCredentials
      });
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) { token }
          }`,
        variables: { email: userCredentials.email, password: userCredentials.password }
      });
    expect(res.status).to.equal(200);
    expect(res.body.data.login.token).to.exist;
    token = res.body.data.login.token;
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token } }`,
        variables: { email: userCredentials.email, password: 'wrongpassword' }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.equal('Invalid credentials.');
  });

  it('should fail checkout without a token', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: 'mutation { checkout(items: [], freight: 10, paymentMethod: "boleto") { valorFinal } }'
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.equal('Authorization token is required.');
  });
});
