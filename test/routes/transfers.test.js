const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.QMgvo_lPe0Rdxpx7cay_hIkDAbjCK_--VD2fP0NTTqk';

beforeAll(async () => {
  //await app.db.migrate.rollback();
  //await app.db.migrate.latest();
  await app.db.seed.run()
})

test('Deve listar apenas as transferências do usuário', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Transfer #1')
    })
})

test('Deve inserir uma transferência com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({ description: 'Regular Transfer #1', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()})
    .then(async (res) => {
      console.log("🚀 ~ file: transfers.test.js:28 ~ .then ~ res:", res)
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Regular Transfer #1');

      const transactions = await app.db('transactions').where({transfer_id: res.body.id})
      expect(transactions).toHaveLength(2);
      expect(transactions[0].description).toBe('Transfer to acc #10001');
      expect(transactions[1].description).toBe('Transfer from acc #10000');
      expect(transactions[0].ammount).toBe('-100.00');
      expect(transactions[1].ammount).toBe('100.00');
      expect(transactions[0].acc_id).toBe('10000');
      expect(transactions[1].acc_id).toBe('10001');
    })
})

describe('Ao salvar uma transferência válida...', () => {
  let transferId;
  let income;
  let outcome;
  test('Deve retorna o status 201 e os dados da transferência', () => {
    return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({ description: 'Regular Transfer #1', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()})
    .then(async (res) => {
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Regular Transfer #1');
      transferId = res.body.id;
    });
  })

  test('As transações equivalente devem ter sido geradas', async() => {
    const transactions = await app.db('transactions').where({transfer_id: transferId}).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  })

  test('A transação de saída deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001');
      expect(outcome.ammount).toBe('-100.00');
      expect(outcome.acc_id).toBe('10000');
      expect(outcome.type).toBe('O');
  })

  test('A transação de entrada deve ser positiva', () => {
    expect(outcome.description).toBe('Transfer from acc #10000');
    expect(outcome.ammount).toBe('100.00');
    expect(outcome.acc_id).toBe('10001');
    expect(outcome.type).toBe('I');
  })

  test('Ambas devem referenciar a transferência que as originou', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  })
})