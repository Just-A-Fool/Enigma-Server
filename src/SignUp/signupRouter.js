const express = require('express');
const signupService = require('./signupService');
const xss = require('xss');

const signupRouter = express.Router();

signupRouter.post('/signup', (req, res, next) => {
    let {username, password, email} = req.body;
    //If required fields aren't provided
    if(!username) {
        return res.status(400).json({message: 'Must provide a username'});
    }
    if(!password) {
        return res.status(400).json({message: 'Must provide a password'});
    }
    if(!email) {
        return res.status(400).json({message: 'Must provide an email'});
    }

    //Sanitizing input
    let xssU = xss(username);
    let xssP = xss(password);
    let xssE = xss(email);

    //If after sanitization given fields are changed the inputs are malicious and are returned
    if(xssU !== username || xssP !== password || xssE !== email) {
        return res.status(400).json({message: 'Invalid request'});
    }

    //Validates password
    let passError = signupService.validatePassword(xssP);
    if(passError) return res.status(400).json({message: passError});
    //Validates email
    let emailError = signupService.validateEmail(xssE);
    if(emailError) return res.status(400).json({message: emailError});

    //Checks to see if the username provided is taken
    signupService.checkUsername(req.app.get('db'), xssU)
        .then(user => {
            //If taken
            if(user) return res.status(400).json({message: 'Username is taken.'});
            //Checks to see if email has been used
            return signupService.checkEmail(req.app.get('db'), xssE)
                .then(email => {
                    //If taken
                    if(email) return res.status(400).json({message: 'Email is taken.'});

                    //Hashes the password for storage
                    return signupService.hashPass(xssP)
                        .then(hashed => {
                            //Creates and sends new user to database. 
                            let post = {username: xssU, password: hashed, email: xssE};
                            return signupService.insert(req.app.get('db'), post)
                                .then(resp => {
                                    if(resp) {
                                        return res.status(201).end();
                                    }
                                });
                        });
                });
        })
        .catch(next);
});

module.exports = signupRouter;