process.env.JWT_SECRET = 'test-jwt-token';

const {expect} = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;