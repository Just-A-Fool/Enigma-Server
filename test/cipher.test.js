require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

describe('/cipher route', () => {
    let db;
    //password: 'Imnotverycreative452',
    let testUser = {
        username: 'fredward34',
        password: '$2a$12$NJCtOtSPEWBEOjak1VfKB.fFYodoWjLN0ZFsl8.arGW1Pbi28dXdi',
        email: 'somerandomemail@gmail.com'
    };
    let testCipher = {
        rotor1: { which: 'IV', shift: '4' },
        rotor2: { which: 'V', shift: '5' },
        rotor3: { which: 'I', shift: '1' },
        plug: { H: 'L', B: 'W', E: 'O' }
    };
    let invalidRotorWhich = {
        rotor1: { which: 'IV', shift: '4' },
        rotor2: { which: 'X', shift: '5' },
        rotor3: { which: 'I', shift: '1' },
        plug: { H: 'L', B: 'W', E: 'O' }
    };
    let invalidRotorShift = {
        rotor1: { which: 'IV', shift: '4' },
        rotor2: { which: 'V', shift: '26' },
        rotor3: { which: 'I', shift: '1' },
        plug: { H: 'L', B: 'W', E: 'O' }
    };
    let invalidPlugValue = {
        rotor1: { which: 'IV', shift: '4' },
        rotor2: { which: 'V', shift: '5' },
        rotor3: { which: 'I', shift: '1' },
        plug: { H: {key: 'value'}, B: 'W', E: 'O' }
    };
    let invalidPlugKey = {
        rotor1: { which: 'IV', shift: '4' },
        rotor2: { which: 'V', shift: '5' },
        rotor3: { which: 'I', shift: '1' },
        plug: { $: 'L', B: 'W', E: 'O' }
    };
    let invalidPlugType = {
        rotor1: { which: 'IV', shift: '4' },
        rotor2: { which: 'V', shift: '5' },
        rotor3: { which: 'I', shift: '1' },
        plug: ['this shouldnt be here']
    };
    let webToken = jwt.sign(
        {id: 1}, 
        process.env.JWT_SECRET, 
        {
            subject: 'fredward34',
            algorithm: 'HS256'
        });

    before('setup db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DATABASE_TEST_URL
        });

        app.set('db', db);
    });

    before(() => db.raw('truncate users, ciphers restart identity cascade'));

    afterEach(() => db.raw('truncate users, ciphers restart identity cascade'));

    after(() => db.destroy());

    describe('GET /cipher Route', () => {
        beforeEach(() => {
            return db.into('users').insert(testUser)
                .then(() => db.into('ciphers').insert({userid: 1, data: JSON.stringify(testCipher)}));
        });

        it('returns 200 with a list of ciphers if sucessful.', () => {
            return supertest(app)
                .get('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .expect(200)
                .then(resp => {
                    expect(resp.body).to.be.an('Array');
                    expect(resp.body.length).to.equal(1);
                    expect(resp.body[0].data).to.eql(JSON.stringify(testCipher));
                });
        });
    });

    describe('POST /cipher Route', () => {
        beforeEach(() => {
            return db.into('users').insert(testUser);
        });
        it('returns 201 if sucessful (INTEGRATION TEST)', () => {
            return supertest(app)
                .post('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .send(testCipher)
                .expect(201)
                .then(() => {
                    let test = db.select('*').from('ciphers').first();
                    test.then(data => {
                        expect(data.userid).to.equal(1);
                        expect(data.data).to.eql(JSON.stringify(testCipher));
                    });
                });
        });
        it('returns 400 if not provided with valid body', () => {
            return supertest(app)
                .post('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .send({rotor1:'something'})
                .expect(400, { message: 'Must provide valid body' });
        });
        it('returns 400 if provided with rotor containing illegal shift value', () => {
            return supertest(app)
                .post('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .send(invalidRotorShift)
                .expect(400, { message: 'Must provide valid rotors' });
        });
        it('returns 400 if provided with rotor containing illegal which value', () => {
            return supertest(app)
                .post('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .send(invalidRotorWhich)
                .expect(400, { message: 'Must provide valid rotors' });
        });


        it('returns 400 if provided with plug of incorrect type', () => {
            return supertest(app)
                .post('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .send(invalidPlugType)
                .expect(400, { message: 'Must provide valid plug' });
        });
        it('returns 400 if provided with plug with illegal key', () => {
            return supertest(app)
                .post('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .send(invalidPlugKey)
                .expect(400, { message: 'Must provide valid plug' });
        });
        it('returns 400 if provided with plug with illegal value', () => {
            return supertest(app)
                .post('/cipher')
                .set('Authorization', `Bearer ${webToken}`)
                .send(invalidPlugValue)
                .expect(400, { message: 'Must provide valid plug' });
        });
    });

    describe('DELETE /ciphers route', () => {
        beforeEach(() => {
            return db.into('users').insert(testUser)
                .then(() => db.into('ciphers').insert({userid: 1, data: JSON.stringify(testCipher)}));
        });
        it('returns 204 if sucessful (INTEGRATION TEST)', () => {
            return supertest(app)
                .delete('/cipher/1')
                .set('Authorization', `Bearer ${webToken}`)
                .expect(204)
                .then(() => {
                    db.from('ciphers').select('*')
                        .then(res => {
                            expect(res).to.be.an('Array');
                            expect(res.length).to.equal(0);
                        });
                });
        });
        it('returns 400 if unauthorized to delete/if no such id found', () => {
            return supertest(app)
                .delete('/cipher/123')
                .set('Authorization', `Bearer ${webToken}`)
                .expect(400);
        });
    });
});