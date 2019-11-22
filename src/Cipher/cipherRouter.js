const express = require('express');
const cipherService = require('./cipherService');
const xss = require('xss');


const cipherRouter = express.Router();

cipherRouter.get('/cipher', (req, res, next) => {
    let db = req.app.get('db');
    let userid = req.app.get('user').id;

    cipherService.getAllCiphers(db, userid)
        .then(resp => {
            if(resp) {
                return res.json(resp);
            }
        })
        .catch(next);
});

cipherRouter.post('/cipher', (req, res, next) => {
    let db = req.app.get('db');
    let { rotor1, rotor2, rotor3, plug } = req.body;
    if (!rotor1 || !rotor2 || !rotor3 || !plug) {
        return res.status(400).json({ message: 'Must provide valid body' });
    }


    
    for(let i = 1; i <= 3; i++) {
        let str = `rotor${i}`;
        let current = req.body[str];
        let validRotors = ['I','II','III','IV','V'];

        if(current.which && current.shift) {
            if(validRotors.includes(current.which) && current.shift >=0 && current.shift <= 25){
                //Do Nothing
            } else return res.status(400).json({ message: 'Must provide valid rotors' });
        } else return res.status(400).json({ message: 'Must provide valid rotors' });
    }


    
    if(typeof plug !== 'object' || Array.isArray(plug)) {
        return res.status(400).json({ message: 'Must provide valid plug' });
    }
    
    let plugBool = true;
    const alphabet = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('');
    Object.keys(plug).forEach(key => {
        if(!alphabet.includes(key) || !alphabet.includes(plug[key])) {
            plugBool = false;
        }
    });
    if(!plugBool) return res.status(400).json({ message: 'Must provide valid plug' });


    
    let body = {
        rotor1: { which: rotor1.which, shift: rotor1.shift },
        rotor2: { which: rotor2.which, shift: rotor2.shift },
        rotor3: { which: rotor3.which, shift: rotor3.shift },
        plug: plug
    }

    let cipher = {
        userid: req.app.get('user').id,
        data: JSON.stringify(body)
    };

    cipherService.postCipher(db, cipher)
        .then(resp => {
            if (resp) {
                return res.status(201).end();
            }
        })
        .catch(next);
});

// cipherRouter.patch('/api/:id', (req, res, next) => {
//     let db = req.app.get('db');
//     let id = 1;
//     let edit = {};

//     cipherService.patchCipher(db, xss(id), edit)
//         .then(resp => {
//         })
//         .catch(next);
// });

cipherRouter.delete('/cipher/:id', (req, res, next) => {
    let db = req.app.get('db');
    let id = xss(req.params.id);
    let userid = req.app.get('user').id;

    cipherService.deleteCipher(db, id, userid)
        .then(resp => {
            if(resp) {
                return res.status(204).end();
            }
            else return res.status(400).json({message: 'Failed delete request.'});
        })
        .catch(next);
});

module.exports = cipherRouter;