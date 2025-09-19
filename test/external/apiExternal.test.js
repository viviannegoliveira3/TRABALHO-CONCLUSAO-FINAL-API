const request = require('supertest');
const app = require('../../src/app');
const { expect } = require('chai');

describe('External Auth & Checkout API', () => {
  let token;
  const userCredentials = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123'
  };

  // Primeiro, registra um novo usuário para os testes
  before(async () => {
    await request(app)
      .post('/api/users/register')
      .send(userCredentials);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: userCredentials.email, password: userCredentials.password });
    expect(res.status).to.equal(200);
    expect(res.body.token).to.exist;
    token = res.body.token;
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: userCredentials.email, password: 'wrongpassword' });
    expect(res.status).to.equal(401);
  });

  it('should process checkout with a valid token', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 1, quantity: 1 }],
        freight: 10,
        paymentMethod: 'boleto'
      });
    // Um checkout bem-sucedido deve retornar status 200
    expect(res.status).to.equal(200);
    // A resposta deve conter o valor final calculado
    expect(res.body.valorFinal).to.equal(360); // (1 * 350) + 10
  });

  it('should fail checkout without a token', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({
        items: [{ productId: 1, quantity: 1 }],
        freight: 10,
        paymentMethod: 'boleto'
      });
    // O middleware de autenticação mockado ainda não retorna 401,
    // mas quando for implementado, este teste irá validar isso.
    // Por enquanto, esperamos o comportamento atual do mock.
    expect(res.status).to.equal(401);
  });
});
