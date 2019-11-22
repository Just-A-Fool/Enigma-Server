const authService = require('./authService');
const jwt = require('jsonwebtoken');


function checkAuth (req, res, next) {
    let auth = req.headers.authorization;
    if(!auth.startsWith('Bearer ')) return res.status(401).json({message: 'Missing bearer token'});

    let token = auth.split(' ')[1];
    

    try {
        let verified = jwt.verify(token, process.env.JWT_SECRET, {algorithms: ['HS256']});

        authService.getWithUsername(req.app.get('db'), verified.sub)
            .then(user => {
                if(user) {
                    req.app.set('user', user);
                    next();
                }
                else return res.status(401).json({message: 'Invalid credentials'});
            });
        
    }
    catch(e) {
        return res.status(401).json({message: 'Invalid credentials'});
    }
    
}

module.exports= checkAuth;