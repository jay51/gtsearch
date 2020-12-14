const bcrypt = require('bcrypt');

function hashPassword(password) {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return hash;
}

function comparePassword(password, hash) {
    const saltRounds = 10;
    const match = bcrypt.compareSync(password, hash);
    return match;
}

module.exports = {
    hashPassword,
    comparePassword,
}
