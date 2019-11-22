require('dotenv').config();
const {NODE_ENV} = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cipherRouter = require('./Cipher/cipherRouter');
const signupRouter = require('./SignUp/signupRouter');
const loginRouter = require('./Login/loginRouter');
const checkAuth = require('./Auth/checkAuth');

const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'dev';

app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());
app.use(cors());


app.use(signupRouter);
app.use(loginRouter);
app.use(checkAuth, cipherRouter);


app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } 
    else {
        console.error(error);
        response = { message: error.message };
    }
    res.status(500).json(response);
});


module.exports = app;