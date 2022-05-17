const request = require('supertest');
const app = require('../app');

jest.mock('../db/', () => ({
  query: () => jest.fn(),
}));

describe('Testing API routes', () => {
  it('Testing root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  describe("queues", () => {
    it("It should return the queues", async () => {
      const response = await request(app).get('/queues');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('queues');
      expect(response.body.queues).toHaveProperty('queueA');
      expect(response.body.queues).toHaveProperty('queueB');
    });

    it("It should add customer to queue", async () => {
      const response = await request(app).post('/queues/customer').send({ id: 1, name: 'Test'});

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('customer');
      expect(response.body.customer).toHaveProperty('id');
      expect(response.body.customer).toHaveProperty('name');
      expect(response.body.customer).toHaveProperty('queue');
      expect(response.body.customer).toHaveProperty('expire_at');
    });
  });
});