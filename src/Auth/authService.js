const authService = {
    getWithUsername(db, username) {
        return db.from('users')
            .select('*')
            .where({username})
            .first();
    }
};

module.exports = authService; 