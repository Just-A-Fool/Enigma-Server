const bcrypt = require('bcryptjs');

const loginService = {
    findUser(db, username) {
        return db.from('users')
            .select('id', 'username', 'password')
            .where('username', username)
            .first();
    },
    checkPassword(given, dbPass) {
        return bcrypt.compare(given, dbPass);
    }
};

module.exports = loginService;