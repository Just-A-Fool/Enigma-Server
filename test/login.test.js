require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

describe('/login route', () => {
    let db;
    //password: 'Imnotverycreative452',
    let testUser = {
        username: 'fredward34',
        password: '$2a$12$NJCtOtSPEWBEOjak1VfKB.fFYodoWjLN0ZFsl8.arGW1Pbi28dXdi',
        email:'somerandomemail@gmail.com'
    };

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


    describe('POST /login Route', () => {
        it('returns 400 if no username supplied', () => {
            return supertest(app)
                .post('/login')
                .send({password: '123123123123'})
                .expect(400, {message: 'Must provide a username'});
        });
        it('returns 400 if no password supplied', () => {
            return supertest(app)
                .post('/login')
                .send({username: 'fred'})
                .expect(400, {message: 'Must provide a password'});
        }); 


        context('users table has data', () => {
            beforeEach(() => {
                return db.into('users').insert(testUser);
            });

            it('returns 401 if username is not found', () => {
                return supertest(app)
                    .post('/login')
                    .send({username: 'fred', password: 'test'})
                    .expect(401, {message: 'Authentication failed.'});
            });
            it('returns 401 if password is incorrect.', () => {
                return supertest(app)
                    .post('/login')
                    .send({username: 'fredward34', password: 'failing'})
                    .expect(401, {message: 'Authentication failed.'});
            });
            it('returns 200 with JWT if successful', function() {
                //If server takes too long to respond will change the token recieved.
                //Retries to prevent response time making it fail.
                this.retries(5);

                let expectedJWT = jwt.sign(
                    {id: 1}, 
                    process.env.JWT_SECRET, 
                    {
                        subject: 'fredward34',
                        algorithm: 'HS256'
                    });
                return supertest(app)
                    .post('/login')
                    .send({username: 'fredward34', password: 'Imnotverycreative452'})
                    .expect(200, {auth: expectedJWT});
            });
        }); 
        
    });
});