require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const bcrypt = require('bcryptjs');

describe('/signup route', () => {
    let db;
    let testUser = {
        username: 'fredward34',
        password: 'Imnotverycreative452',
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


    describe('POST /signup Route', () => {
        it('returns 400 if no username supplied', () => {
            return supertest(app)
                .post('/signup')
                .send({password: '123123123123', email: 'something@gmail.com'})
                .expect(400, {message: 'Must provide a username'});
        });
        it('returns 400 if no password supplied', () => {
            return supertest(app)
                .post('/signup')
                .send({username: 'fred', email: 'something@gmail.com'})
                .expect(400, {message: 'Must provide a password'});
        });
        it('returns 400 if no email supplied', () => {
            return supertest(app)
                .post('/signup')
                .send({password: '123123123123', username: 'fred'})
                .expect(400, {message: 'Must provide an email'});
        });


        //Password validation tests
        it('returns 400 if password is too short', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'username',
                    password: '1234567',
                    email: 'thisisemail@gmail.com'
                })
                .expect(400, {message: 'Password cannot be less than 8 characters long.'});
        });
        it('returns 400 if password is too long', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'username',
                    password: '12345678asdfasdfasdfasdkfjalskdjobvinoqwijosijdfojslkjdfosdifnsoidfjlaksjodifslkdnflskdjfassdfasdf',
                    email: 'thisisemail@gmail.com'
                })
                .expect(400, {message: 'Password cannot be longer than 32 characters.'});
        });
        it('returns 400 if password contains any spaces', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'username',
                    password: '12345678a assdfasdf',
                    email: 'thisisemail@gmail.com'
                })
                .expect(400, {message: 'Password cannot contain a space.'});
        });
        it('returns 400 if password isnt complex', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'username',
                    password: 'ThisDoesNotContainANumber',
                    email: 'thisisemail@gmail.com'
                })
                .expect(400, {message: 'Password must contain at least one lowercase letter, one uppercase letter and a number'});
        });


        //Email validation tests
        it('returns 400 if email contains any spaces', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'username',
                    password: '12345678aassdfasDf',
                    email: 'thisis email@gmail.com'
                })
                .expect(400, {message: 'Email cannot contain a space.'});
        });
        it('returns 400 if not an email', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'username',
                    password: '12345678aassdfasDf',
                    email: 'thisisnotanemail'
                })
                .expect(400, {message: 'Must provide valid email.'});
        });
        it('returns 400 if email is too long', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'username',
                    password: '12345678aassdfasDf',
                    email: 'thisisnotanemailsjfinsfi@a;slkdfj;alskdjf;alsdfasidfnisnfisjdfijasdifjoasdjfoais'
                })
                .expect(400, {message: 'Email cannot exceed 40 characters'});
        });


        //username validation tests
        it('returns 400 if username is too long', () => {
            return supertest(app)
                .post('/signup')
                .send({
                    username: 'usernameiswaytoolonginthiscaseandicannotletitbethatway',
                    password: '12345678aassdfasDf',
                    email: 'thi@tanes'
                })
                .expect(400, {message: 'Username cannot exceed 20 characters'});
        });




        it('returns 201 if created (Integration Test)', () => {
            return supertest(app)
                .post('/signup')
                .send(testUser)
                .expect(201)
                .then(() => {
                    let postCheck = db.from('users').select('username', 'password', 'email').first();
                    postCheck.then(res => {
                        expect(res.username).to.equal('fredward34');
                        expect(res.email).to.equal('somerandomemail@gmail.com');
                        expect(bcrypt.compare(res.password, '$2a$12$NJCtOtSPEWBEOjak1VfKB.fFYodoWjLN0ZFsl8.arGW1Pbi28dXdi'));
                    });
                });
        });

        context('users table has data', () => {
            beforeEach(() => {
                return db.into('users').insert(testUser);
            });

            it('returns 400 if username taken', () => {
                return supertest(app)
                    .post('/signup')
                    .send(testUser)
                    .expect(400, {message: 'Username is taken.'});
            });
            it('returns 400 if email taken', () => {
                return supertest(app)
                    .post('/signup')
                    .send({
                        username: 'newusername',
                        password: 'Imnotverycreative452',
                        email:'somerandomemail@gmail.com'
                    })
                    .expect(400, {message: 'Email is taken.'});
            });
        });
        
    });
});