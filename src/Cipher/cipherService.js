const enigmaService = {
    getAllCiphers(db, userid) {
        return db.select('id','data').from('ciphers').where({userid});
    },
    postCipher(db, post) {
        return db.into('ciphers')
            .insert(post)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    deleteCipher(db, id, userid) {
        return db.from('ciphers')
            .where({id, userid})
            .delete();
    }
};

module.exports = enigmaService;

