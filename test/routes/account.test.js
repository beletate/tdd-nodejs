const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/accounts';
let user;
let second_user;

beforeAll(async () => {
    const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, passwd: '12345' });
    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo!')

    const second_res = await app.services.user.save({ name: 'User Account #2', mail: `${Date.now()}@mail.com`, passwd: '12345' });
    second_user = { ...second_res[0] };
});

test('Deve listar apenas as contas do usuário', () => {
    return app.db('accounts')
        .insert([
            { name: 'Acc User #1', user_id: user.id },
            { name: 'Acc User #2', user_id: second_user.id },
        ])
        .then(() => request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.body.length).toBe(1);
                expect(res.body[0].name).toBe('Acc User #1');
            }))
});


test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: '#Acc 1' })
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(201);
            expect(result.body.name).toBe('#Acc 1')
        });
})

test('Não deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({})
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(400);
            expect(result.body.error).toBe('Nome é um atributo obrigatório.')
        });
})

test('Não deve inserir uma conta de nome duplicado, para o mesmo usuário', () => {
    return app.db('accounts')
        .insert({ name: 'Acc duplicada', user_id: user.id })
        .then(() => request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .send({ name: 'Acc duplicada' }))
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Já existe uma conta com esse nome.')
        })
})

test('Deve retornar uma conta por Id', () => {
    return app.db('accounts')
        .insert({ name: 'Acc By Id', user_id: user.id }, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc By Id');
            expect(res.body.user_id).toBe(user.id);
        })
})

test('Não deve retornar uma conta de outro usuário', () => {
    return app.db('accounts')
        .insert({ name: 'Acc User #2', user_id: second_user.id }, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Este recurso não pertence ao usuário.')
        })
})

test('Deve alterar uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc By Id', user_id: user.id }, ['id'])
        .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
            .send({ name: 'Acc Updated' }).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc Updated')
        })
})

test('Não deve alterar uma conta de outro usuário', () => {
    return app.db('accounts')
        .insert({ name: 'Acc User #2', user_id: second_user.id }, ['id'])
        .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
            .send({ name: 'Acc Updated' })
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Este recurso não pertence ao usuário.')
        })
})

test('Deve remover uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc to Remove', user_id: user.id }, ['id'])
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(204);
        })
})

test('Não deve remover uma conta de outro usuário', () => {
    return app.db('accounts')
        .insert({ name: 'Acc User #2', user_id: second_user.id }, ['id'])
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Este recurso não pertence ao usuário.')
        })
})