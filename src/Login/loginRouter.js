const express = require('express');
const {JWT_SECRET} = require('../config');
const loginService = require('./loginService');
const jwt = require('jsonwebtoken');
const xss = require('xss');

const loginRouter = express.Router();

loginRouter.post('/login', (req,res,next) => {
    let {username, password} = req.body;

    if(!username) return res.status(400).json({message: 'Must provide a username'});
    if(!password) return res.status(400).json({message: 'Must provide a password'});

    let xssUser = xss(username);
    let xssPass = xss(password);

    loginService.findUser(req.app.get('db'), xssUser)
        .then(user => {
            if(!user) return res.status(401).json({message: 'Authentication failed.'});

            loginService.checkPassword(xssPass, user.password)  
                .then(validatedPass => {
                    if(!validatedPass) return res.status(401).json({message: 'Authentication failed.'});

                    let token = jwt.sign({id: user.id}, JWT_SECRET, {subject: user.username, algorithm: 'HS256'});
                    return res.status(200).json({auth: token});
                });
        });
});


module.exports = loginRouter;